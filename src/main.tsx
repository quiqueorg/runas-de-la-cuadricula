import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

const root = document.querySelector('#app');
if (root) createRoot(root).render(<StrictMode><App /></StrictMode>);
