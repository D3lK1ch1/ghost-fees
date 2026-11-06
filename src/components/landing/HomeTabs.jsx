import { useEffect, useState } from 'react';
import { HOME_TAB_EVENT } from '@/components/landing/CatchTheRest';
import { cn } from '@/lib/utils';

// The home page below the stats, as tabs instead of one long scroll. A tester said
// "it took a lot of scrolling to digest the content on each page" (2 Nov).
export default function HomeTabs({ tabs }) {
  const fromHash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  const [active, setActive] = useState(tabs.some((tab) => tab.key === fromHash) ? fromHash : tabs[0]?.key);
  useEffect(() => {
    if (tabs.some((tab) => tab.key === fromHash)) document.querySelector('[data-tour="hometabs"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);  
  // Other parts of the page can open a tab (e.g. "Check typical prices").
  useEffect(() => {
    const open = (event) => {
      if (!tabs.some((tab) => tab.key === event.detail)) return;
      setActive(event.detail);
      document.querySelector('[data-tour="hometabs"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener(HOME_TAB_EVENT, open);
    return () => window.removeEventListener(HOME_TAB_EVENT, open);
  }, [tabs]);
  const current = tabs.find((tab) => tab.key === active) || tabs[0];
  return (
    <section data-tour="hometabs" className="mx-auto mt-6 w-full max-w-4xl" aria-label="More about Ghost Fees">
      <div className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-card/60 p-1" role="tablist" aria-label="More about Ghost Fees">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`home-tab-${tab.key}`}
            aria-selected={tab.key === current.key}
            aria-controls={`home-panel-${tab.key}`}
            onClick={() => setActive(tab.key)}
            className={cn('whitespace-nowrap rounded-full px-4 py-2 text-[14.5px] font-bold transition-colors', tab.key === current.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`home-panel-${current.key}`} aria-labelledby={`home-tab-${current.key}`}>
        {current.content}
      </div>
    </section>
  );
}
