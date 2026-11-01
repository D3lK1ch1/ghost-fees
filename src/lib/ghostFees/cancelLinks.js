// Official cancel pages for common Australian subscriptions.
// Matched against the cleaned merchant name, case-insensitive.
// Never guess a link: anything unknown gets the fallback steps instead.
const CANCEL_LINKS = [
  { name: 'Netflix', match: /NETFLIX/i, url: 'https://www.netflix.com/cancelplan', steps: 'Confirm cancel.' },
  { name: 'Spotify', match: /SPOTIFY/i, url: 'https://support.spotify.com/article/cancel-premium/', steps: 'Account > Manage your plan > Cancel subscription.' },
  { name: 'Disney+', match: /DISNEY/i, url: 'https://www.disneyplus.com/account', steps: 'Account > Subscription > Cancel subscription.' },
  { name: 'Stan', match: /\bSTAN\b/i, url: 'https://my.stan.com.au', steps: 'Manage Account > Subscription Information > Cancel your subscription. Web browser only.' },
  { name: 'BINGE', match: /BINGE/i, url: 'https://binge.com.au', steps: 'My Account > Cancel Subscription. Billed by Telstra? My Telstra > Your subscriptions.' },
  { name: 'Kayo', match: /KAYO/i, url: 'https://kayosports.com.au', steps: 'My Account > Cancel Subscription. Billed by Telstra? Use My Telstra.' },
  { name: 'Amazon Prime', match: /AMAZON\s*PRIME|PRIME\s*VIDEO|AMZN\s*PRIME/i, url: 'https://www.amazon.com.au/gp/primecentral', steps: 'Prime Membership > Update, cancel and more > End membership.' },
  { name: 'YouTube Premium', match: /YOUTUBE/i, url: 'https://www.youtube.com/paid_memberships', steps: 'Manage membership > Deactivate.' },
  { name: 'ChatGPT', match: /OPENAI|CHATGPT/i, url: 'https://help.openai.com/en/articles/7232927', steps: 'Settings > Billing > Cancel plan.' },
  { name: 'Adobe', match: /ADOBE/i, url: 'https://account.adobe.com/plans', steps: 'Manage plan > Cancel your plan.' },
  { name: 'Microsoft 365', match: /MICROSOFT|MSFT|OFFICE\s*365/i, url: 'https://account.microsoft.com/services', steps: 'Manage > Cancel subscription.' },
  { name: 'Apple', match: /APPLE|ITUNES|ICLOUD/i, url: 'https://support.apple.com/HT202039', steps: 'Settings > your name > Subscriptions > Cancel.' },
  { name: 'Google Play', match: /GOOGLE/i, url: 'https://play.google.com/store/account/subscriptions', steps: 'Select the app > Cancel subscription.' },
  { name: 'Canva', match: /CANVA/i, url: 'https://www.canva.com/settings/billing-and-plans', steps: 'Cancel subscription.' },
];

export const APP_STORE_NOTE = 'Signed up through your iPhone or Android? Cancel in Apple or Google Play instead.';

export function cancelInfo(merchant = '') {
  const found = CANCEL_LINKS.find((item) => item.match.test(merchant));
  if (found) return { name: found.name, url: found.url, steps: found.steps };
  return {
    name: merchant,
    url: null,
    steps: "No checked cancel link yet. Search their official site for \"cancel subscription\", or check your sign-up email.",
  };
}
