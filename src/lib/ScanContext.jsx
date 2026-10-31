import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { parseCsv } from '@/lib/ghostFees/parseCsv';
import { analyse, mergeTransactions } from '@/lib/ghostFees/analyse';
import { SAMPLE_CSV } from '@/lib/ghostFees/sampleStatement';

const STEP_COUNT = 4;

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

function initialSteps() {
  return Array.from({ length: STEP_COUNT }, (_, index) => (index === 0 ? 'active' : 'pending'));
}

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [steps, setSteps] = useState(initialSteps);
  const [progress, setProgress] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [results, setResults] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);

  const advance = useCallback((index) => {
    setSteps((current) => current.map((_, i) => (i < index ? 'done' : i === index ? 'active' : 'pending')));
    setProgress(Math.round((index / STEP_COUNT) * 100));
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResults(null);
    setFileErrors([]);
    setSteps(initialSteps());
    setProgress(0);
    setTransactionCount(0);
    setFileCount(0);
  }, []);

  const runScan = useCallback(async ({ files = [], useSample = false }) => {
    setFileErrors([]);
    setResults(null);
    setSteps(initialSteps());
    setProgress(4);
    setTransactionCount(0);
    setFileCount(files.length);
    setStatus('scanning');

    const lists = [];
    const errors = [];

    if (useSample) {
      lists.push(parseCsv(SAMPLE_CSV));
      await wait(600);
    } else {
      for (const file of files) {
        try {
          if (/\.csv$/i.test(file.name)) {
            const rows = parseCsv(await file.text());
            if (!rows.length) throw new Error('No transactions found in this file.');
            lists.push(rows);
          } else {
            throw new Error('Only CSV files are supported.');
          }
        } catch (error) {
          errors.push({
            name: file.name,
            message: error?.response?.data?.error || error?.message || 'Could not read this file.',
          });
        }
      }
    }

    const transactions = mergeTransactions(lists);

    if (!transactions.length) {
      setFileErrors(errors.length ? errors : [{ name: 'Statement', message: 'We could not find any transactions in that file.' }]);
      setStatus('idle');
      return null;
    }

    setTransactionCount(transactions.length);
    advance(1);
    await wait(700);
    advance(2);
    await wait(700);
    advance(3);
    const analysis = analyse(transactions);
    await wait(500);

    setSteps(Array.from({ length: STEP_COUNT }, () => 'done'));
    setProgress(100);
    setFileErrors(errors);
    setResults(analysis);
    setStatus('done');
    return analysis;
  }, [advance]);

  const value = useMemo(() => ({
    status,
    steps,
    progress,
    transactionCount,
    fileCount,
    results,
    fileErrors,
    runScan,
    reset,
  }), [status, steps, progress, transactionCount, fileCount, results, fileErrors, runScan, reset]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used inside ScanProvider');
  return context;
}