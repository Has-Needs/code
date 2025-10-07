/**
 * Has-Needs: Entrypoint
 * ---------------------
 * React app bootstrap: renders <App /> into the DOM.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Assumes your build outputs to public/index.html with 'root' div.
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
