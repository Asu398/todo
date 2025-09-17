import React, { createRoot } from './mini-react.js';
import App from './App.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  createRoot(container).render(React.createElement(App));
});
