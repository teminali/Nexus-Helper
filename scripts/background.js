// Nexus Helper - Background Service Worker
// Handles screenshot capture, storage coordination, and message routing

importScripts('storage.js');
importScripts('firebase-config.js');

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

// ---------------------------------------------------------------------------
// URL Bar Overlay — composites a synthetic browser address bar onto screenshots
// since captureVisibleTab cannot capture browser chrome.
// ---------------------------------------------------------------------------

async function compositeUrlBar(screenshotDataUrl, pageUrl) {
  try {
    // Decode screenshot into an ImageBitmap
    const res = await fetch(screenshotDataUrl);
    const blob = await res.blob();
    const img = await createImageBitmap(blob);

    const BAR_HEIGHT = 48;
    const PAD_X = 16;
    const PAD_Y = 10;
    const PILL_RADIUS = 12;
    const canvasW = img.width;
    const canvasH = img.height + BAR_HEIGHT;

    const canvas = new OffscreenCanvas(canvasW, canvasH);
    const ctx = canvas.getContext('2d');

    // ── Draw URL bar background ──
    ctx.fillStyle = '#f1f3f4';
    ctx.fillRect(0, 0, canvasW, BAR_HEIGHT);

    // Bottom border
    ctx.fillStyle = '#dadce0';
    ctx.fillRect(0, BAR_HEIGHT - 1, canvasW, 1);

    // ── Draw address pill (rounded rect) ──
    const pillX = PAD_X;
    const pillY = PAD_Y;
    const pillW = canvasW - PAD_X * 2;
    const pillH = BAR_HEIGHT - PAD_Y * 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, PILL_RADIUS);
    ctx.fill();

    // Pill border
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, PILL_RADIUS);
    ctx.stroke();

    // ── Lock / warning icon ──
    const isSecure = pageUrl.startsWith('https://');
    const iconX = pillX + 14;
    const iconCenterY = BAR_HEIGHT / 2;
    const iconSize = 14;

    ctx.font = `${iconSize}px system-ui, sans-serif`;
    ctx.textBaseline = 'middle';

    if (isSecure) {
      // Draw a simple lock shape
      ctx.fillStyle = '#5f6368';
      // Lock body
      const lx = iconX, ly = iconCenterY - 2;
      ctx.fillRect(lx, ly, 10, 8);
      // Lock shackle (arc)
      ctx.strokeStyle = '#5f6368';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lx + 5, ly, 5, Math.PI, 0);
      ctx.stroke();
    } else {
      // Warning triangle
      ctx.fillStyle = '#ea4335';
      ctx.font = `bold ${iconSize + 2}px system-ui, sans-serif`;
      ctx.fillText('⚠', iconX, iconCenterY);
    }

    // ── Draw URL text ──
    const textX = iconX + 22;
    const maxTextW = pillW - (textX - pillX) - 14;
    ctx.fillStyle = '#202124';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';

    // Truncate URL if needed
    let displayUrl = pageUrl;
    let measured = ctx.measureText(displayUrl);
    if (measured.width > maxTextW) {
      while (displayUrl.length > 10 && ctx.measureText(displayUrl + '…').width > maxTextW) {
        displayUrl = displayUrl.slice(0, -1);
      }
      displayUrl += '…';
    }
    ctx.fillText(displayUrl, textX, BAR_HEIGHT / 2);

    // ── Draw the page screenshot below ──
    ctx.drawImage(img, 0, BAR_HEIGHT);

    // Export as PNG data URL (service-worker compatible — no FileReader)
    const outputBlob = await canvas.convertToBlob({ type: 'image/png' });
    const ab = await outputBlob.arrayBuffer();
    const bytes = new Uint8Array(ab);
    // Chunked btoa to avoid call-stack overflow on large screenshots
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return 'data:image/png;base64,' + btoa(binary);
  } catch (err) {
    console.warn('Nexus Helper: URL bar compositing failed, using raw screenshot:', err);
    return screenshotDataUrl; // fallback to raw screenshot
  }
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

        const rawDataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        const dataUrl = await compositeUrlBar(rawDataUrl, tab.url || '');

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

        const rawDataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        const dataUrl = await compositeUrlBar(rawDataUrl, tab.url || '');
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
      }).catch(() => { });
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
          cursor: encodedPath ? `cursor://file/${encodedPath}` : 'cursor://',
          vscode: encodedPath ? `vscode://file/${encodedPath}` : 'vscode://',
          antigravity: encodedPath ? `antigravity://open?path=${encodedPath}` : 'antigravity://',
          windsurf: encodedPath ? `windsurf://file/${encodedPath}` : 'windsurf://',
          zed: encodedPath ? `zed://file/${encodedPath}` : 'zed://'
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

// ═══════════════════════════════════════════════════════════════════════════════
// Firebase Auth & Firestore (REST API)
// ═══════════════════════════════════════════════════════════════════════════════

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_BASE = 'https://securetoken.googleapis.com/v1';
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

function fbApiKey() {
  return typeof NEXUS_FIREBASE_CONFIG !== 'undefined' ? NEXUS_FIREBASE_CONFIG.apiKey : '';
}

function fbProjectId() {
  return typeof NEXUS_FIREBASE_CONFIG !== 'undefined' ? NEXUS_FIREBASE_CONFIG.projectId : '';
}

function fbCollection() {
  return typeof NEXUS_FIRESTORE_COLLECTION !== 'undefined' ? NEXUS_FIRESTORE_COLLECTION : 'published_docs';
}

function fbChunks() {
  return typeof NEXUS_FIRESTORE_CHUNKS !== 'undefined' ? NEXUS_FIRESTORE_CHUNKS : 'chunks';
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function nexusAuthSignUp(email, password) {
  const res = await fetch(`${AUTH_BASE}/accounts:signUp?key=${fbApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Sign up failed');
  await storeAuthTokens(data);
  return { uid: data.localId, email: data.email, displayName: data.displayName || '' };
}

async function nexusAuthSignIn(email, password) {
  const res = await fetch(`${AUTH_BASE}/accounts:signInWithPassword?key=${fbApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Sign in failed');
  await storeAuthTokens(data);
  return { uid: data.localId, email: data.email, displayName: data.displayName || '' };
}

async function nexusAuthSignInWithGoogle() {
  const clientId = typeof NEXUS_FIREBASE_CONFIG !== 'undefined' ? NEXUS_FIREBASE_CONFIG.googleClientId : '';
  if (!clientId) throw new Error('Google Client ID not configured. Add googleClientId to firebase-config.js');

  const redirectUrl = chrome.identity.getRedirectURL();
  const scopes = encodeURIComponent('openid email profile');
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&response_type=token id_token` +
    `&scope=${scopes}` +
    `&nonce=${Date.now()}`;

  // Open Google sign-in popup
  const responseUrl = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (callbackUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(callbackUrl);
      }
    });
  });

  // Extract id_token from the redirect URL fragment
  const hashParams = new URLSearchParams(new URL(responseUrl).hash.substring(1));
  const idToken = hashParams.get('id_token');
  const accessToken = hashParams.get('access_token');

  if (!idToken && !accessToken) throw new Error('Failed to get Google token');

  // Exchange the Google token for a Firebase auth token
  const postBody = idToken
    ? `id_token=${idToken}&providerId=google.com`
    : `access_token=${accessToken}&providerId=google.com`;

  const res = await fetch(`${AUTH_BASE}/accounts:signInWithIdp?key=${fbApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postBody,
      requestUri: redirectUrl,
      returnSecureToken: true
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Google sign in failed');

  await storeAuthTokens({
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    localId: data.localId,
    email: data.email || '',
    displayName: data.displayName || data.fullName || '',
    expiresIn: data.expiresIn
  });

  return { uid: data.localId, email: data.email || '', displayName: data.displayName || '' };
}

async function nexusAuthSignOut() {
  await chrome.storage.local.remove(['nexusAuth']);
  return { ok: true };
}

async function nexusAuthStatus() {
  const stored = await chrome.storage.local.get(['nexusAuth']);
  if (!stored.nexusAuth) return { user: null };

  const auth = stored.nexusAuth;
  // Check if token is expired
  const now = Date.now();
  if (auth.expiresAt && now >= auth.expiresAt) {
    // Try to refresh
    try {
      const refreshed = await nexusAuthRefresh(auth.refreshToken);
      return { user: { uid: refreshed.uid, email: refreshed.email, displayName: refreshed.displayName || '' } };
    } catch (e) {
      await chrome.storage.local.remove(['nexusAuth']);
      return { user: null };
    }
  }

  return { user: { uid: auth.uid, email: auth.email, displayName: auth.displayName || '' } };
}

async function nexusAuthRefresh(refreshToken) {
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${TOKEN_BASE}/token?key=${fbApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Token refresh failed');

  const authData = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    localId: data.user_id,
    email: '', // fetch from lookup
    expiresIn: data.expires_in
  };

  // Lookup user info to get email/displayName
  try {
    const info = await nexusAuthLookup(data.id_token);
    authData.email = info.email || '';
    authData.displayName = info.displayName || '';
  } catch (_) { }

  await storeAuthTokens(authData);
  return { uid: authData.localId, email: authData.email, displayName: authData.displayName };
}

async function nexusAuthLookup(idToken) {
  const res = await fetch(`${AUTH_BASE}/accounts:lookup?key=${fbApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const user = data.users?.[0];
  return { uid: user?.localId, email: user?.email, displayName: user?.displayName || '' };
}

async function storeAuthTokens(data) {
  const expiresIn = parseInt(data.expiresIn || '3600', 10);
  await chrome.storage.local.set({
    nexusAuth: {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
      email: data.email || '',
      displayName: data.displayName || '',
      expiresAt: Date.now() + (expiresIn * 1000) - 60000 // 1 min buffer
    }
  });
}

async function getValidIdToken() {
  const stored = await chrome.storage.local.get(['nexusAuth']);
  if (!stored.nexusAuth) return null;
  const auth = stored.nexusAuth;
  if (auth.expiresAt && Date.now() >= auth.expiresAt) {
    try {
      await nexusAuthRefresh(auth.refreshToken);
      const refreshed = await chrome.storage.local.get(['nexusAuth']);
      return refreshed.nexusAuth?.idToken || null;
    } catch (e) {
      return null;
    }
  }
  return auth.idToken;
}

// ── Firestore helpers ─────────────────────────────────────────────────────────

function firestoreDocUrl(path) {
  return `${FIRESTORE_BASE}/projects/${fbProjectId()}/databases/(default)/documents/${path}`;
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreValue);
  if ('mapValue' in val) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const fields = doc.fields;
  const id = doc.name ? doc.name.split('/').pop() : '';
  const parsed = { id };
  for (const [key, val] of Object.entries(fields)) {
    parsed[key] = parseFirestoreValue(val);
  }
  return parsed;
}

async function nexusListMyDocs(userId) {
  const idToken = await getValidIdToken();
  if (!idToken) throw new Error('Not authenticated');

  const url = `${FIRESTORE_BASE}/projects/${fbProjectId()}/databases/(default)/documents:runQuery`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: fbCollection() }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'ownerId' },
            op: 'EQUAL',
            value: { stringValue: userId }
          }
        },
        orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
        select: {
          fields: [
            { fieldPath: 'name' },
            { fieldPath: 'description' },
            { fieldPath: 'visibility' },
            { fieldPath: 'endpointCount' },
            { fieldPath: 'folderCount' },
            { fieldPath: 'chunkCount' },
            { fieldPath: 'ownerId' },
            { fieldPath: 'ownerEmail' },
            { fieldPath: 'updatedAt' },
            { fieldPath: 'createdAt' }
          ]
        }
      }
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Failed to list docs');

  // runQuery returns array of { document, readTime } or { readTime } for empty results
  const docs = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.document) {
        const parsed = parseFirestoreDoc(item.document);
        if (parsed) docs.push(parsed);
      }
    }
  }
  return docs;
}

async function nexusGetDoc(docId) {
  const idToken = await getValidIdToken();
  if (!idToken) throw new Error('Not authenticated');

  // Get main document
  const url = firestoreDocUrl(`${fbCollection()}/${docId}`);
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Doc not found');

  const doc = parseFirestoreDoc(data);
  if (!doc) throw new Error('Failed to parse document');

  let collectionJson = doc.collectionJson || null;

  // Validate if inline JSON is actually parseable — if not, it's truncated → use chunks
  let needsChunks = !collectionJson && (doc.chunkCount || 0) > 0;
  if (collectionJson && (doc.chunkCount || 0) > 0) {
    try {
      JSON.parse(collectionJson);
    } catch {
      // Inline JSON is truncated/corrupt — fall back to chunks
      needsChunks = true;
      collectionJson = null;
    }
  }

  // Read chunks with pagination to handle large collections
  if (needsChunks) {
    const allChunkDocs = [];
    let pageToken = null;
    const basePath = `${fbCollection()}/${docId}/${fbChunks()}`;

    do {
      let chunksUrl = firestoreDocUrl(basePath) + '?pageSize=100';
      if (pageToken) chunksUrl += `&pageToken=${encodeURIComponent(pageToken)}`;

      const chunksRes = await fetch(chunksUrl, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const chunksData = await chunksRes.json();

      if (chunksData.documents && Array.isArray(chunksData.documents)) {
        allChunkDocs.push(...chunksData.documents);
      }

      pageToken = chunksData.nextPageToken || null;
    } while (pageToken);

    if (allChunkDocs.length > 0) {
      const sorted = allChunkDocs
        .map(d => parseFirestoreDoc(d))
        .filter(Boolean)
        .sort((a, b) => (a.index || 0) - (b.index || 0));
      collectionJson = sorted.map(c => c.data || '').join('');
    }
  }

  return { ...doc, collectionJson };
}

// ── Message listener for auth & docs ──────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'nexus-auth-signup') {
    nexusAuthSignUp(message.email, message.password)
      .then(user => sendResponse({ ok: true, user }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.action === 'nexus-auth-signin') {
    nexusAuthSignIn(message.email, message.password)
      .then(user => sendResponse({ ok: true, user }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.action === 'nexus-auth-google') {
    nexusAuthSignInWithGoogle()
      .then(user => sendResponse({ ok: true, user }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.action === 'nexus-auth-signout') {
    nexusAuthSignOut()
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }

  if (message.action === 'nexus-auth-status') {
    nexusAuthStatus()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err), user: null }));
    return true;
  }

  if (message.action === 'nexus-docs-list') {
    nexusListMyDocs(message.userId)
      .then(docs => sendResponse({ ok: true, docs }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err), docs: [] }));
    return true;
  }

  if (message.action === 'nexus-docs-get') {
    nexusGetDoc(message.docId)
      .then(doc => sendResponse({ ok: true, doc }))
      .catch(err => sendResponse({ ok: false, error: String(err.message || err) }));
    return true;
  }
});

// Initialize
console.log('[Nexus Helper] Background service worker started');
