// Nexus Helper - Background Service Worker
// Handles screenshot capture, storage coordination, and message routing

importScripts('storage.js');

// Track console errors per tab using session storage (survives service worker restarts)
const tabErrorsCache = new Map(); // in-memory cache for fast sync access

async function getTabErrors(tabId) {
  if (tabErrorsCache.has(tabId)) return tabErrorsCache.get(tabId);
  try {
    const key = `tabErrors_${tabId}`;
    const result = await chrome.storage.session.get([key]);
    const errors = result[key] || [];
    tabErrorsCache.set(tabId, errors);
    return errors;
  } catch (e) {
    return [];
  }
}

async function pushTabError(tabId, error) {
  const errors = await getTabErrors(tabId);
  errors.push(error);
  if (errors.length > 20) errors.shift();
  tabErrorsCache.set(tabId, errors);
  try {
    await chrome.storage.session.set({ [`tabErrors_${tabId}`]: errors });
  } catch (e) { /* session storage unavailable */ }
}

async function clearTabErrors(tabId) {
  tabErrorsCache.delete(tabId);
  try {
    await chrome.storage.session.remove([`tabErrors_${tabId}`]);
  } catch (e) { /* ignore */ }
}

// Screenshot capture
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'copyScreenshot') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ ok: false, error: 'No active tab' });
          return;
        }

        const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

        // Store in clipboard history
        await Storage.addToClipboardHistory({
          type: 'screenshot',
          content: dataUrl,
          preview: '📷 Screenshot',
          url: tab.url
        });

        sendResponse({ ok: true, dataUrl });
      } catch (err) {
        console.error('Nexus Helper copyScreenshot:', err);
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'captureScreenshot') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ ok: false, error: 'No active tab' });
          return;
        }

        const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        sendResponse({ ok: true, dataUrl, url: tab.url });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'consoleError') {
    const tabId = sender.tab?.id;
    if (tabId) {
      pushTabError(tabId, message.error);
    }
    return false;
  }

  if (message.action === 'getTabErrors') {
    (async () => {
      const errors = await getTabErrors(message.tabId);
      sendResponse({ errors });
    })();
    return true;
  }

  if (message.action === 'getDebugInfo') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ ok: false, error: 'No active tab' });
          return;
        }

        // Inject content script if needed
        try {
          const results = await chrome.tabs.sendMessage(tab.id, { action: 'getDebugInfo' });
          sendResponse({ ok: true, ...results });
        } catch (e) {
          // Content script not loaded, return basic info
          const storedErrors = await getTabErrors(tab.id);
          sendResponse({
            ok: true,
            errors: storedErrors,
            network: [],
            performance: {},
            url: tab.url,
            title: tab.title
          });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'getSelectedText') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ ok: false, selectedText: '' });
          return;
        }

        try {
          const results = await chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
          sendResponse({ ok: true, selectedText: results?.selectedText || '' });
        } catch (e) {
          sendResponse({ ok: true, selectedText: '' });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'clearDebugInfo') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          clearTabErrors(tab.id);
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'clearDebugInfo' });
          } catch (e) { }
        }
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'addToClipboardHistory') {
    (async () => {
      try {
        const updated = await Storage.addToClipboardHistory(message.item);
        sendResponse({ ok: true, history: updated });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'getClipboardHistory') {
    (async () => {
      try {
        const history = await Storage.getClipboardHistory();
        sendResponse({ ok: true, history });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  // Relay network-data-updated notification from content script to the widget
  if (message.action === 'networkDataUpdated') {
    // Forward to the same tab so the floating widget picks it up
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'networkDataUpdated',
        count: message.count
      }).catch(() => {});
    }
    return false;
  }

  if (message.action === 'openRoute') {
    (async () => {
      try {
        const { route, baseUrl } = message;
        const url = new URL(route, baseUrl).toString();
        await chrome.tabs.create({ url });
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }
});

// Track navigation for recent routes (SPA support)
function handleNavigation(details) {
  if (details.frameId !== 0) return; // Only main frame

  if (details.url && !details.url.startsWith('chrome://') && !details.url.startsWith('about:')) {
    try {
      const url = new URL(details.url);
      if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') return;

      // Get tab title if possible, or fallback
      chrome.tabs.get(details.tabId, (tab) => {
        const title = tab ? tab.title : url.pathname;
        Storage.addRecentRoute(url.pathname, title, details.url);
      });
    } catch (e) { }
  }
}

// History API (SPA soft navigation)
chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);

// Standard Navigation (Hard reload/initial load)
chrome.webNavigation.onCompleted.addListener(handleNavigation);

// Clean up errors when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabErrors(tabId);
});

// Handle opening folders and editors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openInEditor') {
    (async () => {
      try {
        const { editor, url, title, projectPath } = message;

        // Build URL scheme based on editor
        const encodedPath = projectPath ? encodeURIComponent(projectPath) : '';
        const schemes = {
          cursor:       encodedPath ? `cursor://file/${encodedPath}` : 'cursor://',
          vscode:       encodedPath ? `vscode://file/${encodedPath}` : 'vscode://',
          antigravity:  encodedPath ? `antigravity://open?path=${encodedPath}` : 'antigravity://',
          windsurf:     encodedPath ? `windsurf://file/${encodedPath}` : 'windsurf://',
          zed:          encodedPath ? `zed://file/${encodedPath}` : 'zed://'
        };
        const schemeUrl = schemes[editor] || null;

        if (schemeUrl) {
          // Return the scheme URL to the content script for launching
          sendResponse({ ok: true, scheme: schemeUrl });
        } else {
          sendResponse({ ok: false, error: 'Unknown editor' });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'openFolder') {
    (async () => {
      try {
        const { path } = message;
        // Use file:// protocol or platform-specific opener
        // Note: Chrome extensions can't directly open local folders
        // We use the file:// URL scheme which may work on some systems
        const folderUrl = `file://${path}`;

        // Also try to open in default file manager via a trick
        // Create a data URL with a link to the folder
        // Sanitize path to prevent XSS in the generated HTML page
        const safePath = path.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const encodedPath = encodeURI(path);
        const html = `
          <html>
            <body style="font-family:sans-serif;padding:40px;text-align:center;">
              <h2>Open Folder</h2>
              <p>Path: ${safePath}</p>
              <a href="file://${encodedPath}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">Open in File Manager</a>
              <p style="color:#666;margin-top:20px;">If the button doesn't work, copy the path manually:</p>
              <code style="background:#f0f0f0;padding:8px 16px;border-radius:4px;">${safePath}</code>
            </body>
          </html>
        `;
        const dataUrl = 'data:text/html;base64,' + btoa(html);
        await chrome.tabs.create({ url: dataUrl });
        sendResponse({ ok: true });
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'toggleWidget') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' }, (response) => {
            if (chrome.runtime.lastError) {
              // Content script not loaded, inject it
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['scripts/floating-widget.js']
              }, () => {
                // Try again after injection
                setTimeout(() => {
                  chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' }, sendResponse);
                }, 100);
              });
            } else {
              sendResponse(response);
            }
          });
        }
      } catch (err) {
        sendResponse({ ok: false, error: String(err.message || err) });
      }
    })();
    return true;
  }

  if (message.action === 'openPopup') {
    chrome.action.openPopup();
    sendResponse({ ok: true });
    return false;
  }
});

// Command shortcut (keyboard)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-widget') {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' }).catch(() => {
          // Inject if not present
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/floating-widget.js']
          });
        });
      }
    })();
  }
});

// Handle icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' }).catch(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['scripts/floating-widget.js']
      });
    });
  }
});

// Initialize
console.log('[Nexus Helper] Background service worker started');
