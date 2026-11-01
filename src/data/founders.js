// All founder copy and photos in one place. Edit text here.
// Photos: add square images (400px or bigger) at public/founders/<key>.jpg (sanjay, bella, delia).
// Until a photo exists, the card shows initials.

export const FOUNDERS = [
  {
    key: 'sanjay',
    name: 'Sanjay',
    initials: 'S',
    role: 'Co-founder, data and detection',
    bio: 'Bioinformatician at Monash University with a Master of Data Science. By day he finds patterns in messy biological data; here he finds them in bank statements.',
    photo: '/founders/sanjay.jpg',
  },
  {
    key: 'bella',
    name: 'Bella',
    initials: 'B',
    role: 'Co-founder, product and money know-how',
    bio: 'Economics and Finance graduate with a Graduate Diploma in Financial Planning and accounting firm experience. Self-taught coder who built Ghost Fees on Base44.',
    photo: '/founders/bella.jpg',
  },
  {
    key: 'delia',
    name: 'Delia Kok',
    initials: 'DK',
    role: 'Co-founder, engineering',
    bio: 'Software engineer who studied at Deakin University. Looks after the code behind Ghost Fees, so the scan stays quick and your statement stays yours.',
    photo: '/founders/delia.jpg',
  },
];

export const WHY_LINE = 'We built Ghost Fees because forgotten subscriptions quietly cost real people real money, and cancelling should take minutes, not months.';

// FOUNDERS: replace this with your own moment, e.g. "We found $___ a month going to things we'd forgotten about."
export const MOMENT = '[FOUNDERS: fill in the moment that made you build this]';

export const DISCLAIMER = 'Ghost Fees gives general information about subscriptions and fees. It is not financial advice.';