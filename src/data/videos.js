// The Ghost Fees videos (4 Nov). Files live in public/videos. Where each goes: the demo
// on home and sign in; all three on /media (promo first); "How far we've come" on
// /progress next to the feedback board.
// seconds: real lengths read from the files.
export const VIDEOS = [
  { key: 'demo', emoji: '🧭', title: 'Demo', line: 'The app from start to finish: upload, every leak, cancel and Ghost It in ASI:One.', src: '/videos/ghost-fees-2-walkthrough.mp4', seconds: 125 },
  { key: 'promo', emoji: '👻', title: 'Promo', line: 'Why your bank statement is haunted and what we do about it.', src: '/videos/ghost-fees-1-promo.mp4', seconds: 92 },
  { key: 'progress', emoji: '📈', title: "How far we've come", line: 'Three days of feedback from testers and Fetch.ai and what we changed.', src: '/videos/ghost-fees-3-progress.mp4', seconds: 116 },
];

export const PROMO = VIDEOS.find((video) => video.key === 'promo');
export const DEMO = VIDEOS.find((video) => video.key === 'demo');
// Where each one goes (4 Nov): the demo on the home and sign-in pages, because people
// deciding to sign up want to see it working; the promo and how far we've come on
// /progress (the demo leads there too, for judges).
export const LOGIN_VIDEO = DEMO;

export const duration = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
