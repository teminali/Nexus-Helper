(() => {
  if (window.__nexusMainWorldNetHook) return;
  window.__nexusMainWorldNetHook = true;

  const emit = (payload) => {
    try { window.postMessage({ type: 'NEXUS_NETWORK_LOG', payload }, '*'); } catch (e) {}
  };

  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (...args) {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource?.url || 'unknown';
      const method = (config?.method || 'GET').toUpperCase();
      const startedAt = Date.now();
      const start = performance.now();
      try {
        const response = await originalFetch.apply(this, args);
        const entry = { type: 'fetch', url: String(url), method, status: response.status, statusText: response.statusText, duration: Math.round(performance.now() - start), timestamp: startedAt };
        // Capture response body for failed requests
        if (response.status >= 400) {
          try {
            const clone = response.clone();
            const body = await clone.text();
            entry.responseBody = body.slice(0, 1000);
          } catch (_) {}
        }
        emit(entry);
        return response;
      } catch (error) {
        emit({ type: 'fetch', url: String(url), method, status: 0, error: error?.message || 'Fetch failed', duration: Math.round(performance.now() - start), timestamp: startedAt });
        throw error;
      }
    };
  }

  const NativeXHR = window.XMLHttpRequest;
  if (NativeXHR) {
    window.XMLHttpRequest = function () {
      const xhr = new NativeXHR();
      let method = 'GET';
      let url = '';
      let startedAt = Date.now();
      let start = 0;
      const open = xhr.open;
      xhr.open = function (m, u, ...rest) {
        method = (m || 'GET').toUpperCase();
        url = String(u || '');
        return open.call(this, m, u, ...rest);
      };
      const send = xhr.send;
      xhr.send = function (...rest) {
        startedAt = Date.now();
        start = performance.now();
        xhr.addEventListener('loadend', () => {
          const entry = { type: 'xhr', url, method, status: xhr.status || 0, statusText: xhr.statusText || '', duration: Math.round(performance.now() - start), timestamp: startedAt };
          // Capture response body for failed requests
          if (xhr.status >= 400) {
            try { entry.responseBody = String(xhr.responseText || '').slice(0, 1000); } catch (_) {}
          }
          emit(entry);
        });
        return send.apply(this, rest);
      };
      return xhr;
    };
  }
})();
