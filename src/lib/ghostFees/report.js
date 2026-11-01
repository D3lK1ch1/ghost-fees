import { money, monthsLabel } from './format';
import { cancelInfo } from './cancelLinks';
import { findOverlaps } from './overlaps';

// The paid PDF report, built in the browser. Nothing is uploaded or stored.
export async function downloadReport(analysis, ghostList = []) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const line = (text, { size = 11, bold = false, color = [30, 24, 48], gap = 6 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const rows = doc.splitTextToSize(String(text), width - margin * 2);
    rows.forEach((row) => {
      if (y > height - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(row, margin, y);
      y += size + 3;
    });
    y += gap;
  };
  const heading = (text) => {
    y += 8;
    line(text, { size: 15, bold: true, color: [94, 60, 190], gap: 4 });
  };

  const months = monthsLabel(analysis.monthSpan);
  line('Ghost Fees report', { size: 24, bold: true, gap: 2 });
  line(`Statement ${analysis.firstDate || ''} to ${analysis.lastDate || ''} (${months} months). Made ${new Date().toLocaleDateString('en-AU')}.`, { size: 10, color: [110, 100, 130] });
  line(`Ghosts found: ${money(analysis.total)} in ${months} months, across ${analysis.leaks.length} ${analysis.leaks.length === 1 ? 'item' : 'items'}.`, { size: 13, bold: true });
  line('Real charges from your own statement. Nothing guessed.', { size: 10, color: [110, 100, 130] });

  if (analysis.leaks.length) {
    heading('What cost you money');
    analysis.leaks.forEach((leak, index) => {
      line(`${index + 1}. ${leak.title || leak.merchant}: ${money(leak.amount)} (${leak.badge})`, { bold: true, gap: 1 });
      if (leak.reason) line(leak.reason, { size: 10, color: [80, 72, 100] });
    });
  }

  const subs = [...(analysis.subscriptions || [])].sort((a, b) => b.monthly - a.monthly);
  if (subs.length) {
    heading('Your subscriptions');
    subs.forEach((sub) => {
      const info = cancelInfo(sub.merchant);
      line(`${sub.merchant}: ${money(sub.monthly)} a month`, { bold: true, gap: 1 });
      line(info.url ? `Cancel: ${info.url}  (${info.steps})` : info.steps, { size: 9.5, color: [80, 72, 100] });
    });
    const overlaps = findOverlaps(subs);
    if (overlaps.length) {
      heading('Double-ups');
      overlaps.forEach((group) => line(`${group.items.length} ${group.label}: ${group.items.map((item) => item.merchant).join(', ')}, ${money(group.yearly)} a year at these prices.`));
      line('People in this spot often keep one, rotate one per month, or move to a shared family plan.', { size: 10, color: [80, 72, 100] });
    }
  }

  if (ghostList.length) {
    heading('Ghost List');
    const label = { requested: 'Cancel requested', confirmed: 'Stopped', charging: 'Still charging' };
    ghostList.forEach((item) => line(`${item.merchant}: ${label[item.status] || item.status} (${money(item.monthly)} a month)`));
  }

  y += 10;
  line('General information about your own transactions only, not financial advice. Check each cancellation stopped on your next statement. hunt-ghost-fees.base44.app', { size: 9, color: [120, 110, 140] });

  doc.save(`ghost-fees-report-${analysis.lastDate || 'statement'}.pdf`);
}
