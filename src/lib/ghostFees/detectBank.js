// Works out which bank a statement came from, so rows from several files can be told apart.
// Uses the file name first, then tell-tale CSV headings. Returns null rather than guess.

const BY_NAME = [
  { label: 'CommBank', re: /comm ?bank|\bcba\b|netbank|^csvdata/i },
  { label: 'NAB', re: /\bnab\b|^nab[\W_]/i },
  { label: 'ANZ', re: /\banz\b|^anz[\W_]/i },
  { label: 'Westpac', re: /westpac|\bwbc\b/i },
  { label: 'ING', re: /\bing\b|^ing[\W_]/i },
  { label: 'Macquarie', re: /macquarie/i },
  { label: 'Bendigo', re: /bendigo/i },
  { label: 'Up', re: /^up[\W_]|\bup bank\b/i },
];

const BY_HEADINGS = [
  { label: 'Westpac', test: (head) => head.includes('narrative') && head.includes('debit amount') },
  { label: 'NAB', test: (head) => head.includes('transaction details') && head.includes('merchant name') },
];

export function detectBank(fileName = '', text = '') {
  const name = String(fileName).replace(/\.(csv|pdf)$/i, '').replace(/[_-]+/g, ' ');
  const byName = BY_NAME.find((bank) => bank.re.test(name) || bank.re.test(String(fileName)));
  if (byName) return byName.label;
  const head = String(text).slice(0, 400).split(/\r?\n/)[0].toLowerCase();
  return BY_HEADINGS.find((bank) => bank.test(head))?.label || null;
}

// "CommBank · CSVData.csv", or just the file name when the bank is unknown.
export function sourceLabel(fileName, text) {
  const bank = detectBank(fileName, text);
  return bank ? `${bank} · ${fileName}` : fileName;
}
