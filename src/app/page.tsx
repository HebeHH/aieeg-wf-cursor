'use client';

import { ConferenceProvider } from './contexts/ConferenceContext';
import ConferenceApp from './components/ConferenceApp';

export default function Home() {
  return (
    <ConferenceProvider>
      <ConferenceApp />
    </ConferenceProvider>
  );
}
