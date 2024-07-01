import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = function(callback, options) {
    var start = Date.now();
    return setTimeout(function() {
      callback({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, options && options.timeout ? options.timeout : 1);
  };
}

if (typeof window !== 'undefined' && !window.cancelIdleCallback) {
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
