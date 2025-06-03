# Add to Calendar button

Below is a quick “handoff” doc you can paste into a ticket or Slack-thread for your dev. It assumes you’re on **Next.js 14+ app router**, using **TypeScript** and want the nice React wrapper so you avoid Web-Component-in-SSR headaches.

---

## 0. Why this library?

* `add-to-calendar-button-react` is a tiny wrapper around the popular **Add-to-Calendar Button** web component.
* No Google API key, no OAuth flow – it just pops the user into GCal’s pre-filled “Create event” screen.
* It also autogenerates `.ics` files for Outlook/Apple if you ever decide to expose them.([npmjs.com][1])

---

## 1. Install

```bash
pnpm add add-to-calendar-button-react      # or npm / yarn
```

(If you ever need the lower-level web component instead, it’s `add-to-calendar-button`, but the wrapper is the path of least pain for Next.)([add-to-calendar-button.com][2])

---

## 2. Create a client-side component

Next ships every file under `app/` as *server* by default, which breaks web-only stuff.
Two common patterns:

### A) Simple `'use client'` file

```tsx
// app/components/AddToCal.tsx
'use client';

import { AddToCalendarButton } from 'add-to-calendar-button-react';
import 'add-to-calendar-button-react/dist/index.css'; // optional default styling

export default function AddToCal() {
  return (
    <AddToCalendarButton
      name="AI Agent SF #3 – Agent Protocols"
      options={['Google']}                 // only show Google
      startDate="2025-06-03"
      startTime="17:00"
      endDate="2025-06-03"
      endTime="20:30"
      timeZone="America/Los_Angeles"
      location="972 Mission St, SF CA 94103"
      description={`3rd AI Agent Meetup focusing on Agent Protocols.\nPizza + demos.`}
      buttonStyle="round"                  // or 'default', 'flat', … see docs
      size="small"                         // 'small' | 'default' | 'big'
      label="Add to Google Calendar"       // custom text
    />
  );
}
```

Then drop `<AddToCal />` wherever you need it.

### B) Dynamic import (if you hate `'use client'`)

```tsx
import dynamic from 'next/dynamic';

const AddToCalendarButton = dynamic(
  () =>
    import('add-to-calendar-button-react').then(
      (mod) => mod.AddToCalendarButton
    ),
  { ssr: false }
);
```

Same props as above.

---

## 3. Data-driven dates

If you’re fetching event data from your DB/API:

```tsx
const { title, startIso, endIso, tz, venue } = myEvent; // assume ISO strings

<AddToCalendarButton
  name={title}
  startDate={startIso.slice(0, 10)}      // 'YYYY-MM-DD'
  startTime={startIso.slice(11, 16)}     // 'HH:MM'
  endDate={endIso.slice(0, 10)}
  endTime={endIso.slice(11, 16)}
  timeZone={tz}
/>
```

The wrapper handles the ugly `YYYYMMDDThhmmssZ` conversion under the hood.

---

## 4. Styling / theming

* The library ships with CSS variables (`--atcb-bg`) for quick tweaks.
* You can also wrap the component, inspect the generated HTML (`<button class="atcb-link">`) and tailwind/className-override as needed.
* Dark-mode detection is baked in (prefers color-scheme).

---

## 5. Common gotchas

| Symptom                                  | Fix                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| **“`document is not defined`” on build** | Ensure the import lives only in a `'use client'` file or `ssr:false` dynamic import.        |
| Hydration mismatch warning               | Same as above – means the button rendered on server.                                        |
| Wrong times in Google                    | Always pass `timeZone`, *and* make sure your start/end times are in that zone (not UTC).    |
| Need recurring events                    | Not supported in this template flow – you’d have to jump to the Google Calendar API proper. |

---

## 6. Minimal test checklist

1. `pnpm dev` → hit `/events/slug`.
2. Click button → browser should open `https://calendar.google.com/calendar/render?...`.
3. Confirm title, time, location pre-filled, then “Save”.
4. Check calendar entry shows correct tz + duration.
5. Lighthouse pass (button is keyboard-focusable and ARIA-labelled).

---

### Final deliverable

* `AddToCal.tsx` component (≈20 LOC)
* Verify it works both locally and on Vercel preview.
* Optional: Storybook story so design can tweak styles.

That’s all – swapping in new event details is just prop changes. Ping me if anything blows up!

[1]: https://www.npmjs.com/package/add-to-calendar-button-react?utm_source=chatgpt.com "add-to-calendar-button-react - NPM"
[2]: https://add-to-calendar-button.com/use-with-nextjs?utm_source=chatgpt.com "How to install the Add to Calendar Button with Next.js"
