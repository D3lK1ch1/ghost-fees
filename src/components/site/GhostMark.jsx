export default function GhostMark({ className = '', eyeColor = '#0e0d13' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 4C20.4 4 11 13.4 11 25v30.4c0 1.7 1.9 2.6 3.2 1.6l5.8-4.3c.9-.7 2.2-.7 3.1 0l5.6 4.2c1 .7 2.3.7 3.3 0l5.6-4.2c.9-.7 2.2-.7 3.1 0l5.8 4.3c1.3 1 3.2.1 3.2-1.6V25C53 13.4 43.6 4 32 4Z"
        fill="currentColor"
      />
      <ellipse cx="24.5" cy="26" rx="2.7" ry="3.6" fill={eyeColor} />
      <ellipse cx="39.5" cy="26" rx="2.7" ry="3.6" fill={eyeColor} />
      <circle cx="18.5" cy="32.5" r="2.6" fill="#ffb37c" opacity="0.5" />
      <circle cx="45.5" cy="32.5" r="2.6" fill="#ffb37c" opacity="0.5" />
      <path d="M28.5 33.5c1.1 1.6 2.3 2.4 3.5 2.4s2.4-.8 3.5-2.4" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
    </svg>
  );
}