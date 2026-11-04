import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { parseCsv } from '@/lib/ghostFees/parseCsv';
import { analyse, mergeTransactions } from '@/lib/ghostFees/analyse';
import { SAMPLE_CSV } from '@/lib/ghostFees/sampleStatement';
import { sourceLabel } from '@/lib/ghostFees/detectBank';
import { loadGhostList, saveGhostList } from '@/lib/ghostFees/ghostList';
import { checkGhosts } from '@/lib/ghostFees/ghostCheck';
import { rememberRealTotal } from '@/lib/ghostFees/payback';
import { toast } from '@/components/ui/use-toast';

const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

// Monthly ghost check: a new statement updates Ghost List items still "Requested"
// (charged again -> Still charging, quiet for 35+ days -> Confirmed). In the browser only.
function runGhostCheck(transactions) {
  const { items, changes } = checkGhosts(loadGhostList(), transactions);
  if (!changes.length) return;
  saveGhostList(items);
  changes.filter((change) => change.kind === 'charging').forEach((change) => {
    toast({ title: `${change.merchant} charged you again on ${shortDate(change.date)}`, description: 'Marked Still charging on your Ghost List. Send them your proof and ask for a refund.' });
  });
  const confirmed = changes.filter((change) => change.kind === 'confirmed');
  if (confirmed.length) {
    toast({ title: `Confirmed stopped: ${confirmed.map((change) => change.merchant).join(', ')}`, description: 'No charges on your statement since you ghosted them.' });
  }
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// A PDF that takes longer than this shows an error instead of spinning forever.
// The server may still finish (and still uses its credits); that late result is ignored.
const PDF_TIMEOUT_MS = 120 * 1000;
const PDF_TIMEOUT_MESSAGE = 'This statement took too long to read. Try again, export a shorter date range, or upload a CSV instead.';
// PDFs read at the same time. Each one is a separate AI call, so keep it small.
const PARALLEL_FILES = 3;

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Runs fn on every item, at most `limit` at once. Results keep the items' order.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function readPdf(file, ticket) {
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  const response = await base44.functions.invoke('parseStatement', { file_uri, ticket });
  return response?.data || {};
}

// One file -> { rows, label } or { error }. Never throws.
async function readFile(file, ticket) {
  try {
    // Same limit is checked again on the server for PDFs.
    if (file.size > MAX_FILE_BYTES) throw new Error('This file is over 5 MB. Try exporting a shorter date range.');
    if (/\.csv$/i.test(file.name)) {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) throw new Error('No transactions found in this file.');
      return { rows, label: sourceLabel(file.name, text) };
    }
    if (/\.pdf$/i.test(file.name)) {
      const data = await withTimeout(readPdf(file, ticket), PDF_TIMEOUT_MS, PDF_TIMEOUT_MESSAGE);
      if (data.error) return { error: { name: file.name, message: data.error } };
      if (Array.isArray(data.transactions) && data.transactions.length) {
        return { rows: data.transactions, label: sourceLabel(file.name) };
      }
      return { error: { name: file.name, message: 'No transactions found in this PDF.' } };
    }
    throw new Error("This isn't a CSV or PDF.");
  } catch (error) {
    return {
      error: {
        name: file.name,
        message: error?.response?.data?.error || error?.message || 'Could not read this file.',
      },
    };
  }
}

const STEP_COUNT = 4;

function initialSteps() {
  return Array.from({ length: STEP_COUNT }, (_, index) => (index === 0 ? 'active' : 'pending'));
}

// Keep only the last N months of the statement, counted back from its newest date.
function withinMonths(transactions, months) {
  if (!months) return transactions;
  const dated = transactions.filter((item) => item.date).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!dated.length) return transactions;
  const cutoff = new Date(`${dated[0].date}T00:00:00Z`);
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - (months - 1));
  const floor = cutoff.toISOString().slice(0, 10);
  return transactions.filter((item) => !item.date || item.date >= floor);
}

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [steps, setSteps] = useState(initialSteps);
  const [progress, setProgress] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [transactions, setTransactions] = useState(null);
  const [windowMonths, setWindowMonths] = useState(0);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [usedSample, setUsedSample] = useState(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactions(null);
    setWindowMonths(0);
    setFileErrors([]);
    setFileNames([]);
    setSteps(initialSteps());
    setProgress(0);
    setTransactionCount(0);
    setFileCount(0);
  }, []);

  const runScan = useCallback(async ({ files = [], useSample = false, ticket = '' }) => {
    setFileErrors([]);
    setTransactions(null);
    setWindowMonths(0);
    setSteps(initialSteps());
    setProgress(4);
    setTransactionCount(0);
    setFileCount(files.length);
    setStatus('scanning');

    const lists = [];
    const errors = [];
    const names = [];

    if (useSample) {
      lists.push(parseCsv(SAMPLE_CSV).map((row) => ({ ...row, source: 'Sample statement' })));
      names.push('Sample statement');
    } else {
      const results = await mapLimit(files, PARALLEL_FILES, (file) => readFile(file, ticket));
      results.forEach((result) => {
        if (result.error) {
          errors.push(result.error);
          return;
        }
        lists.push(result.rows.map((row) => ({ ...row, source: result.label })));
        names.push(result.label);
      });
    }

    const transactions = mergeTransactions(lists);

    if (!transactions.length) {
      setFileErrors(errors.length ? errors : [{ name: 'Statement', message: 'We could not find any transactions in that file.' }]);
      setStatus('idle');
      return null;
    }

    setTransactionCount(transactions.length);
    const analysis = analyse(transactions);

    setSteps(Array.from({ length: STEP_COUNT }, () => 'done'));
    setProgress(100);
    setFileErrors(errors);
    setFileNames(names);
    setTransactions(transactions);
    setUsedSample(Boolean(useSample));
    if (!useSample) rememberRealTotal(analysis.total);
    setStatus('done');
    runGhostCheck(transactions);
    return analysis;
  }, []);

  const results = useMemo(
    () => (transactions ? analyse(withinMonths(transactions, windowMonths)) : null),
    [transactions, windowMonths],
  );

  const value = useMemo(() => ({
    status,
    steps,
    progress,
    transactionCount,
    fileCount,
    results,
    windowMonths,
    setWindowMonths,
    fileErrors,
    fileNames,
    usedSample,
    runScan,
    reset,
  }), [status, steps, progress, transactionCount, fileCount, results, windowMonths, fileErrors, fileNames, usedSample, runScan, reset]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used inside ScanProvider');
  return context;
}