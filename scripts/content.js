// Nexus Helper - Content Script
// Captures console errors, network requests, and performance metrics

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__nexusHelperInjected) return;
  window.__nexusHelperInjected = true;

  // Store errors and network requests
  const consoleErrors = [];
  const networkRequests = [];
  const MAX_REQ_LOGS = 50;

  // Capture console errors
  const originalError = console.error;
  console.error = function (...args) {
    const errorInfo = {
      type: 'console.error',
      message: args.map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        }
        return String(arg);
      }).join(' '),
      stack: new Error().stack,
      timestamp: Date.now()
    };

    consoleErrors.push(errorInfo);
    // Keep only last 20
    if (consoleErrors.length > 20) {
      consoleErrors.shift();
    }

    // Send to background if needed
    try {
      chrome.runtime.sendMessage({
        action: 'consoleError',
        error: errorInfo
      }).catch(() => { });
    } catch (e) { }

    originalError.apply(console, args);
  };

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    const errorInfo = {
      type: 'uncaught',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || '',
      timestamp: Date.now()
    };

    consoleErrors.push(errorInfo);
    if (consoleErrors.length > 20) {
      consoleErrors.shift();
    }

    try {
      chrome.runtime.sendMessage({
        action: 'consoleError',
        error: errorInfo
      }).catch(() => { });
    } catch (e) { }
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      timestamp: Date.now()
    };

    consoleErrors.push(errorInfo);
    if (consoleErrors.length > 20) {
      consoleErrors.shift();
    }

    try {
      chrome.runtime.sendMessage({
        action: 'consoleError',
        error: errorInfo
      }).catch(() => { });
    } catch (e) { }
  });

  // Debounced broadcast: notify the widget that new network data is available
  let _broadcastTimer = null;
  const broadcastNetworkUpdate = () => {
    clearTimeout(_broadcastTimer);
    _broadcastTimer = setTimeout(() => {
      try {
        chrome.runtime.sendMessage({
          action: 'networkDataUpdated',
          count: networkRequests.length
        }).catch(() => {});
      } catch (e) { /* extension context invalidated */ }
    }, 300); // debounce 300ms to batch rapid requests
  };

  // Helper to store request
  const storeRequest = (req) => {
    networkRequests.push(req);
    if (networkRequests.length > MAX_REQ_LOGS) {
      networkRequests.shift();
    }
    broadcastNetworkUpdate();
  };

  // Capture page-world fetch/xhr via main-world script bridge (postMessage)
  // Network interception lives in main-world-network.js — the isolated world
  // cannot see page-initiated fetch/XHR, so we rely on the main-world hook only.
  function injectMainWorldNetworkHook() {
    try {
      if (!chrome?.runtime?.id) return; // Extension context invalidated
      const url = chrome.runtime.getURL('scripts/main-world-network.js');
      if (!url || url.startsWith('chrome-extension://invalid/')) return;
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = () => script.remove();
      script.onerror = () => {}; // Avoid console noise if load fails
      (document.documentElement || document.head || document.body).appendChild(script);
    } catch (e) {
      // Extension context invalidated or getURL failed
    }
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== 'NEXUS_NETWORK_LOG') return;
    if (!event.data.payload) return;
    storeRequest(event.data.payload);
  });

  injectMainWorldNetworkHook();

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getDebugInfo') {
      // Get performance metrics
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      const lcpEntry = performance.getEntriesByName('largest-contentful-paint')[0];

      sendResponse({
        errors: consoleErrors.slice(-MAX_REQ_LOGS).reverse(),
        network: networkRequests.slice(-MAX_REQ_LOGS).reverse(),
        performance: {
          loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.startTime) : null,
          domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.startTime) : null,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
          lcp: lcpEntry?.startTime || null
        },
        url: window.location.href,
        title: document.title
      });
      return true;
    }

    if (message.action === 'getSelectedText') {
      const selection = window.getSelection()?.toString() || '';
      sendResponse({ selectedText: selection.slice(0, 2000) }); // Limit length
      return true;
    }

    if (message.action === 'clearDebugInfo') {
      consoleErrors.length = 0;
      networkRequests.length = 0;
      sendResponse({ ok: true });
      return true;
    }
  });

  // Report ready
  console.log('[Nexus Helper] Content script injected and monitoring');
})();
