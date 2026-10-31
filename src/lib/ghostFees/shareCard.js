import { money, monthsLabel } from './format';

// Draws a shareable result image in the browser. Only the total and months go on it,
// never merchants or transactions.

const GHOST_PATH = 'M32 4C20.4 4 11 13.4 11 25v30.4c0 1.7 1.9 2.6 3.2 1.6l5.8-4.3c.9-.7 2.2-.7 3.1 0l5.6 4.2c1 .7 2.3.7 3.3 0l5.6-4.2c.9-.7 2.2-.7 3.1 0l5.8 4.3c1.3 1 3.2.1 3.2-1.6V25C53 13.4 43.6 4 32 4Z';
const SIZE = 1080;

function drawGhost(ctx, x, y, scale, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(255,255,255,0.35)';
  ctx.shadowBlur = 30 / scale;
  ctx.fillStyle = '#f4efe8';
  ctx.fill(new Path2D(GHOST_PATH));
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a1230';
  [[24.5, 26], [39.5, 26]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 2.7, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = '#1a1230';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(28.5, 33.5);
  ctx.quadraticCurveTo(32, 37, 35.5, 33.5);
  ctx.stroke();
  ctx.restore();
}

export async function makeShareCard({ total, months, ghosts }) {
  if (document.fonts?.load) {
    await Promise.all(['700 170px Fredoka', '600 64px Fredoka', '700 34px Nunito'].map((font) => document.fonts.load(font).catch(() => null)));
  }
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, SIZE);
  sky.addColorStop(0, '#1e1236');
  sky.addColorStop(1, '#0f0a1e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + ((i * 37) % 10) / 25})`;
    ctx.fillRect((i * 263) % SIZE, (i * 151) % 520, 3, 3);
  }

  ctx.save();
  ctx.shadowColor = 'rgba(245,239,224,0.6)';
  ctx.shadowBlur = 80;
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath();
  ctx.arc(860, 200, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawGhost(ctx, 120, 150, 3.2, 0.5);
  drawGhost(ctx, 400, 230, 4.2);
  drawGhost(ctx, 700, 330, 2.4, 0.7);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5f1ea';
  ctx.font = '600 64px Fredoka, Nunito, sans-serif';
  ctx.fillText('I found', SIZE / 2, 640);

  ctx.save();
  ctx.shadowColor = 'rgba(255,154,60,0.55)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ff9a3c';
  ctx.font = '700 170px Fredoka, Nunito, sans-serif';
  ctx.fillText(money(total), SIZE / 2, 800);
  ctx.restore();

  ctx.fillStyle = '#f5f1ea';
  ctx.font = '600 52px Fredoka, Nunito, sans-serif';
  ctx.fillText(`of ghost fees in ${monthsLabel(months)} months`, SIZE / 2, 880);

  ctx.fillStyle = '#c3b8db';
  ctx.font = '700 34px Nunito, sans-serif';
  ctx.fillText(`${ghosts} ${ghosts === 1 ? 'ghost' : 'ghosts'} found · hunt-ghost-fees.base44.app`, SIZE / 2, 990);

  return new Promise((resolve) => { canvas.toBlob(resolve, 'image/png'); });
}

// Uses the phone's share sheet when it can take an image, otherwise downloads the PNG.
export async function shareResult(details) {
  const blob = await makeShareCard(details);
  if (!blob) return 'failed';
  const file = new File([blob], 'ghost-fees-result.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Ghost Fees', text: `I found ${money(details.total)} of ghost fees` });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ghost-fees-result.png';
  link.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
