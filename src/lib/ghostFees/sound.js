// Tiny spooky sound effects, made with Web Audio so there are no files to load.
// Only plays after the user turns sound on.

let context = null;

function audio() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!context) context = new Ctx();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(ctx, { type = 'sine', from, to = from, start = 0, length = 0.3, volume = 0.15 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const at = ctx.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

// A low wobbling "boooo" that slides down.
export function playBoo() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, { type: 'triangle', from: 420, to: 160, length: 0.7, volume: 0.12 });
  tone(ctx, { type: 'sine', from: 430, to: 165, length: 0.7, volume: 0.06 });
}

// A door creak: a buzzy tone that bends up and down.
export function playCreak() {
  const ctx = audio();
  if (!ctx) return;
  tone(ctx, { type: 'sawtooth', from: 90, to: 140, length: 0.25, volume: 0.04 });
  tone(ctx, { type: 'sawtooth', from: 140, to: 80, start: 0.22, length: 0.3, volume: 0.035 });
}

// A bright little chime for a ghost-free house.
export function playChime() {
  const ctx = audio();
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, index) => {
    tone(ctx, { from: freq, start: index * 0.12, length: 0.5, volume: 0.1 });
  });
}
