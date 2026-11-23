/** Entry point: wires the saved settings to the audio, starts cloud sync and renders the app. */
import './app/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { startCloudSync } from './core/progress/cloud';
import { getProgress, subscribe } from './core/progress/store';
import { configureAudio } from './shared/audio/audio';
import { registerSymbols } from './shared/icons/registry';
import { SHELL_SYMBOLS } from './shared/icons/shellSymbols';

registerSymbols(SHELL_SYMBOLS);

configureAudio(getProgress().settings);
subscribe(() => configureAudio(getProgress().settings));
void startCloudSync();

// `?test` exposes the catalog self-test in the console (see README.md).
if (/[?&]test\b/.test(location.search)) {
  void import('./app/selfTest').then(({ installSelfTest }) => installSelfTest());
}

const root = document.querySelector('#app');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
