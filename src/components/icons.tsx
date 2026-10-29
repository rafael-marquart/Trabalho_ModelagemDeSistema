import React from "react";

// Small line icons drawn on a 24px grid, sharing the stroke style of the entry page icons. Decorative: always aria-hidden.
const paths = {
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  people: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.8 14.2c2.2.2 3.9 1.8 4.4 4.3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6" /></>,
  building: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20" /><path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V20" /><path d="M3.5 20h17" /><path d="M8.5 8h3M8.5 11.5h3M8.5 15h3" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></>
} as const;

export type IconName = keyof typeof paths;

export default function Icon({ name }: { name: IconName }) {
  return <svg className="ui-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
