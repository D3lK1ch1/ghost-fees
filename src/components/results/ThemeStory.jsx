import { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import ExStory from './ExStory';
import ChristmasStory from './ChristmasStory';

// A short story at the top of the results, skinned by the theme.
// Uses only real numbers from the analysis. Haunted has its own house, so no story here.
export default function ThemeStory({ subscriptions = [], leaks = [], leaksTotal = 0, onMoveOn, avatarFor }) {
  const { theme } = useTheme();
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;
  if (theme.key === 'ex') return <ExStory theme={theme} subscriptions={subscriptions} avatarFor={avatarFor} onSkip={() => setHidden(true)} onMoveOn={onMoveOn} />;
  if (theme.key === 'christmas') {
    return <ChristmasStory subscriptions={subscriptions} leaks={leaks} leaksTotal={leaksTotal} onSkip={() => setHidden(true)} onMoveOn={onMoveOn} />;
  }
  return null;
}
