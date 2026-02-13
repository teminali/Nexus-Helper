// ═══════════════════════════════════════════════════════════════════════════════
// Nexus Helper v3.0 - ShadCN UI Edition
// Professional black & white design with dark/light mode support
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════════
  // State Management
  // ═════════════════════════════════════════════════════════════════════════════
  const state = {
    currentTab: null,
    currentRoute: '/',
    currentTitle: '',
    currentUrl: '',
    selectedText: '',
    environments: { local: '', staging: '', prod: '' },
    debugInfo: { errors: [], network: [], performance: {} },
    searchQuery: '',
    activeTabIndex: 0,
    theme: 'dark'
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // DOM Elements Cache
  // ═════════════════════════════════════════════════════════════════════════════
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    sunIcon: document.querySelector('.sun-icon'),
    moonIcon: document.querySelector('.moon-icon'),
    html: document.documentElement,

    // Header & Info
    currentTitle: document.getElementById('current-title'),
    currentRoute: document.getElementById('current-route'),
    pinBtn: document.getElementById('pin-current'),
    heroTitle: document.getElementById('hero-title'),
    heroRoute: document.getElementById('hero-route'),

    // Settings
    settingsToggle: document.getElementById('settings-toggle'),
    settingsPanel: document.getElementById('settings-panel'),

    // Navigation
    tabs: document.querySelectorAll('.tab'),
    panels: document.querySelectorAll('.panel'),

    // Search
    searchInput: document.getElementById('search-input'),

    // Lists
    clipboardHistory: document.getElementById('clipboard-history'),
    recentRoutes: document.getElementById('recent-routes'),
    pinnedRoutes: document.getElementById('pinned-routes'),
    networkList: document.getElementById('network-list'),
    projectsList: document.getElementById('projects-list'),

    // Inputs
    routeNote: document.getElementById('route-note'),
    cursorPrompt: document.getElementById('cursor-prompt'),

    // Counters
    errorCount: document.getElementById('error-count'),
    networkCount: document.getElementById('network-count'),

    // Preview
    previewContent: document.getElementById('preview-content'),
    previewType: document.getElementById('preview-type'),

    // Toast
    toast: document.getElementById('toast'),
    toastContainer: document.getElementById('toast-container'),

    // Keyboard shortcuts
    keyboardShortcuts: document.getElementById('keyboard-shortcuts'),

    // Project form
    projectForm: document.getElementById('project-form'),
    currentProjectMatch: document.getElementById('current-project-match')
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // Initialization
  // ═════════════════════════════════════════════════════════════════════════════
  async function init() {
    try {
      // Load theme first
      await loadTheme();

      await Promise.all([
        loadCurrentTab(),
        loadEnvironments(),
        loadDebugInfo(),
        loadClipboardHistory(),
        loadRecentRoutes(),
        loadPinnedRoutes(),
        loadRouteNote(),
        loadProjectMappings()
      ]);

      setupEventListeners();
      setupKeyboardNavigation();
      updateUI();

      // Show welcome toast for first-time users
      const hasVisited = await chrome.storage.local.get(['hasVisited']);
      if (!hasVisited.hasVisited) {
        showToast('Welcome to Nexus Helper! Press ? for shortcuts', 'success', 4000);
        await chrome.storage.local.set({ hasVisited: true });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      showToast('Failed to initialize. Please refresh.', 'error');
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Theme Management
  // ═════════════════════════════════════════════════════════════════════════════
  async function loadTheme() {
    const result = await chrome.storage.local.get(['theme']);
    state.theme = result.theme || 'dark';
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'dark') {
      elements.html.classList.add('dark');
      elements.sunIcon.classList.remove('hidden');
      elements.moonIcon.classList.add('hidden');
    } else {
      elements.html.classList.remove('dark');
      elements.sunIcon.classList.add('hidden');
      elements.moonIcon.classList.remove('hidden');
    }
  }

  async function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    await chrome.storage.local.set({ theme: newTheme });
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'success');
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Data Loading
  // ═════════════════════════════════════════════════════════════════════════════
  async function loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      state.currentTab = tab;

      if (tab?.url && !tab.url.startsWith('chrome://')) {
        const url = new URL(tab.url);
        state.currentUrl = tab.url;
        state.currentRoute = url.pathname + url.search;
        state.currentTitle = tab.title || 'Untitled';

        try {
          const response = await chrome.runtime.sendMessage({ action: 'getSelectedText' });
          state.selectedText = response?.selectedText || '';
        } catch (e) {
          state.selectedText = '';
        }

        await Storage.addRecentRoute(url.pathname, tab.title, tab.url);
      } else {
        state.currentTitle = 'Chrome Page';
        state.currentRoute = '/';
        state.currentUrl = tab?.url || '';
      }
    } catch (e) {
      console.error('Failed to load tab:', e);
      state.currentTitle = 'Unknown';
      state.currentRoute = '/';
    }
  }

  async function loadEnvironments() {
    state.environments = await Storage.getEnvironments();
    document.getElementById('env-local').value = state.environments.local;
    document.getElementById('env-staging').value = state.environments.staging;
    document.getElementById('env-prod').value = state.environments.prod;
  }

  async function loadDebugInfo() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getDebugInfo' });
      if (response?.ok) {
        state.debugInfo = {
          errors: response.errors || [],
          network: response.network || [],
          performance: response.performance || {}
        };
      }
    } catch (e) {
      console.error('Failed to load debug info:', e);
    }
    updateDebugCounts();
    renderNetworkList();
  }

  async function loadClipboardHistory() {
    const history = await Storage.getClipboardHistory();
    renderClipboardHistory(history);
  }

  async function loadRecentRoutes() {
    const routes = await Storage.getRecentRoutes();
    renderRecentRoutes(routes);
  }

  async function loadPinnedRoutes() {
    const pinned = await Storage.getPinnedRoutes();
    renderPinnedRoutes(pinned);
    updatePinButtonState(pinned);
  }

  async function loadRouteNote() {
    const note = await Storage.getRouteNote(state.currentRoute);
    elements.routeNote.value = note;
  }

  async function loadProjectMappings() {
    const mappings = await Storage.getProjectMappings();
    renderProjectList(mappings);
    checkCurrentProjectMatch(mappings);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // UI Updates
  // ═════════════════════════════════════════════════════════════════════════════
  function updateUI() {
    elements.currentTitle.textContent = state.currentTitle || 'Unknown';
    elements.currentRoute.textContent = state.currentRoute || '/';
    if (elements.heroTitle) elements.heroTitle.textContent = state.currentTitle || 'Unknown';
    if (elements.heroRoute) elements.heroRoute.textContent = state.currentRoute || '/';

    try {
      const url = new URL(state.currentUrl);
      const pathPrefix = url.pathname.split('/')[1];
      const suggestedKey = pathPrefix ? `${url.hostname}/${pathPrefix}` : url.hostname;
      document.getElementById('project-key').value = suggestedKey;
    } catch (e) {
      // Invalid URL, ignore
    }
  }

  function updateDebugCounts() {
    const errorCount = state.debugInfo.errors?.length || 0;
    const networkCount = state.debugInfo.network?.length || 0;

    elements.errorCount.textContent = errorCount === 0
      ? 'No errors captured'
      : `${errorCount} error${errorCount !== 1 ? 's' : ''} captured`;

    elements.networkCount.textContent = networkCount === 0
      ? 'No requests captured'
      : `${networkCount} request${networkCount !== 1 ? 's' : ''} captured`;

    if (errorCount > 0) {
      elements.errorCount.style.color = 'hsl(var(--destructive))';
    }
  }

  function updatePinButtonState(pinned) {
    const isPinned = pinned.some(p => p.route === state.currentRoute);
    elements.pinBtn.classList.toggle('active', isPinned);
    elements.pinBtn.title = isPinned ? 'Unpin this route (P)' : 'Pin this route (P)';
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Rendering Functions
  // ═════════════════════════════════════════════════════════════════════════════
  function renderClipboardHistory(history) {
    const filtered = state.searchQuery
      ? history.filter(item =>
          item.preview?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.type?.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      : history;

    if (!filtered.length) {
      elements.clipboardHistory.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${state.searchQuery ? '🔍' : '📋'}</div>
          <div class="empty-state-text">${state.searchQuery ? 'No matching items' : 'No items yet. Start copying!'}</div>
        </div>
      `;
      return;
    }

    const iconMap = {
      'route': '🔗',
      'url': '🌐',
      'title': '📝',
      'text': '📄',
      'screenshot': '📷',
      'bundle': '📦',
      'context': '🧠'
    };

    elements.clipboardHistory.innerHTML = filtered.map(item => {
      const timeAgo = getTimeAgo(item.timestamp);
      return `
        <div class="list-item" data-id="${item.id}" title="Click to copy again">
          <span class="list-item-icon">${iconMap[item.type] || '📄'}</span>
          <div class="list-item-content">
            <div class="list-item-title">${escapeHtml(item.preview)}</div>
            <div class="list-item-meta">${formatType(item.type)} • ${timeAgo}</div>
          </div>
          <div class="list-item-actions">
            <button class="list-btn copy-history" data-id="${item.id}" title="Copy">📋</button>
            <button class="list-btn delete-history" data-id="${item.id}" title="Delete">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    elements.clipboardHistory.querySelectorAll('.list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.list-btn')) {
          const historyItem = history.find(h => h.id === parseInt(item.dataset.id));
          if (historyItem) {
            copyToClipboard(historyItem.content, historyItem.type === 'screenshot' ? 'image' : 'text');
            showToast('Copied from history!');
          }
        }
      });
    });

    elements.clipboardHistory.querySelectorAll('.copy-history').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = history.find(h => h.id === parseInt(btn.dataset.id));
        if (item) {
          copyToClipboard(item.content, item.type === 'screenshot' ? 'image' : 'text');
          showToast('Copied!');
        }
      });
    });

    elements.clipboardHistory.querySelectorAll('.delete-history').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.id !== parseInt(btn.dataset.id));
        await chrome.storage.local.set({ clipboardHistory: newHistory });
        renderClipboardHistory(newHistory);
        showToast('Item removed');
      });
    });
  }

  function renderRecentRoutes(routes) {
    const filtered = routes
      .filter(r => r.route !== state.currentRoute)
      .filter(r => !state.searchQuery || r.route.toLowerCase().includes(state.searchQuery.toLowerCase()))
      .slice(0, 10);

    if (!filtered.length) {
      elements.recentRoutes.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${state.searchQuery ? '🔍' : '🕐'}</div>
          <div class="empty-state-text">${state.searchQuery ? 'No matching routes' : 'No recent routes'}</div>
        </div>
      `;
      return;
    }

    elements.recentRoutes.innerHTML = filtered.map(route => `
      <div class="list-item" data-route="${escapeHtml(route.route)}" title="Click to navigate">
        <span class="list-item-icon">🕐</span>
        <div class="list-item-content">
          <div class="list-item-title" style="font-family: monospace;">${escapeHtml(route.route)}</div>
          <div class="list-item-meta">${escapeHtml(route.title || 'Untitled')}</div>
        </div>
        <div class="list-item-actions">
          <button class="list-btn copy-route" data-route="${escapeHtml(route.route)}" title="Copy">📋</button>
        </div>
      </div>
    `).join('');

    elements.recentRoutes.querySelectorAll('.list-item').forEach(item => {
      item.addEventListener('click', () => {
        const route = item.dataset.route;
        const url = new URL(route, state.currentUrl).toString();
        chrome.tabs.update(state.currentTab.id, { url });
      });
    });

    elements.recentRoutes.querySelectorAll('.copy-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(btn.dataset.route);
        addToHistory('route', btn.dataset.route);
        showToast('Route copied!');
      });
    });
  }

  function renderPinnedRoutes(pinned) {
    const filtered = state.searchQuery
      ? pinned.filter(p =>
          p.route.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          (p.title && p.title.toLowerCase().includes(state.searchQuery.toLowerCase()))
        )
      : pinned;

    if (!filtered.length) {
      elements.pinnedRoutes.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${state.searchQuery ? '🔍' : '📌'}</div>
          <div class="empty-state-text">${state.searchQuery ? 'No matching pins' : 'Pin routes for quick access'}</div>
        </div>
      `;
      return;
    }

    elements.pinnedRoutes.innerHTML = filtered.map(pin => `
      <div class="list-item" data-route="${escapeHtml(pin.route)}" title="Click to navigate">
        <span class="list-item-icon">📌</span>
        <div class="list-item-content">
          <div class="list-item-title" style="font-family: monospace;">${escapeHtml(pin.route)}</div>
          <div class="list-item-meta">${escapeHtml(pin.title || 'Untitled')}</div>
          ${pin.note ? `<div style="font-size: 10px; color: hsl(var(--muted-foreground)); margin-top: 2px; font-style: italic;">${escapeHtml(pin.note.slice(0, 50))}${pin.note.length > 50 ? '...' : ''}</div>` : ''}
        </div>
        <div class="list-item-actions">
          <button class="list-btn copy-route" data-route="${escapeHtml(pin.route)}" title="Copy">📋</button>
          <button class="list-btn unpin" data-route="${escapeHtml(pin.route)}" title="Unpin" style="color: hsl(var(--destructive));">✕</button>
        </div>
      </div>
    `).join('');

    elements.pinnedRoutes.querySelectorAll('.list-item').forEach(item => {
      item.addEventListener('click', () => {
        const route = item.dataset.route;
        const url = new URL(route, state.currentUrl).toString();
        chrome.tabs.update(state.currentTab.id, { url });
      });
    });

    elements.pinnedRoutes.querySelectorAll('.copy-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(btn.dataset.route);
        addToHistory('route', btn.dataset.route);
        showToast('Route copied!');
      });
    });

    elements.pinnedRoutes.querySelectorAll('.unpin').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await Storage.unpinRoute(btn.dataset.route);
        const updated = await Storage.getPinnedRoutes();
        renderPinnedRoutes(updated);
        updatePinButtonState(updated);
        showToast('Route unpinned');
      });
    });
  }

  function renderNetworkList(filter = 'all') {
    const network = state.debugInfo.network || [];

    if (!network.length) {
      elements.networkList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌐</div>
          <div class="empty-state-text">No requests captured yet</div>
        </div>
      `;
      return;
    }

    const filtered = network.filter(req => {
      if (filter === 'failed') return req.status >= 400 || req.error || req.status === 0;
      if (filter === 'xhr') return ['xhr', 'fetch'].includes(req.type);
      return true;
    }).filter(req =>
      !state.searchQuery || req.url.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    if (!filtered.length) {
      elements.networkList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">${state.searchQuery ? 'No matching requests' : 'No requests match the filter'}</div>
        </div>
      `;
      return;
    }

    const sorted = [...filtered].reverse();

    elements.networkList.innerHTML = sorted.map((req, index) => {
      const isError = req.status >= 400 || req.error || req.status === 0;
      const statusClass = isError ? 'error' : 'success';
      const statusText = req.status || (req.error ? 'ERR' : '???');
      const methodClass = req.method ? req.method.toLowerCase() : 'get';

      return `
        <div class="network-item" tabindex="0">
          <div class="network-header">
            <span class="method-badge ${methodClass}">${req.method || 'GET'}</span>
            <span class="req-url" title="${escapeHtml(req.url)}">${escapeHtml(req.url)}</span>
            <span class="req-status ${statusClass}">${statusText}</span>
          </div>
          <div class="network-details">
            <span>${req.type || 'fetch'} • ${req.duration || '?'}ms</span>
            <div class="network-actions">
              <button class="network-btn copy-curl" data-index="${index}">cURL</button>
              <button class="network-btn copy-full" data-index="${index}">Full</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    elements.networkList.querySelectorAll('.copy-curl').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const req = sorted[btn.dataset.index];
        const curl = generateCurlCommand(req);
        copyToClipboard(curl);
        showToast('cURL copied!');
      });
    });

    elements.networkList.querySelectorAll('.copy-full').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const req = sorted[btn.dataset.index];
        const fullDetails = formatNetworkDetails(req);
        copyToClipboard(fullDetails);
        showToast('Full details copied!');
      });
    });
  }

  function renderProjectList(mappings) {
    const entries = Object.entries(mappings);
    const filtered = state.searchQuery
      ? entries.filter(([key, project]) =>
          key.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          project.name?.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      : entries;

    if (!filtered.length) {
      elements.projectsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${state.searchQuery ? '🔍' : '📂'}</div>
          <div class="empty-state-text">${state.searchQuery ? 'No matching projects' : 'No projects mapped yet'}</div>
        </div>
      `;
      return;
    }

    elements.projectsList.innerHTML = filtered.map(([key, project]) => `
      <div class="project-item" data-key="${escapeHtml(key)}">
        <div class="project-icon">${getEditorIcon(project.editor)}</div>
        <div class="project-details">
          <div class="project-name">${escapeHtml(project.name || 'Unnamed')}</div>
          <div class="project-path">${escapeHtml(project.path)}</div>
          <div class="project-key">${escapeHtml(key)}</div>
        </div>
        <div class="list-item-actions">
          <button class="list-btn open-project" data-key="${escapeHtml(key)}" title="Open">▶️</button>
          <button class="list-btn delete-project" data-key="${escapeHtml(key)}" title="Remove" style="color: hsl(var(--destructive));">🗑️</button>
        </div>
      </div>
    `).join('');

    elements.projectsList.querySelectorAll('.open-project').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const key = btn.dataset.key;
        const project = mappings[key];
        if (project) {
          chrome.runtime.sendMessage({
            action: 'openInEditor',
            editor: project.editor,
            projectPath: project.path
          });
          showToast(`Opening ${project.name}...`);
        }
      });
    });

    elements.projectsList.querySelectorAll('.delete-project').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Remove this project mapping?')) {
          await Storage.removeProjectMapping(btn.dataset.key);
          const updated = await Storage.getProjectMappings();
          renderProjectList(updated);
          checkCurrentProjectMatch(updated);
          showToast('Project removed');
        }
      });
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Event Listeners
  // ═════════════════════════════════════════════════════════════════════════════
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Tab switching
    elements.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => switchTab(index));
    });

    // Settings toggle
    elements.settingsToggle.addEventListener('click', toggleSettings);

    // Save environments
    document.getElementById('save-envs').addEventListener('click', saveEnvironments);

    // Pin/unpin
    elements.pinBtn.addEventListener('click', togglePin);

    // Search
    elements.searchInput.addEventListener('input', handleSearch);

    // Clear buttons
    document.getElementById('clear-history').addEventListener('click', clearHistory);
    document.getElementById('clear-recent').addEventListener('click', clearRecentRoutes);
    document.getElementById('clear-debug').addEventListener('click', clearDebugData);

    // Save note
    document.getElementById('save-note').addEventListener('click', saveRouteNote);

    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => handleCaptureAction(btn.dataset.action));
    });

    // Environment buttons
    document.querySelectorAll('.env-btn').forEach(btn => {
      btn.addEventListener('click', () => handleEnvNavigation(btn.dataset.env));
    });

    // Debug actions
    document.querySelectorAll('.debug-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDebugAction(btn.dataset.action));
    });

    // Cursor actions
    document.querySelectorAll('.cursor-btn').forEach(btn => {
      btn.addEventListener('click', () => handleCursorAction(btn.dataset.action));
    });

    // Network filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderNetworkList(btn.dataset.filter);
      });
    });

    // Project actions
    document.getElementById('save-project').addEventListener('click', saveProject);
    document.getElementById('open-project-folder').addEventListener('click', openProjectFolder);
    document.getElementById('toggle-widget-btn').addEventListener('click', toggleWidget);
    document.getElementById('widget-auto-show').addEventListener('change', toggleWidgetAutoShow);

    // Load widget auto-show setting
    chrome.storage.local.get(['widgetAutoShow']).then(result => {
      document.getElementById('widget-auto-show').checked = result.widgetAutoShow !== false;
    });

    // Keyboard shortcuts help
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        elements.keyboardShortcuts.classList.add('active');
      }
      if (e.key === 'Escape') {
        elements.keyboardShortcuts.classList.remove('active');
      }
    });

    elements.keyboardShortcuts.addEventListener('click', (e) => {
      if (e.target === elements.keyboardShortcuts) {
        elements.keyboardShortcuts.classList.remove('active');
      }
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Keyboard Navigation
  // ═════════════════════════════════════════════════════════════════════════════
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea') && !['Escape', 't', 'T'].includes(e.key)) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          elements.searchInput.focus();
          elements.searchInput.select();
          break;

        case 's':
        case 'S':
          if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleSettings();
          }
          break;

        case 'p':
        case 'P':
          if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            togglePin();
          }
          break;

        case 't':
        case 'T':
          if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleTheme();
          }
          break;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          e.preventDefault();
          switchTab(parseInt(e.key) - 1);
          break;

        case 'ArrowRight':
          if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            const nextIndex = (state.activeTabIndex + 1) % elements.tabs.length;
            switchTab(nextIndex);
          }
          break;

        case 'ArrowLeft':
          if (!e.target.matches('input, textarea')) {
            e.preventDefault();
            const prevIndex = (state.activeTabIndex - 1 + elements.tabs.length) % elements.tabs.length;
            switchTab(prevIndex);
          }
          break;

        case 'Escape':
          if (e.target === elements.searchInput) {
            e.target.blur();
            state.searchQuery = '';
            e.target.value = '';
            refreshAllLists();
          }
          break;
      }
    });
  }

  function switchTab(index) {
    if (index < 0 || index >= elements.tabs.length) return;

    state.activeTabIndex = index;

    elements.tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    elements.panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === index);
    });

    if (state.searchQuery) {
      refreshAllLists();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Action Handlers
  // ═════════════════════════════════════════════════════════════════════════════
  async function toggleSettings() {
    const isHidden = elements.settingsPanel.hasAttribute('hidden');
    elements.settingsToggle.classList.toggle('active', isHidden);

    if (isHidden) {
      elements.settingsPanel.removeAttribute('hidden');
    } else {
      elements.settingsPanel.setAttribute('hidden', '');
    }
  }

  async function saveEnvironments() {
    state.environments = {
      local: document.getElementById('env-local').value,
      staging: document.getElementById('env-staging').value,
      prod: document.getElementById('env-prod').value
    };
    await Storage.setEnvironments(state.environments);
    showToast('Settings saved!');
    elements.settingsPanel.setAttribute('hidden', '');
    elements.settingsToggle.classList.remove('active');
  }

  async function togglePin() {
    const pinned = await Storage.getPinnedRoutes();
    const isPinned = pinned.some(p => p.route === state.currentRoute);

    if (isPinned) {
      await Storage.unpinRoute(state.currentRoute);
      showToast('Route unpinned', 'success');
    } else {
      await Storage.pinRoute(state.currentRoute, state.currentTitle);
      showToast('Route pinned!', 'success');
    }

    const updated = await Storage.getPinnedRoutes();
    renderPinnedRoutes(updated);
    updatePinButtonState(updated);
  }

  function handleSearch(e) {
    state.searchQuery = e.target.value.trim();
    refreshAllLists();
  }

  function refreshAllLists() {
    Promise.all([
      Storage.getClipboardHistory().then(renderClipboardHistory),
      Storage.getRecentRoutes().then(renderRecentRoutes),
      Storage.getPinnedRoutes().then(renderPinnedRoutes),
      Storage.getProjectMappings().then(renderProjectList)
    ]);
    renderNetworkList(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  }

  async function clearHistory() {
    if (confirm('Clear all clipboard history?')) {
      await Storage.clearClipboardHistory();
      renderClipboardHistory([]);
      showToast('History cleared');
    }
  }

  async function clearRecentRoutes() {
    await Storage.clearRecentRoutes();
    renderRecentRoutes([]);
    showToast('Recent routes cleared');
  }

  async function clearDebugData() {
    await chrome.runtime.sendMessage({ action: 'clearDebugInfo' });
    state.debugInfo = { errors: [], network: [], performance: {} };
    updateDebugCounts();
    renderNetworkList();
    showToast('Debug data cleared');
  }

  async function saveRouteNote() {
    const note = elements.routeNote.value;
    await Storage.setRouteNote(state.currentRoute, note);

    const pinned = await Storage.getPinnedRoutes();
    if (pinned.some(p => p.route === state.currentRoute)) {
      await Storage.updatePinNote(state.currentRoute, note);
      renderPinnedRoutes(await Storage.getPinnedRoutes());
    }

    showToast('Note saved!');
  }

  async function handleCaptureAction(action) {
    try {
      switch (action) {
        case 'copy-route':
          const route = new URL(state.currentUrl).pathname;
          await copyToClipboard(route);
          await addToHistory('route', route);
          showToast('Route copied!');
          break;

        case 'copy-url':
          await copyToClipboard(state.currentUrl);
          await addToHistory('url', state.currentUrl);
          showToast('URL copied!');
          break;

        case 'copy-title':
          await copyToClipboard(state.currentTitle);
          await addToHistory('title', state.currentTitle);
          showToast('Title copied!');
          break;

        case 'copy-selection':
          if (!state.selectedText) {
            showToast('No text selected', 'warning');
            return;
          }
          await copyToClipboard(state.selectedText);
          await addToHistory('text', state.selectedText);
          showToast('Selection copied!');
          break;

        case 'copy-screenshot':
          await captureAndCopyScreenshot();
          break;

        case 'copy-bundle':
          await copyBundle();
          break;
      }
      await loadClipboardHistory();
    } catch (error) {
      console.error('Capture action failed:', error);
      showToast('Action failed', 'error');
    }
  }

  async function handleEnvNavigation(env) {
    const baseUrl = state.environments[env];
    if (!baseUrl) {
      showToast(`Set ${env} URL in settings first`, 'warning');
      elements.settingsPanel.removeAttribute('hidden');
      return;
    }

    try {
      const url = new URL(state.currentRoute, baseUrl).toString();
      await chrome.tabs.create({ url });
      showToast(`Opening in ${env}...`);
    } catch (e) {
      showToast('Invalid environment URL', 'error');
    }
  }

  async function handleDebugAction(action) {
    switch (action) {
      case 'copy-errors':
        if (!state.debugInfo.errors.length) {
          showToast('No errors captured', 'warning');
          return;
        }
        const errorText = formatErrors(state.debugInfo.errors);
        await copyToClipboard(errorText);
        showToast(`${state.debugInfo.errors.length} errors copied!`);
        break;

      case 'copy-network':
        if (!state.debugInfo.network.length) {
          showToast('No network requests captured', 'warning');
          return;
        }
        const networkText = formatNetworkSummary(state.debugInfo.network);
        await copyToClipboard(networkText);
        showToast(`${state.debugInfo.network.length} requests copied!`);
        break;

      case 'copy-performance':
        const perfText = formatPerformance(state.debugInfo.performance);
        await copyToClipboard(perfText);
        showToast('Performance data copied!');
        break;

      case 'copy-full-debug':
        const fullReport = generateFullDebugReport();
        await copyToClipboard(fullReport);
        showToast('Full debug report copied!');
        break;
    }
  }

  async function handleCursorAction(action) {
    let content = '';
    let type = 'Context';

    switch (action) {
      case 'copy-cursor-context':
        content = await generateCursorContext();
        type = 'Full Context';
        break;

      case 'copy-cursor-bug':
        content = generateBugReport();
        type = 'Report';
        break;

      case 'copy-cursor-feature':
        content = generateFeatureNote();
        type = 'Feature Note';
        break;

      case 'copy-cursor-summary':
        content = generatePageSummary();
        type = 'Summary';
        break;
    }

    await copyToClipboard(content);
    updatePreview(content, type);
    showToast(`${type} copied for Cursor!`);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Screenshot & Bundle
  // ═════════════════════════════════════════════════════════════════════════════
  async function captureAndCopyScreenshot() {
    const btn = document.querySelector('[data-action="copy-screenshot"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div><span class="action-label">Capturing...</span>';
    btn.disabled = true;

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'copyScreenshot' }, resolve);
      });

      if (response?.ok && response.dataUrl) {
        const res = await fetch(response.dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        await addToHistory('screenshot', response.dataUrl, '📷 Screenshot');
        showToast('Screenshot copied!');
      } else {
        showToast(response?.error || 'Failed to capture', 'error');
      }
    } catch (e) {
      showToast('Failed to capture screenshot', 'error');
    } finally {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  }

  async function copyBundle() {
    const route = new URL(state.currentUrl).pathname;
    await copyToClipboard(route);
    await addToHistory('route', route);

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'captureScreenshot' }, resolve);
      });

      if (response?.ok) {
        await addToHistory('bundle', JSON.stringify({ route, screenshot: response.dataUrl }), '📦 Bundle');
        showToast('Route copied! Screenshot ready...');

        setTimeout(async () => {
          const res = await fetch(response.dataUrl);
          const blob = await res.blob();
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Screenshot copied too!');
        }, 500);
      }
    } catch (e) {
      console.error('Bundle error:', e);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Project Management
  // ═════════════════════════════════════════════════════════════════════════════
  async function saveProject() {
    const key = document.getElementById('project-key').value.trim();
    const name = document.getElementById('project-name').value.trim();
    const path = document.getElementById('project-path').value.trim();
    const editor = document.querySelector('input[name="editor"]:checked').value;

    if (!key || !path) {
      showToast('URL pattern and path are required', 'warning');
      return;
    }

    await Storage.addProjectMapping(key, { name: name || key, path, editor });
    const mappings = await Storage.getProjectMappings();
    renderProjectList(mappings);
    checkCurrentProjectMatch(mappings);
    showToast('Project mapped!');
  }

  async function openProjectFolder() {
    const path = document.getElementById('project-path').value.trim();
    if (path) {
      chrome.runtime.sendMessage({ action: 'openFolder', path });
      showToast('Opening folder...');
    } else {
      showToast('Enter a path first', 'warning');
    }
  }

  async function toggleWidget() {
    if (state.currentTab?.id) {
      chrome.runtime.sendMessage({ action: 'toggleWidget' }, (response) => {
        if (response?.ok) {
          showToast(response.visible ? 'Widget shown' : 'Widget hidden');
        }
      });
    }
  }

  async function toggleWidgetAutoShow(e) {
    await chrome.storage.local.set({ widgetAutoShow: e.target.checked });
    showToast(e.target.checked ? 'Widget will auto-show' : 'Widget auto-show disabled');
  }

  async function checkCurrentProjectMatch(mappings) {
    try {
      const url = new URL(state.currentUrl);
      const domain = url.hostname;
      const pathPrefix = url.pathname.split('/')[1];
      const exactKey = pathPrefix ? `${domain}/${pathPrefix}` : domain;

      let matchedProject = null;
      let matchedKey = null;

      if (mappings[exactKey]) {
        matchedProject = mappings[exactKey];
        matchedKey = exactKey;
      } else if (mappings[domain]) {
        matchedProject = mappings[domain];
        matchedKey = domain;
      }

      if (matchedProject) {
        elements.currentProjectMatch.classList.add('matched');
        elements.currentProjectMatch.innerHTML = `
          <div class="project-match-status">
            <span class="project-match-dot"></span>
            <span class="project-match-text">${escapeHtml(matchedProject.name)}</span>
          </div>
          <div class="project-match-path">${escapeHtml(matchedProject.path)}</div>
        `;
        document.getElementById('project-key').value = matchedKey;
        document.getElementById('project-name').value = matchedProject.name;
        document.getElementById('project-path').value = matchedProject.path;
        document.querySelector(`input[name="editor"][value="${matchedProject.editor}"]`).checked = true;
      } else {
        elements.currentProjectMatch.classList.remove('matched');
        elements.currentProjectMatch.innerHTML = `
          <div class="project-match-status">
            <span class="project-match-dot"></span>
            <span class="project-match-text">No project mapped</span>
          </div>
        `;
      }
    } catch (e) {
      console.error('Failed to check project match:', e);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Context Generation
  // ═════════════════════════════════════════════════════════════════════════════
  async function guessFilePath() {
    try {
      const mappings = await Storage.getProjectMappings();
      const url = new URL(state.currentUrl);
      const domain = url.hostname;
      const pathPrefix = url.pathname.split('/')[1];

      let project = mappings[`${domain}/${pathPrefix}`] || mappings[domain];
      if (!project) return null;

      let relativePath = url.pathname;
      if (relativePath === '/') relativePath = '/page';
      else if (relativePath.endsWith('/')) relativePath = relativePath.slice(0, -1) + '/page';
      else if (!relativePath.includes('.')) relativePath += '/page';

      return `${project.path}${relativePath}.tsx`;
    } catch (e) {
      return null;
    }
  }

  async function generateCursorContext() {
    const prompt = elements.cursorPrompt.value.trim();
    const includeFilePath = document.getElementById('include-filepath').checked;
    const parts = [];

    if (prompt) {
      parts.push(prompt, '', '---', '');
    }

    parts.push(`URL: ${state.currentUrl}`);
    parts.push(`Route: ${state.currentRoute}`);
    parts.push(`Title: ${state.currentTitle}`);

    if (includeFilePath) {
      const filePath = await guessFilePath();
      if (filePath) parts.push(`File: ${filePath}`);
    }

    parts.push('');

    if (state.selectedText) {
      parts.push('```', state.selectedText.slice(0, 2000), '```', '');
    }

    if (state.debugInfo.errors.length) {
      parts.push('Errors:', '```', state.debugInfo.errors.slice(0, 3).map(e => e.message).join('\n'), '```', '');
    }

    const failedReqs = state.debugInfo.network.filter(req =>
      (req.status >= 400 || req.error || req.status === 0) &&
      ['xhr', 'fetch'].includes(req.type)
    );

    if (failedReqs.length) {
      parts.push('Failed Requests:', '```');
      failedReqs.slice(-5).forEach(req => {
        parts.push(`${req.method} ${req.url} [${req.status || 'ERR'}]`);
      });
      parts.push('```', '');
    }

    return parts.join('\n');
  }

  function generateBugReport() {
    return [
      `## Bug Report`,
      '',
      `**Page:** ${state.currentTitle}`,
      `**URL:** ${state.currentUrl}`,
      `**Route:** ${new URL(state.currentUrl).pathname}`,
      '',
      `### Description`,
      `[Describe the bug here]`,
      '',
      `### Steps to Reproduce`,
      `1. `,
      `2. `,
      `3. `,
      '',
      `### Expected Behavior`,
      `[What should happen]`,
      '',
      `### Actual Behavior`,
      `[What actually happens]`,
      ...(state.debugInfo.errors.length ? [
        '',
        `### Console Errors`,
        '```',
        state.debugInfo.errors.slice(0, 5).map(e => `[${e.type}] ${e.message}`).join('\n'),
        '```'
      ] : []),
      '',
      `### Screenshot`,
      `[Screenshot attached]`
    ].join('\n');
  }

  function generateFeatureNote() {
    return [
      `## Feature Note`,
      '',
      `**Page:** ${state.currentTitle}`,
      `**URL:** ${state.currentUrl}`,
      `**Route:** ${new URL(state.currentUrl).pathname}`,
      '',
      `### Feature Description`,
      `[Describe the feature or task]`,
      '',
      `### Current State`,
      `[What currently exists on this page]`,
      '',
      `### Requirements`,
      `- `,
      `- `,
      `- `,
      '',
      `### Notes`,
      `[Additional context]`
    ].join('\n');
  }

  function generatePageSummary() {
    const parts = [
      `## Page Summary`,
      '',
      `**Title:** ${state.currentTitle}`,
      `**URL:** ${state.currentUrl}`,
      `**Route:** ${new URL(state.currentUrl).pathname}`,
      ''
    ];

    if (state.selectedText) {
      parts.push(`**Selected Content:**`, '> ' + state.selectedText.slice(0, 200).replace(/\n/g, '\n> '), '');
    }

    const perf = state.debugInfo.performance;
    if (perf.loadTime) {
      parts.push(`**Performance:**`, `- Load Time: ${perf.loadTime}ms`);
      if (perf.lcp) parts.push(`- LCP: ${Math.round(perf.lcp)}ms`);
      parts.push('');
    }

    if (state.debugInfo.errors.length) {
      parts.push(`**Issues:** ${state.debugInfo.errors.length} console error(s)`);
    }

    return parts.join('\n');
  }

  function generateFullDebugReport() {
    const parts = [
      `## Debug Report`,
      `Generated: ${new Date().toISOString()}`,
      '',
      `### Page Info`,
      `- URL: ${state.currentUrl}`,
      `- Title: ${state.currentTitle}`,
      '',
      `### Console Errors (${state.debugInfo.errors.length})`
    ];

    if (state.debugInfo.errors.length) {
      state.debugInfo.errors.forEach((err, i) => {
        parts.push(`\n${i + 1}. [${err.type}] ${err.message}`);
        if (err.stack) parts.push('   Stack: ' + err.stack.split('\n')[0]);
      });
    } else {
      parts.push('\nNo errors captured');
    }

    parts.push(`\n### Network Requests (${state.debugInfo.network.length})`);
    if (state.debugInfo.network.length) {
      state.debugInfo.network.forEach((req, i) => {
        const status = req.status || req.error || 'pending';
        parts.push(`\n${i + 1}. ${req.method} ${req.url} - ${status} (${req.duration}ms)`);
      });
    } else {
      parts.push('\nNo network requests captured');
    }

    const perf = state.debugInfo.performance;
    parts.push(`\n### Performance Metrics`);
    parts.push(`- Load Time: ${perf.loadTime ? perf.loadTime + 'ms' : 'N/A'}`);
    parts.push(`- DOM Content Loaded: ${perf.domContentLoaded ? perf.domContentLoaded + 'ms' : 'N/A'}`);
    parts.push(`- First Paint: ${perf.firstPaint ? Math.round(perf.firstPaint) + 'ms' : 'N/A'}`);
    parts.push(`- First Contentful Paint: ${perf.firstContentfulPaint ? Math.round(perf.firstContentfulPaint) + 'ms' : 'N/A'}`);
    parts.push(`- Largest Contentful Paint: ${perf.lcp ? Math.round(perf.lcp) + 'ms' : 'N/A'}`);

    return parts.join('\n');
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Utility Functions
  // ═════════════════════════════════════════════════════════════════════════════
  async function copyToClipboard(content, type = 'text') {
    if (type === 'image') {
      const res = await fetch(content);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } else {
      await navigator.clipboard.writeText(content);
    }
  }

  async function addToHistory(type, content, preview = null) {
    await Storage.addToClipboardHistory({
      type,
      content,
      preview: preview || (typeof content === 'string' ? content.slice(0, 50) : '📷 Image'),
      url: state.currentUrl
    });
  }

  function updatePreview(content, type) {
    elements.previewType.textContent = type;
    elements.previewContent.textContent = content.slice(0, 500) + (content.length > 500 ? '\n\n... (truncated)' : '');
  }

  function showToast(message, type = 'success', duration = 2500) {
    const toast = elements.toast;
    toast.className = 'toast ' + type;
    
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };
    
    toast.querySelector('.toast-icon').textContent = iconMap[type] || '✓';
    toast.querySelector('.toast-message').textContent = message;
    toast.removeAttribute('hidden');

    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);

    toast.hideTimeout = setTimeout(() => {
      toast.setAttribute('hidden', '');
    }, duration);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Formatting Helpers
  // ═════════════════════════════════════════════════════════════════════════════
  function formatErrors(errors) {
    return errors.map(e =>
      `[${e.type}] ${e.message}${e.stack ? '\n' + e.stack : ''}`
    ).join('\n\n---\n\n');
  }

  function formatNetworkSummary(network) {
    return network.map(n =>
      `${n.method} ${n.url} - ${n.status || n.error} (${n.duration}ms)`
    ).join('\n');
  }

  function formatNetworkDetails(req) {
    return [
      `Method: ${req.method}`,
      `URL: ${req.url}`,
      `Status: ${req.status}`,
      `Duration: ${req.duration}ms`,
      `--- Request Headers ---`,
      JSON.stringify(req.requestHeaders, null, 2),
      `--- Request Body ---`,
      req.requestBody || '(empty)',
      `--- Response Headers ---`,
      req.responseHeaders || '(empty)',
      `--- Response Body ---`,
      req.responseBody || '(empty)'
    ].join('\n');
  }

  function formatPerformance(perf) {
    return [
      `Performance Snapshot`,
      `URL: ${state.currentUrl}`,
      `Load Time: ${perf.loadTime ? perf.loadTime + 'ms' : 'N/A'}`,
      `DOM Content Loaded: ${perf.domContentLoaded ? perf.domContentLoaded + 'ms' : 'N/A'}`,
      `First Paint: ${perf.firstPaint ? Math.round(perf.firstPaint) + 'ms' : 'N/A'}`,
      `First Contentful Paint: ${perf.firstContentfulPaint ? Math.round(perf.firstContentfulPaint) + 'ms' : 'N/A'}`,
      `Largest Contentful Paint: ${perf.lcp ? Math.round(perf.lcp) + 'ms' : 'N/A'}`
    ].join('\n');
  }

  function generateCurlCommand(req) {
    let command = `curl -X ${req.method} "${req.url}"`;

    if (req.requestHeaders) {
      const headers = Array.isArray(req.requestHeaders)
        ? req.requestHeaders
        : Object.entries(req.requestHeaders);
      headers.forEach(([key, value]) => {
        command += ` \\\n  -H "${key}: ${value}"`;
      });
    }

    if (req.requestBody) {
      const escapedBody = req.requestBody.replace(/'/g, "'\\''");
      command += ` \\\n  -d '${escapedBody}'`;
    }

    return command;
  }

  function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function formatType(type) {
    const typeMap = {
      'route': 'Route',
      'url': 'URL',
      'title': 'Title',
      'text': 'Text',
      'screenshot': 'Screenshot',
      'bundle': 'Bundle',
      'context': 'AI Context'
    };
    return typeMap[type] || type;
  }

  function getEditorIcon(editor) {
    const icons = {
      cursor: '🎯',
      vscode: '💻',
      antigravity: '🚀'
    };
    return icons[editor] || '📁';
  }

  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Start
  // ═════════════════════════════════════════════════════════════════════════════
  init();
})();
