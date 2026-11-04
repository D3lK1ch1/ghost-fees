// The Ghost Fees videos (4 Nov). Files live in public/videos. A video with no src yet
// shows as "coming soon", so adding one later is just its file name here.
// seconds: real lengths read from the files.
export const VIDEOS = [
  { key: 'demo', emoji: '⚡', title: '60-second demo', line: 'Upload, see every leak, cancel in one click.', src: null, seconds: 60 },
  { key: 'promo', emoji: '👻', title: 'Promo', line: 'Why your bank statement is haunted, and what we do about it.', src: '/videos/ghost-fees-1-promo.mp4', seconds: 92 },
  { key: 'walkthrough', emoji: '🧭', title: 'Full walkthrough', line: 'Every tab, the three themes and Ghost It in ASI:One.', src: '/videos/ghost-fees-2-walkthrough.mp4', seconds: 125 },
  { key: 'progress', emoji: '📈', title: '3 days of feedback', line: 'What testers and Fetch.ai told us, and what we changed.', src: '/videos/ghost-fees-3-progress.mp4', seconds: 116 },
];

export const PROMO = VIDEOS.find((video) => video.key === 'promo');
// Sign-in pages show the 60-second demo once its file is added, the promo until then.
export const LOGIN_VIDEO = VIDEOS.find((video) => video.key === 'demo' && video.src) || PROMO;

export const duration = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
