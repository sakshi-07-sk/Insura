import '@testing-library/jest-dom';

// Polyfill window.scrollTo if missing in jsdom
if (!window.scrollTo) {
  window.scrollTo = () => {};
}

// Polyfill ResizeObserver for charts in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
