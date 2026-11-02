export const BADGE_TONES = {
  Duplicate: 'bg-[#fde2e7] text-[#a3173b]',
  'Price creep': 'bg-[#ffe6cc] text-[#a24a00]',
  'Trial converted': 'bg-[#e9e2ff] text-[#5a34c4]',
  'Bank fee': 'bg-[#dbe9ff] text-[#1f4fa8]',
  Overlap: 'bg-[#f3e6ff] text-[#6b2fa8]',
  'Borrowing cost': 'bg-[#fbe0dc] text-[#96331b]',
  Surcharge: 'bg-[#e0eeff] text-[#22557f]',
  'Still using this?': 'bg-[#d8f5e6] text-[#17734a]',
};
// What each kind of ghost means, in plain words, and what to do. Shown under the
// filter chips and on each card's badge. "What's trial converted?" (2 Nov)
export const BADGE_MEANING = {
  Duplicate: { what: 'Charged twice for the same thing, on the same day or close together.', todo: 'Ask for the extra charge back.' },
  'Price creep': { what: 'A regular charge that quietly went up.', todo: 'Check it’s still worth it, or ask for the old price.' },
  'Trial converted': { what: 'A free trial that turned into a paid subscription.', todo: 'Cancel it if you don’t use it, and ask for a refund of the first charge.' },
  'Bank fee': { what: 'Fees your bank charged, like a monthly account fee or an overdrawn fee.', todo: 'Ask for a waiver, or move to a no-fee account.' },
  Overlap: { what: 'Two or more services doing the same job.', todo: 'Keep one, or rotate them month to month.' },
  'Borrowing cost': { what: 'Interest or fees for borrowing, like a cash advance or late payment.', todo: 'Pay it off first, and ask about a hardship plan if needed.' },
  Surcharge: { what: 'An extra fee for paying a certain way, like a card surcharge.', todo: 'Pay another way next time, like bank transfer.' },
  'Still using this?': { what: 'A regular charge you might have forgotten.', todo: 'Cancel it if you don’t use it.' },
};
