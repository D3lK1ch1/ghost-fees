// The Ghost Fees logo from the logo concepts design (A · Receipt Ghost): the torn
// receipt edge is the ghost's tail, with two faint receipt lines and a mint total.
export default function ReceiptGhost({ className = '', width = 30 }) {
  return (
    <svg width={width} height={Math.round(width * 1.18)} viewBox="0 0 100 118" className={className} role="img" aria-label="Ghost Fees logo">
      <path d="M16 52C16 24 31 8 50 8C69 8 84 24 84 52V100L76 110L68 100L59 110L50 100L41 110L32 100L24 110L16 100Z" fill="#fbf8fa" stroke="#15131a" strokeWidth="5.5" strokeLinejoin="round" />
      <ellipse cx="39" cy="46" rx="5" ry="6.5" fill="#15131a" />
      <ellipse cx="61" cy="46" rx="5" ry="6.5" fill="#15131a" />
      <circle cx="40.6" cy="43.8" r="1.6" fill="#fbf8fa" />
      <circle cx="62.6" cy="43.8" r="1.6" fill="#fbf8fa" />
      <path d="M44 58q6 5 12 0" stroke="#15131a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M32 74H68M32 84H58" stroke="#15131a" strokeWidth="4" strokeLinecap="round" opacity=".22" />
      <path d="M62 84H68" stroke="#5ee6c8" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
