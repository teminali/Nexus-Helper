// ═══════════════════════════════════════════════════════════════════════════════
// Nexus Helper v3.1 - ShadCN UI Design System
// Professional, "styleless" look with refined typography and spacing
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__nexusFloatingWidget) return;
  window.__nexusFloatingWidget = true;

  // ═════════════════════════════════════════════════════════════════════════════
  // Storage Helper (Inlined)
  // ═════════════════════════════════════════════════════════════════════════════
  const Storage = {
    // Clipboard history
    async getClipboardHistory() {
      const result = await chrome.storage.local.get(['clipboardHistory']);
      return result.clipboardHistory || [];
    },

    async addToClipboardHistory(item) {
      const history = await this.getClipboardHistory();
      const newItem = {
        id: Date.now(),
        type: item.type,
        content: item.content,
        preview: item.preview || item.content.slice(0, 50),
        timestamp: Date.now(),
        url: item.url || ''
      };

      const filtered = history.filter(h => h.content !== item.content);
      filtered.unshift(newItem);
      const trimmed = filtered.slice(0, 10);
      await chrome.storage.local.set({ clipboardHistory: trimmed });
      return trimmed;
    },

    async clearClipboardHistory() {
      await chrome.storage.local.remove(['clipboardHistory']);
    },

    // Recent routes
    async getRecentRoutes() {
      const result = await chrome.storage.local.get(['recentRoutes']);
      return result.recentRoutes || [];
    },

    async addRecentRoute(route, title = '', fullUrl = '') {
      const routes = await this.getRecentRoutes();
      const newRoute = {
        route,
        title: title || route,
        fullUrl,
        timestamp: Date.now(),
        visitCount: 1
      };

      const existingIndex = routes.findIndex(r => r.route === route);
      if (existingIndex >= 0) {
        newRoute.visitCount = (routes[existingIndex].visitCount || 1) + 1;
        routes.splice(existingIndex, 1);
      }

      routes.unshift(newRoute);
      const trimmed = routes.slice(0, 10);
      await chrome.storage.local.set({ recentRoutes: trimmed });
      return trimmed;
    },

    async clearRecentRoutes() {
      await chrome.storage.local.remove(['recentRoutes']);
    },

    // Recent network requests
    async getRecentNetworkRequests() {
      const result = await chrome.storage.local.get(['recentNetworkRequests']);
      return result.recentNetworkRequests || [];
    },

    async mergeRecentNetworkRequests(requests) {
      if (!Array.isArray(requests) || !requests.length) return this.getRecentNetworkRequests();

      const existing = await this.getRecentNetworkRequests();
      const normalize = (r) => {
        const method = (r?.method || 'GET').toUpperCase();
        const url = String(r?.url || '');
        const timestamp = Number(r?.timestamp || Date.now());
        let path = url;
        try { path = new URL(url, window.location.origin).pathname; } catch (_) { }
        return {
          id: `${timestamp}:${method}:${url}`,
          type: r?.type || 'network',
          method,
          url,
          path,
          status: Number(r?.status || 0),
          statusText: r?.statusText || '',
          duration: Number(r?.duration || 0),
          error: r?.error || '',
          timestamp
        };
      };

      const incoming = requests.map(normalize).filter(r => r.url);
      const merged = [...incoming, ...existing];

      const out = [];
      const seen = new Set();
      for (const item of merged) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        out.push(item);
        if (out.length >= 300) break;
      }

      await chrome.storage.local.set({ recentNetworkRequests: out });
      return out;
    },

    // Pinned routes
    async getPinnedRoutes() {
      const result = await chrome.storage.local.get(['pinnedRoutes']);
      return result.pinnedRoutes || [];
    },

    async pinRoute(route, title = '', note = '') {
      const pinned = await this.getPinnedRoutes();
      if (pinned.some(p => p.route === route)) return pinned;

      pinned.unshift({ route, title: title || route, note, pinnedAt: Date.now() });
      await chrome.storage.local.set({ pinnedRoutes: pinned });
      return pinned;
    },

    async unpinRoute(route) {
      const pinned = await this.getPinnedRoutes();
      const filtered = pinned.filter(p => p.route !== route);
      await chrome.storage.local.set({ pinnedRoutes: filtered });
      return filtered;
    },

    async updatePinNote(route, note) {
      const pinned = await this.getPinnedRoutes();
      const index = pinned.findIndex(p => p.route === route);
      if (index >= 0) {
        pinned[index].note = note;
        await chrome.storage.local.set({ pinnedRoutes: pinned });
      }
      return pinned;
    },

    // Route notes
    async getRouteNote(route) {
      const result = await chrome.storage.local.get(['routeNotes']);
      return (result.routeNotes || {})[route] || '';
    },

    async setRouteNote(route, note) {
      const result = await chrome.storage.local.get(['routeNotes']);
      const notes = result.routeNotes || {};
      if (note) notes[route] = note;
      else delete notes[route];
      await chrome.storage.local.set({ routeNotes: notes });
    },

    // Environments
    async getEnvironments() {
      const result = await chrome.storage.local.get(['environments']);
      return result.environments || { local: 'http://localhost:3000', staging: '', prod: '' };
    },

    async setEnvironments(envs) {
      await chrome.storage.local.set({ environments: envs });
    },

    // Project Mappings
    async getProjectMappings() {
      const result = await chrome.storage.local.get(['projectMappings']);
      return result.projectMappings || {};
    },

    // Project file/folder indexes (built from picked folder)
    async getProjectFileIndexes() {
      const result = await chrome.storage.local.get(['projectFileIndexes']);
      return result.projectFileIndexes || {};
    },

    async getLastPickedProjectIndex() {
      const result = await chrome.storage.local.get(['lastPickedProjectIndex']);
      return result.lastPickedProjectIndex || null;
    },

    async setLastPickedProjectIndex(data) {
      await chrome.storage.local.set({
        lastPickedProjectIndex: {
          alias: data?.alias || 'selected-project',
          files: Array.isArray(data?.files) ? data.files : [],
          folders: Array.isArray(data?.folders) ? data.folders : [],
          sourcePath: data?.sourcePath || '',
          updatedAt: Date.now()
        }
      });
    },

    // Editor preference
    async getEditorPreference() {
      const result = await chrome.storage.local.get(['editorPreference']);
      return result.editorPreference || { editor: 'cursor', autoCopyContext: true };
    },

    async setEditorPreference(prefs) {
      const current = await this.getEditorPreference();
      const merged = { ...current, ...prefs };
      await chrome.storage.local.set({ editorPreference: merged });
      return merged;
    },

    async getIndexPreferences() {
      const result = await chrome.storage.local.get(['indexPreferences']);
      const defaults = { extensions: ['tsx', 'ts', 'jsx', 'js', 'json', 'md'] };
      return {
        ...defaults,
        ...(result.indexPreferences || {})
      };
    },

    async setIndexPreferences(prefs) {
      const current = await this.getIndexPreferences();
      const merged = {
        ...current,
        ...(prefs || {}),
        updatedAt: Date.now()
      };
      await chrome.storage.local.set({ indexPreferences: merged });
      return merged;
    },

    async getProjectFileIndex(projectPath) {
      const indexes = await this.getProjectFileIndexes();
      return indexes[projectPath] || { files: [], folders: [], updatedAt: 0 };
    },

    async setProjectFileIndex(projectPath, data) {
      if (!projectPath) return;
      const indexes = await this.getProjectFileIndexes();
      indexes[projectPath] = {
        files: Array.isArray(data?.files) ? data.files : [],
        folders: Array.isArray(data?.folders) ? data.folders : [],
        updatedAt: Date.now()
      };
      await chrome.storage.local.set({ projectFileIndexes: indexes });
    },

    async addProjectMapping(key, project) {
      const mappings = await this.getProjectMappings();
      mappings[key] = {
        name: project.name,
        path: project.path,
        editor: project.editor || 'cursor',
        createdAt: Date.now(),
        ...project
      };
      await chrome.storage.local.set({ projectMappings: mappings });
      return mappings;
    },

    async removeProjectMapping(key) {
      const mappings = await this.getProjectMappings();
      delete mappings[key];
      await chrome.storage.local.set({ projectMappings: mappings });
      return mappings;
    },

    async getProjectForUrl(url) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const host = urlObj.host; // include port when present
        const pathPrefix = urlObj.pathname.split('/')[1];
        const mappings = await this.getProjectMappings();

        const candidates = [];
        if (pathPrefix) {
          candidates.push(`${host}/${pathPrefix}`);
          if (host !== hostname) candidates.push(`${hostname}/${pathPrefix}`);
        }
        candidates.push(host);
        if (host !== hostname) candidates.push(hostname);

        for (const key of candidates) {
          if (mappings[key]) {
            return { ...mappings[key], key };
          }
        }

        return null;
      } catch (e) {
        return null;
      }
    },

    // Project ↔ API Docs pinning
    async getProjectApiDocs(projectPath) {
      if (!projectPath) return [];
      const result = await chrome.storage.local.get(['projectApiDocs']);
      const map = result.projectApiDocs || {};
      return map[projectPath] || [];
    },

    async pinApiDocToProject(projectPath, docId) {
      if (!projectPath || !docId) return;
      const docs = await this.getProjectApiDocs(projectPath);
      if (!docs.includes(docId)) {
        docs.push(docId);
        const result = await chrome.storage.local.get(['projectApiDocs']);
        const map = result.projectApiDocs || {};
        map[projectPath] = docs;
        await chrome.storage.local.set({ projectApiDocs: map });
      }
      return docs;
    },

    async unpinApiDocFromProject(projectPath, docId) {
      if (!projectPath || !docId) return;
      const docs = await this.getProjectApiDocs(projectPath);
      const filtered = docs.filter(id => id !== docId);
      const result = await chrome.storage.local.get(['projectApiDocs']);
      const map = result.projectApiDocs || {};
      map[projectPath] = filtered;
      await chrome.storage.local.set({ projectApiDocs: map });
      return filtered;
    }
  };


  // ═════════════════════════════════════════════════════════════════════════════
  // NexusWidget Class
  // ═════════════════════════════════════════════════════════════════════════════
  class NexusWidget {
    constructor() {
      // DOM Elements
      this.container = null;
      this.shadow = null;
      this.root = null;

      // State
      this.isConnected = false;
      this.isDragging = false;
      this.dragStartTime = 0;
      this.hasDragged = false;

      // Resize State
      this.state = 'expanded'; // 'collapsed' | 'expanded' | 'bigger'
      this.lastExpandedState = 'expanded';
      this.lastPosition = { x: window.innerWidth - 420, y: 20 };
      this.dragOffset = { x: 0, y: 0 };

      // App State
      this.appState = {
        currentRoute: window.location.pathname + window.location.search,
        currentTitle: document.title,
        activeTab: 'capture', // capture | navigate | debug
        debugInfo: { errors: [], network: [] }
      };

      // Prompt suggestions state
      this.promptSuggestions = [];
      this.promptSuggestionIndex = 0;
      this.promptTokenInfo = null;
      this.pendingProjectIndex = null;
      this.pendingProjectAlias = 'selected-project';
      this.indexExtensions = ['tsx', 'ts', 'jsx', 'js', 'json', 'md'];

      this.networkEntries = [];
      this.networkSearchText = '';

      this.lastReqCount = 0;
      this.contextInvalidated = false;
      this.debugPollTimer = null;
      this.storageChangeListener = null;

      // Icons (Lucide)
      this.icons = {
        logo: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        close: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        minimize: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        maximize: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
        drag: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',
        copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        camera: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
        brain: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        moon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
        sun: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
        settings: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1 1-1.74v-.47a2 2 0 0 1-1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
      };

      this.init();
    }

    async init() {
      if (this.container) return;

      this.container = document.createElement('div');
      this.container.id = 'nexus-widget-root';
      this.shadow = this.container.attachShadow({ mode: 'open', delegatesFocus: true });
      document.body.appendChild(this.container);

      // Prevent ALL widget interactions from bubbling to the page.
      // With delegatesFocus: true on the shadow root, the browser handles
      // focus inside the shadow DOM automatically — we no longer need to
      // let mousedown/pointerdown propagate for focusable elements.
      const stopProp = (e) => e.stopPropagation();
      ['mousedown', 'mouseup', 'click', 'pointerdown', 'pointerup'].forEach((ev) => {
        this.container.addEventListener(ev, stopProp, false);
      });

      // Inject Styles & Content
      this.injectStyles();
      this.buildUI();

      // Load State
      await this.loadState();

      // Attach Logic
      await this.setupInteraction();
      this.setupPeekPin();
      this.setupAutocomplete();
      this.setupSpeechRecognition();
      this.setupObservables();
      this.setupRouteTracking();

      // Auto-show check
      chrome.storage.local.get(['widgetAutoShow']).then(res => {
        if (res.widgetAutoShow !== false) this.toggle(true);
        else this.container.style.display = 'none';
      });

      // Track current route immediately (fallback independent of background worker)
      this.trackCurrentRoute();

      // Load editor preference and update labels
      Storage.getEditorPreference().then(prefs => {
        this.updateEditorLabels(prefs.editor || 'cursor');
      });

      console.log('[Nexus Helper] ShadCN Widget Initialized');
    }

    async trackCurrentRoute() {
      try {
        const route = window.location.pathname + window.location.search;
        await Storage.addRecentRoute(route, document.title, window.location.href);
        this.updateRecentList();
      } catch (e) {
        console.error('[Nexus Helper] Failed to track route:', e);
      }
    }

    setupRouteTracking() {
      // Track browser navigation changes
      window.addEventListener('popstate', () => this.trackCurrentRoute());
      window.addEventListener('hashchange', () => this.trackCurrentRoute());
      window.addEventListener('nexus-route-change', () => this.trackCurrentRoute());

      // Track SPA route changes
      if (!window.__nexusHistoryPatched) {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
          const result = originalPushState.apply(this, args);
          window.dispatchEvent(new Event('nexus-route-change'));
          return result;
        };

        history.replaceState = function (...args) {
          const result = originalReplaceState.apply(this, args);
          window.dispatchEvent(new Event('nexus-route-change'));
          return result;
        };

        window.__nexusHistoryPatched = true;
      }
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
        }

        /* ------------------------------------------------------------------
           ShadCN Design System (Zinc/Black/White)
           ------------------------------------------------------------------ */
        .nx-theme {
          --nx-bg: 0 0% 100%;
          --nx-fg: 240 10% 3.9%;
          --nx-card: 0 0% 100%;
          --nx-card-fg: 240 10% 3.9%;
          --nx-popover: 0 0% 100%;
          --nx-popover-fg: 240 10% 3.9%;
          --nx-primary: 240 5.9% 10%;
          --nx-primary-fg: 0 0% 98%;
          --nx-secondary: 240 4.8% 95.9%;
          --nx-secondary-fg: 240 5.9% 10%;
          --nx-muted: 240 4.8% 95.9%;
          --nx-muted-fg: 240 3.8% 46.1%;
          --nx-accent: 240 4.8% 95.9%;
          --nx-accent-fg: 240 5.9% 10%;
          --nx-destructive: 0 84.2% 60.2%;
          --nx-destructive-fg: 0 0% 98%;
          --nx-border: 240 5.9% 90%;
          --nx-input: 240 5.9% 90%;
          --nx-ring: 240 5.9% 10%;
          --nx-radius: 0.5rem;
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .nx-theme[data-mode="dark"] {
          --nx-bg: 240 10% 3.9%;
          --nx-fg: 0 0% 98%;
          --nx-card: 240 10% 3.9%;
          --nx-card-fg: 0 0% 98%;
          --nx-popover: 240 10% 3.9%;
          --nx-popover-fg: 0 0% 98%;
          --nx-primary: 0 0% 98%;
          --nx-primary-fg: 240 5.9% 10%;
          --nx-secondary: 240 3.7% 15.9%;
          --nx-secondary-fg: 0 0% 98%;
          --nx-muted: 240 3.7% 15.9%;
          --nx-muted-fg: 240 5% 64.9%;
          --nx-accent: 240 3.7% 15.9%;
          --nx-accent-fg: 0 0% 98%;
          --nx-destructive: 0 62.8% 30.6%;
          --nx-destructive-fg: 0 0% 98%;
          --nx-border: 240 3.7% 15.9%;
          --nx-input: 240 3.7% 15.9%;
          --nx-ring: 240 4.9% 83.9%;
        }

        /* ------------------------------------------------------------------
           Component Styles
           ------------------------------------------------------------------ */
        .nx-widget {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.5;
          color: hsl(var(--nx-fg));
          background-color: hsl(var(--nx-bg));
          border-radius: 12px;
          border: 1px solid hsl(var(--nx-border));
          box-shadow: 0 0 0 1px hsl(var(--nx-border) / 0.5),
                      0 8px 24px -4px rgba(0, 0, 0, 0.12),
                      0 2px 8px -2px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.2s ease,
                      transform 0.2s ease;
        }

        /* Dimensions — used only as initial defaults; custom sizes override via inline style */
        .nx-widget[data-state="expanded"] { width: 380px; height: 480px; }
        .nx-widget[data-state="bigger"] { width: 720px; height: 480px; }
        .nx-widget[data-state="collapsed"] {
          width: auto !important;
          height: auto !important;
          border-radius: 50px;
          min-width: unset;
          overflow: visible;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 0 1px hsl(var(--nx-border) / 0.3);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* ── Peek mode: expanded/bigger start compact, reveal on hover ── */
        .nx-peek-trigger {
          display: none;
          align-items: center;
          justify-content: center;
          padding: 4px;
          cursor: grab;
          user-select: none;
        }

        /* In peek mode (not pinned), show the trigger and hide the full UI */
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-peek-trigger,
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-peek-trigger {
          display: flex;
        }
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-header,
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-health-bar,
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-content,
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-edge,
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-header,
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-health-bar,
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-content,
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) .nx-edge {
          display: none;
        }
        /* Compact circle when peeking */
        .nx-widget[data-state="expanded"]:not([data-pinned="true"]):not(:hover):not(.is-dragging),
        .nx-widget[data-state="bigger"]:not([data-pinned="true"]):not(:hover):not(.is-dragging) {
          width: auto !important;
          height: auto !important;
          border-radius: 50px;
          overflow: visible;
        }
        /* Smooth transitions when entering/leaving peek */
        .nx-widget[data-state="expanded"],
        .nx-widget[data-state="bigger"] {
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.2s ease,
                      transform 0.2s ease;
        }

        /* Header */
        .nx-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid hsl(var(--nx-border));
          background-color: hsl(var(--nx-bg) / 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: relative;
          z-index: 10;
          cursor: grab;
          user-select: none;
        }
        .nx-header:active { cursor: grabbing; }

        .nx-title-grp { display: flex; align-items: center; gap: 8px; }
        .nx-logo-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          background: linear-gradient(135deg, hsl(var(--nx-primary)), hsl(var(--nx-primary) / 0.8));
          color: hsl(var(--nx-primary-fg));
          border-radius: 7px;
        }
        .nx-title { font-weight: 600; font-size: 13px; letter-spacing: -0.025em; }
        
        .nx-controls { display: flex; gap: 2px; align-items: center; }

        /* ── Header user menu ─────────────────────────── */
        .nx-user-menu-wrap {
          position: relative;
          margin-right: 2px;
        }
        .nx-user-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          transition: box-shadow 0.15s, opacity 0.15s;
          padding: 0;
        }
        .nx-user-btn.signed-out {
          background: hsl(var(--nx-secondary));
          color: hsl(var(--nx-muted-fg));
          border: 1px dashed hsl(var(--nx-border));
        }
        .nx-user-btn.signed-out:hover { border-color: hsl(var(--nx-primary)); color: hsl(var(--nx-primary)); }
        .nx-user-btn.signed-in {
          background: hsl(var(--nx-primary));
          color: hsl(var(--nx-primary-fg));
          border: 2px solid hsl(var(--nx-primary));
        }
        .nx-user-btn.signed-in:hover { box-shadow: 0 0 0 2px hsl(var(--nx-primary) / 0.3); }

        .nx-user-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 190px;
          background-color: hsl(var(--nx-bg));
          border: 1px solid hsl(var(--nx-border));
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12);
          z-index: 9999;
          padding: 4px 0;
          animation: fade-in 0.12s ease;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          opacity: 1;
        }
        .nx-user-dropdown.open { display: block; }

        .nx-user-dropdown-header {
          padding: 10px 12px;
          border-bottom: 1px solid hsl(var(--nx-border));
        }
        .nx-user-dropdown-email {
          font-size: 11px;
          font-weight: 500;
          color: hsl(var(--nx-fg));
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nx-user-dropdown-uid {
          font-size: 9px;
          color: hsl(var(--nx-muted-fg));
          margin-top: 1px;
        }
        .nx-user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 12px;
          border: none;
          background: transparent;
          color: hsl(var(--nx-fg));
          font-size: 11px;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }
        .nx-user-dropdown-item:hover { background: hsl(var(--nx-secondary)); }
        .nx-user-dropdown-item.danger { color: hsl(0 84% 60%); }
        .nx-user-dropdown-item.danger:hover { background: hsl(0 84% 60% / 0.08); }
        .nx-user-dropdown-sep {
          height: 1px;
          background: hsl(var(--nx-border));
          margin: 4px 0;
        }
        .nx-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          color: hsl(var(--nx-muted-fg));
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nx-btn-icon:hover { background-color: hsl(var(--nx-accent)); color: hsl(var(--nx-accent-fg)); }
        .nx-btn-icon.close:hover { background-color: hsl(var(--nx-destructive) / 0.1); color: hsl(var(--nx-destructive)); }

        /* Content Area */
        .nx-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; background-color: hsl(var(--nx-bg)); }

        /* Tabs */
        .nx-tabs {
          display: flex;
          border-bottom: 1px solid hsl(var(--nx-border));
          padding: 0 12px;
          gap: 2px;
          background: hsl(var(--nx-bg) / 0.6);
        }
        .nx-tab {
          position: relative;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 500;
          color: hsl(var(--nx-muted-fg));
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }
        .nx-tab:hover { color: hsl(var(--nx-fg)); }
        .nx-tab[data-active="true"] { color: hsl(var(--nx-fg)); border-bottom-color: hsl(var(--nx-fg)); font-weight: 600; }

        /* Panels */
        .nx-panel { display: none; flex: 1; overflow-y: auto; padding: 12px; }
        .nx-panel[data-active="true"] { display: flex; flex-direction: column; animation: fade-in 0.15s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Scrollbar */
        .nx-panel::-webkit-scrollbar,
        #network-list::-webkit-scrollbar { width: 5px; }
        .nx-panel::-webkit-scrollbar-track,
        #network-list::-webkit-scrollbar-track { background: transparent; }
        .nx-panel::-webkit-scrollbar-thumb,
        #network-list::-webkit-scrollbar-thumb { background: hsl(var(--nx-muted-fg) / 0.2); border-radius: 4px; }
        .nx-panel::-webkit-scrollbar-thumb:hover,
        #network-list::-webkit-scrollbar-thumb:hover { background: hsl(var(--nx-muted-fg) / 0.35); }

        /* Cards */
        .nx-card {
          border: 1px solid hsl(var(--nx-border));
          border-radius: 10px;
          background-color: hsl(var(--nx-card));
          color: hsl(var(--nx-card-fg));
          padding: 12px;
          margin-bottom: 8px;
        }
        .flex-grow { flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .nx-card.compact { padding: 8px 10px; margin-bottom: 0; }
        .nx-card-title { font-size: 11px; font-weight: 600; margin-bottom: 6px; color: hsl(var(--nx-muted-fg)); display: flex; align-items: center; gap: 5px; letter-spacing: 0.02em; text-transform: uppercase; }

        /* Quick Actions — inline compact row */
        .nx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .nx-grid.inline { display: flex; gap: 4px; }
        .nx-action-btn {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 10px;
          border: 1px solid hsl(var(--nx-border));
          border-radius: 6px;
          background-color: hsl(var(--nx-secondary) / 0.3);
          color: hsl(var(--nx-secondary-fg));
          cursor: pointer;
          transition: all 0.12s ease;
          min-height: auto;
          flex: 1;
        }
        .nx-action-btn:hover { background-color: hsl(var(--nx-accent)); border-color: hsl(var(--nx-ring) / 0.15); color: hsl(var(--nx-accent-fg)); }
        .nx-action-btn:active { transform: scale(0.98); }
        .nx-action-label { font-size: 10px; font-weight: 500; color: inherit; text-align: center; line-height: 1.2; letter-spacing: 0.01em; }
        
        /* Compact Horizontal Buttons (for prompts) */
        .nx-action-btn.compact {
           flex-direction: row;
           padding: 4px 8px;
           min-height: auto;
           gap: 4px;
           background-color: transparent;
           border-color: transparent;
           flex: 0;
        }
        .nx-action-btn.compact:hover { background-color: hsl(var(--nx-accent)); }
        .nx-action-btn.compact .nx-action-label { font-size: 10px; }

        /* Inputs */
        .nx-input {
          width: 100%;
          padding: 6px 10px;
          border-radius: 7px;
          border: 1px solid hsl(var(--nx-input));
          background-color: hsl(var(--nx-secondary) / 0.3);
          color: hsl(var(--nx-fg));
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .nx-input::placeholder { color: hsl(var(--nx-muted-fg) / 0.6); font-size: 11px; }
        .nx-input:focus { border-color: hsl(var(--nx-ring)); outline: none; box-shadow: 0 0 0 3px hsl(var(--nx-ring) / 0.1); background-color: transparent; }
        /* Select dropdown — inherits .nx-input base */
        select.nx-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          padding-right: 26px;
          cursor: pointer;
        }
        select.nx-select option {
          background: hsl(var(--nx-bg));
          color: hsl(var(--nx-fg));
        }
        .nx-checkbox-row {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .nx-checkbox-row input[type="checkbox"] {
          accent-color: hsl(var(--nx-primary));
          width: 14px;
          height: 14px;
          margin: 0;
          cursor: pointer;
        }

        /* Lists */
        .nx-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: 6px;
          margin-bottom: 3px;
          font-size: 12px;
          color: hsl(var(--nx-muted-fg));
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .nx-list-item:hover { background-color: hsl(var(--nx-accent)); color: hsl(var(--nx-fg)); }
        
        .nx-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
          border: 1px solid transparent;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          transition: colors 0.2s ease;
        }
        .nx-badge.outline { background:transparent; border:1px solid hsl(var(--nx-border)); color:hsl(var(--nx-muted-fg)); }
    
    /* ── Editor with toolbar ── */
    .nx-editor-wrap {
      border: 1px solid hsl(var(--nx-border));
      border-radius: 10px;
      background: hsl(var(--nx-card));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
      transition: border-color 0.15s ease;
    }
    .nx-editor-wrap:focus-within {
      border-color: hsl(var(--nx-ring));
      box-shadow: 0 0 0 3px hsl(var(--nx-ring) / 0.08);
    }
    .nx-editor-inner {
      position: relative;
      flex: 1;
      display: flex;
      min-height: 0;
      z-index: 1;
    }
    .nx-prompt-clear {
      position: absolute;
      bottom: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: none;
      background: hsl(var(--nx-muted-fg) / 0.15);
      color: hsl(var(--nx-muted-fg));
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      z-index: 3;
      transition: background 0.12s, color 0.12s;
    }
    .nx-prompt-clear:hover { background: hsl(0 84% 60% / 0.15); color: hsl(0 84% 60%); }
    .nx-prompt-clear.visible { display: flex; }
    .nx-editor-textarea {
      flex: 1;
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 10px 12px 6px !important;
      font-size: 12px !important;
      resize: none;
      min-height: 120px;
      position: relative;
      z-index: 2;
      caret-color: hsl(var(--nx-fg));
    }
    .nx-editor-textarea:focus {
      box-shadow: none !important;
      border: none !important;
    }
    /* Ghost text overlay — mirrors textarea layout */
    .nx-ghost-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: 10px 12px 6px;
      font-family: inherit;
      font-size: 12px;
      line-height: 1.5;
      color: transparent;
      z-index: 1;
      box-sizing: border-box;
    }
    .nx-ghost-text {
      color: hsl(var(--nx-muted-fg) / 0.35);
    }
    /* Tab hint badge */
    .nx-tab-hint {
      position: absolute;
      bottom: 6px;
      right: 8px;
      display: none;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 4px;
      background: hsl(var(--nx-secondary));
      border: 1px solid hsl(var(--nx-border));
      color: hsl(var(--nx-muted-fg));
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.03em;
      z-index: 3;
      pointer-events: none;
      animation: fade-in 0.15s ease;
    }
    .nx-tab-hint.visible { display: flex; }

    /* Intent indicator badge — floats inside editor */
    .nx-intent-badge {
      position: absolute;
      top: 6px;
      right: 8px;
      display: none;
      align-items: center;
      gap: 5px;
      padding: 2px 4px 2px 8px;
      border-radius: 10px;
      background: hsl(var(--nx-secondary));
      border: 1px solid hsl(var(--nx-border));
      color: hsl(var(--nx-muted-fg));
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.02em;
      z-index: 4;
      animation: fade-in 0.15s ease;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      user-select: none;
    }
    .nx-intent-badge.visible { display: flex; }
    .nx-intent-badge[data-intent="bug"] { background: hsl(0 84% 60% / 0.1); border-color: hsl(0 84% 60% / 0.25); color: hsl(0 84% 60%); }
    .nx-intent-badge[data-intent="ui"] { background: hsl(221 83% 53% / 0.1); border-color: hsl(221 83% 53% / 0.25); color: hsl(221 83% 53%); }
    .nx-intent-badge[data-intent="performance"] { background: hsl(38 92% 50% / 0.1); border-color: hsl(38 92% 50% / 0.25); color: hsl(38 92% 50%); }
    .nx-intent-badge[data-intent="data"] { background: hsl(262 83% 58% / 0.1); border-color: hsl(262 83% 58% / 0.25); color: hsl(262 83% 58%); }
    .nx-intent-badge[data-intent="a11y"] { background: hsl(142 76% 36% / 0.1); border-color: hsl(142 76% 36% / 0.25); color: hsl(142 76% 36%); }
    .nx-intent-badge[data-intent="routing"] { background: hsl(199 89% 48% / 0.1); border-color: hsl(199 89% 48% / 0.25); color: hsl(199 89% 48%); }
    .nx-intent-badge[data-intent="form"] { background: hsl(221 83% 53% / 0.1); border-color: hsl(221 83% 53% / 0.25); color: hsl(221 83% 53%); }
    .nx-intent-badge .nx-intent-label { pointer-events: none; }
    .nx-intent-dismiss {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      opacity: 0.6;
      transition: opacity 0.12s ease, background 0.12s ease;
      font-size: 10px;
      line-height: 1;
    }
    .nx-intent-dismiss:hover { opacity: 1; background: hsl(var(--nx-border) / 0.5); }

    /* ── Auth form styles ─────────────────────────────── */
    .nx-auth-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 8px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid hsl(var(--nx-border));
    }
    .nx-auth-tab {
      flex: 1;
      padding: 5px 0;
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      background: transparent;
      color: hsl(var(--nx-muted-fg));
      border: none;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .nx-auth-tab[data-active="true"] {
      background: hsl(var(--nx-primary));
      color: hsl(var(--nx-primary-fg));
    }
    .nx-auth-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }
    .nx-auth-divider::before, .nx-auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: hsl(var(--nx-border));
    }
    .nx-auth-divider span {
      font-size: 9px;
      color: hsl(var(--nx-muted-fg));
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nx-google-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: hsl(var(--nx-bg)) !important;
      color: hsl(var(--nx-fg)) !important;
      border: 1px solid hsl(var(--nx-border)) !important;
      transition: background 0.15s, border-color 0.15s;
    }
    .nx-google-btn:hover {
      background: hsl(var(--nx-secondary)) !important;
      border-color: hsl(var(--nx-muted-fg) / 0.3) !important;
    }
    .nx-google-btn svg { flex-shrink: 0; }
    .nx-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: hsl(var(--nx-primary));
      color: hsl(var(--nx-primary-fg));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    /* ── API Docs panel ───────────────────────────────── */
    .nx-api-docs-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 380px;
      overflow-y: auto;
    }
    .nx-api-doc-card {
      padding: 8px 10px;
      border-radius: 7px;
      border: 1px solid hsl(var(--nx-border));
      background: hsl(var(--nx-secondary) / 0.3);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .nx-api-doc-card:hover {
      border-color: hsl(var(--nx-primary) / 0.4);
      background: hsl(var(--nx-secondary) / 0.6);
    }
    .nx-api-doc-name {
      font-size: 11px;
      font-weight: 600;
      color: hsl(var(--nx-fg));
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .nx-api-doc-description {
      font-size: 9px;
      color: hsl(var(--nx-muted-fg));
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .nx-api-doc-stats {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .nx-api-doc-stat {
      font-size: 9px;
      color: hsl(var(--nx-muted-fg));
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .nx-api-doc-stat .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: hsl(var(--nx-primary));
    }
    .nx-api-doc-card-header {
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }
    .nx-api-doc-card-body {
      flex: 1;
      min-width: 0;
    }
    .nx-api-pin-btn {
      flex-shrink: 0;
      background: none;
      border: 1px solid hsl(var(--nx-border));
      border-radius: 5px;
      color: hsl(var(--nx-muted-fg));
      cursor: pointer;
      padding: 3px 5px;
      font-size: 9px;
      display: flex;
      align-items: center;
      gap: 3px;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .nx-api-pin-btn:hover {
      border-color: hsl(var(--nx-primary) / 0.5);
      color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.08);
    }
    .nx-api-pin-btn.pinned {
      border-color: hsl(var(--nx-primary) / 0.4);
      color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.12);
    }
    .nx-api-pin-btn svg {
      width: 10px;
      height: 10px;
    }
    .nx-project-docs-hint {
      font-size: 9px;
      color: hsl(var(--nx-muted-fg));
      text-align: center;
      padding: 6px 8px;
      background: hsl(var(--nx-secondary) / 0.3);
      border-radius: 6px;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .nx-project-docs-hint strong {
      color: hsl(var(--nx-fg));
    }
    .nx-api-endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 340px;
      overflow-y: auto;
    }
    .nx-endpoint-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      border-radius: 5px;
      border: 1px solid hsl(var(--nx-border) / 0.5);
      font-size: 10px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .nx-endpoint-item:hover { background: hsl(var(--nx-secondary) / 0.5); }
    .nx-method-badge {
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      flex-shrink: 0;
      letter-spacing: 0.03em;
    }
    .nx-method-badge.get { background: hsl(142 76% 36% / 0.15); color: hsl(142 76% 36%); }
    .nx-method-badge.post { background: hsl(221 83% 53% / 0.15); color: hsl(221 83% 53%); }
    .nx-method-badge.put { background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 50%); }
    .nx-method-badge.patch { background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 50%); }
    .nx-method-badge.delete { background: hsl(0 84% 60% / 0.15); color: hsl(0 84% 60%); }
    .nx-endpoint-path {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10px;
      color: hsl(var(--nx-fg));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .nx-folder-header {
      font-size: 10px;
      font-weight: 600;
      color: hsl(var(--nx-muted-fg));
      padding: 6px 0 3px 0;
      border-bottom: 1px solid hsl(var(--nx-border) / 0.3);
      margin-top: 4px;
    }
    .nx-api-empty {
      text-align: center;
      padding: 24px 12px;
      color: hsl(var(--nx-muted-fg));
      font-size: 11px;
      line-height: 1.5;
    }

    .nx-editor-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      border-top: 1px solid hsl(var(--nx-border) / 0.5);
      position: relative;
      z-index: 5;
      background: hsl(var(--nx-secondary) / 0.25);
      flex-shrink: 0;
    }
    .nx-editor-toolbar-left {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .nx-toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: auto;
      min-width: 28px;
      height: 26px;
      padding: 0 6px;
      border-radius: 5px;
      border: none;
      background: transparent;
      color: hsl(var(--nx-muted-fg));
      cursor: pointer;
      transition: all 0.12s ease;
      font-size: 10px;
    }
    .nx-toolbar-btn:hover { background: hsl(var(--nx-accent)); color: hsl(var(--nx-fg)); }
    .nx-toolbar-btn:active { transform: scale(0.95); }
    .nx-toolbar-btn.active { background: hsl(var(--nx-primary) / 0.1); color: hsl(var(--nx-primary)); }
    .nx-toolbar-btn.recording { background: hsl(0 84% 60% / 0.12); color: hsl(0 84% 60%); animation: pulse-rec 1.2s ease-in-out infinite; }
    @keyframes pulse-rec { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .nx-toolbar-label { font-size: 10px; font-weight: 500; letter-spacing: 0.01em; }
    .nx-toolbar-sep {
      width: 1px;
      height: 14px;
      background: hsl(var(--nx-border));
      margin: 0 4px;
      flex-shrink: 0;
    }

    /* ── API Docs Attach Panel ─────────────────────── */
    .nx-api-attach-wrap {
      position: relative;
    }
    .nx-api-attach-panel {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      width: 300px;
      max-height: 340px;
      background-color: hsl(var(--nx-bg));
      border: 1px solid hsl(var(--nx-border));
      border-radius: 10px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1);
      z-index: 9999;
      overflow: hidden;
      animation: fade-in 0.12s ease;
      backdrop-filter: none;
    }
    .nx-api-attach-panel.open { display: flex; flex-direction: column; }
    .nx-api-attach-search {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-bottom: 1px solid hsl(var(--nx-border));
    }
    .nx-api-attach-search input {
      flex: 1;
      border: none;
      background: transparent;
      color: hsl(var(--nx-fg));
      font-size: 11px;
      outline: none;
      font-family: var(--font-sans);
    }
    .nx-api-attach-search input::placeholder { color: hsl(var(--nx-muted-fg)); }
    .nx-api-attach-search svg { flex-shrink: 0; color: hsl(var(--nx-muted-fg)); }
    .nx-api-attach-body {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      max-height: 240px;
    }
    .nx-api-attach-empty {
      padding: 20px 12px;
      text-align: center;
      font-size: 11px;
      color: hsl(var(--nx-muted-fg));
    }
    .nx-api-attach-loading {
      padding: 16px 12px;
      text-align: center;
      font-size: 11px;
      color: hsl(var(--nx-muted-fg));
    }
    .nx-api-attach-doc {
      padding: 5px 10px 5px 8px;
    }
    .nx-api-attach-doc-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      color: hsl(var(--nx-fg));
      user-select: none;
    }
    .nx-api-attach-doc-header:hover { color: hsl(var(--nx-primary)); }
    .nx-api-attach-doc-header .chevron {
      transition: transform 0.15s;
      flex-shrink: 0;
      color: hsl(var(--nx-muted-fg));
    }
    .nx-api-attach-doc-header.expanded .chevron { transform: rotate(90deg); }
    .nx-api-attach-doc-actions {
      display: flex;
      gap: 4px;
      margin-left: auto;
      flex-shrink: 0;
    }
    .nx-api-attach-link-btn {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid hsl(var(--nx-border));
      background: transparent;
      color: hsl(var(--nx-muted-fg));
      font-size: 9px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.12s;
    }
    .nx-api-attach-link-btn:hover {
      border-color: hsl(var(--nx-primary));
      color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.06);
    }
    .nx-api-attach-link-btn.attached {
      border-color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.12);
      color: hsl(var(--nx-primary));
    }
    .nx-api-attach-children {
      display: none;
      padding-left: 8px;
    }
    .nx-api-attach-children.open { display: block; }
    .nx-api-attach-folder {
      padding: 2px 0;
    }
    .nx-api-attach-folder-header {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 4px;
      cursor: pointer;
      font-size: 10px;
      color: hsl(var(--nx-fg));
      user-select: none;
      border-radius: 4px;
    }
    .nx-api-attach-folder-header:hover { background: hsl(var(--nx-secondary)); }
    .nx-api-attach-folder-header .chevron { transition: transform 0.15s; color: hsl(var(--nx-muted-fg)); }
    .nx-api-attach-folder-header.expanded .chevron { transform: rotate(90deg); }
    .nx-api-attach-endpoint {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 4px 3px 12px;
      font-size: 10px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.1s;
    }
    .nx-api-attach-endpoint:hover { background: hsl(var(--nx-secondary)); }
    .nx-api-attach-endpoint .nx-attach-method {
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      flex-shrink: 0;
      font-family: var(--font-mono);
    }
    .nx-attach-method.get { background: hsl(142 71% 45% / 0.15); color: hsl(142 71% 35%); }
    .nx-attach-method.post { background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 40%); }
    .nx-attach-method.put { background: hsl(221 83% 53% / 0.15); color: hsl(221 83% 45%); }
    .nx-attach-method.patch { background: hsl(262 83% 58% / 0.15); color: hsl(262 83% 48%); }
    .nx-attach-method.delete { background: hsl(0 84% 60% / 0.15); color: hsl(0 84% 50%); }
    .nx-api-attach-endpoint .nx-attach-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: hsl(var(--nx-fg));
    }
    .nx-api-attach-endpoint.attached {
      background: hsl(var(--nx-primary) / 0.08);
    }
    .nx-api-attach-endpoint.attached .nx-attach-name { color: hsl(var(--nx-primary)); }

    /* Attached items chips bar */
    .nx-attached-chips {
      display: none;
      flex-wrap: wrap;
      gap: 4px;
      padding: 4px 8px 2px 8px;
    }
    .nx-attached-chips.has-items { display: flex; }
    .nx-attached-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 4px;
      background: hsl(var(--nx-primary) / 0.1);
      color: hsl(var(--nx-primary));
      font-size: 9px;
      font-family: var(--font-sans);
      max-width: 160px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nx-attached-chip .remove {
      cursor: pointer;
      font-size: 10px;
      opacity: 0.6;
      transition: opacity 0.1s;
    }
    .nx-attached-chip .remove:hover { opacity: 1; }

    /* API auto-suggest bar (appears when "implement/integrate" intent detected) */
    .nx-api-suggest-bar {
      display: none;
      padding: 4px 8px;
      border-top: 1px solid hsl(var(--nx-border) / 0.5);
    }
    .nx-api-suggest-bar.visible { display: block; }
    .nx-api-suggest-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      margin-bottom: 3px;
    }
    .nx-api-suggest-title {
      font-size: 9px;
      font-weight: 600;
      color: hsl(var(--nx-muted-fg));
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .nx-api-suggest-dismiss {
      font-size: 9px;
      color: hsl(var(--nx-muted-fg));
      cursor: pointer;
      background: none;
      border: none;
      padding: 0 2px;
    }
    .nx-api-suggest-dismiss:hover { color: hsl(var(--nx-fg)); }
    .nx-api-suggest-items {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-height: 60px;
      overflow-y: auto;
    }
    .nx-api-suggest-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 5px;
      border: 1px solid hsl(var(--nx-border));
      background: hsl(var(--nx-secondary) / 0.5);
      font-size: 10px;
      cursor: pointer;
      transition: all 0.12s;
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: hsl(var(--nx-fg));
    }
    .nx-api-suggest-item:hover {
      border-color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.08);
      color: hsl(var(--nx-primary));
    }
    .nx-api-suggest-item.attached {
      border-color: hsl(var(--nx-primary));
      background: hsl(var(--nx-primary) / 0.12);
      color: hsl(var(--nx-primary));
    }
    .nx-api-suggest-item .nx-suggest-method {
      font-size: 7px;
      font-weight: 700;
      padding: 1px 3px;
      border-radius: 2px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      flex-shrink: 0;
    }
    .nx-suggest-method.get { background: hsl(142 71% 45% / 0.15); color: hsl(142 71% 35%); }
    .nx-suggest-method.post { background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 40%); }
    .nx-suggest-method.put { background: hsl(221 83% 53% / 0.15); color: hsl(221 83% 45%); }
    .nx-suggest-method.patch { background: hsl(262 83% 58% / 0.15); color: hsl(262 83% 48%); }
    .nx-suggest-method.delete { background: hsl(0 84% 60% / 0.15); color: hsl(0 84% 50%); }
    .nx-suggest-no-match {
      font-size: 10px;
      color: hsl(var(--nx-muted-fg));
      padding: 2px 0;
    }

    /* Prompt suggestions */
    .nx-prompt-hint {
      margin-top: 4px;
      font-size: 10px;
      color: hsl(var(--nx-muted-fg));
      line-height: 1.4;
    }
    #prompt-suggest-menu {
      display: none;
      margin-top: 8px;
      border: 1px solid hsl(var(--nx-border));
      border-radius: 8px;
      overflow: hidden;
      background: hsl(var(--nx-bg));
      max-height: 180px;
      overflow-y: auto;
    }
    #prompt-suggest-menu.active { display: block; }
    .nx-suggest-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 10px;
      border-bottom: 1px solid hsl(var(--nx-border));
      cursor: pointer;
      font-size: 12px;
    }
    .nx-suggest-item:last-child { border-bottom: none; }
    .nx-suggest-item:hover,
    .nx-suggest-item.active { background: hsl(var(--nx-accent)); }
    .nx-suggest-main { min-width: 0; }
    .nx-suggest-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }
    .nx-suggest-sub {
      font-size: 10px;
      color: hsl(var(--nx-muted-fg));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .nx-suggest-tag {
      font-size: 10px;
      border: 1px solid hsl(var(--nx-border));
      border-radius: 999px;
      padding: 2px 6px;
      color: hsl(var(--nx-muted-fg));
      flex-shrink: 0;
    }
        .nx-badge.success { background-color: hsl(142 76% 36% / 0.1); color: hsl(142 76% 36%); }
        .nx-badge.error { background-color: hsl(0 84.2% 60.2% / 0.1); color: hsl(0 84.2% 60.2%); }
        .nx-badge.warning { background-color: hsl(38 92% 50% / 0.1); color: hsl(38 92% 50%); }

        /* ── Page Health Indicator ── */
        .nx-health {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: -0.01em;
          border: 1px solid transparent;
          transition: all 0.3s ease;
          cursor: default;
        }
        .nx-health-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background-color 0.3s ease;
        }
        .nx-health[data-status="healthy"] { background: hsl(142 76% 36% / 0.08); border-color: hsl(142 76% 36% / 0.2); color: hsl(142 76% 36%); }
        .nx-health[data-status="healthy"] .nx-health-dot { background: hsl(142 76% 36%); box-shadow: 0 0 6px hsl(142 76% 36% / 0.4); }
        .nx-health[data-status="warning"] { background: hsl(38 92% 50% / 0.08); border-color: hsl(38 92% 50% / 0.2); color: hsl(38 92% 50%); }
        .nx-health[data-status="warning"] .nx-health-dot { background: hsl(38 92% 50%); box-shadow: 0 0 6px hsl(38 92% 50% / 0.4); }
        .nx-health[data-status="critical"] { background: hsl(0 84% 60% / 0.08); border-color: hsl(0 84% 60% / 0.2); color: hsl(0 84% 60%); }
        .nx-health[data-status="critical"] .nx-health-dot { background: hsl(0 84% 60%); box-shadow: 0 0 6px hsl(0 84% 60% / 0.4); }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .nx-health[data-status="critical"] .nx-health-dot { animation: pulse-dot 1.5s ease-in-out infinite; }

        .nx-health-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 14px;
          border-bottom: 1px solid hsl(var(--nx-border));
          font-size: 10px;
          gap: 10px;
        }
        .nx-health-stats {
          display: flex;
          align-items: center;
          gap: 10px;
          color: hsl(var(--nx-muted-fg));
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }
        .nx-health-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nx-health-stat .count { font-weight: 600; }
        .nx-health-stat.errors .count { color: hsl(0 84% 60%); }
        .nx-health-stat.warnings .count { color: hsl(38 92% 50%); }
        .nx-health-stat.requests .count { color: hsl(var(--nx-fg)); }

        /* ── Expandable Network Items ── */
        .nx-net-item {
          border: 1px solid hsl(var(--nx-border));
          border-radius: var(--nx-radius);
          margin-bottom: 6px;
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .nx-net-item:hover { border-color: hsl(var(--nx-ring) / 0.3); }
        .nx-net-item.error { border-left: 3px solid hsl(0 84% 60%); }

        .nx-net-summary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.15s ease;
        }
        .nx-net-summary:hover { background-color: hsl(var(--nx-accent) / 0.5); }

        .nx-net-method {
          font-size: 10px;
          font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          padding: 2px 6px;
          border-radius: 4px;
          min-width: 38px;
          text-align: center;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .nx-net-method.get { background: hsl(142 76% 36% / 0.1); color: hsl(142 76% 36%); }
        .nx-net-method.post { background: hsl(217 91% 60% / 0.1); color: hsl(217 91% 60%); }
        .nx-net-method.put { background: hsl(38 92% 50% / 0.1); color: hsl(38 92% 50%); }
        .nx-net-method.patch { background: hsl(280 68% 60% / 0.1); color: hsl(280 68% 60%); }
        .nx-net-method.delete { background: hsl(0 84% 60% / 0.1); color: hsl(0 84% 60%); }

        .nx-net-path {
          flex: 1;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: hsl(var(--nx-fg));
        }
        .nx-net-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .nx-net-duration {
          font-size: 10px;
          color: hsl(var(--nx-muted-fg));
          font-variant-numeric: tabular-nums;
        }
        .nx-net-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          font-variant-numeric: tabular-nums;
        }
        .nx-net-status.ok { background: hsl(142 76% 36% / 0.1); color: hsl(142 76% 36%); }
        .nx-net-status.err { background: hsl(0 84% 60% / 0.1); color: hsl(0 84% 60%); }

        .nx-net-detail {
          display: none;
          padding: 0 10px 10px 10px;
          border-top: 1px solid hsl(var(--nx-border));
          animation: fade-in 0.15s ease;
        }
        .nx-net-item.expanded .nx-net-detail { display: block; }
        .nx-net-item.expanded .nx-net-summary { background-color: hsl(var(--nx-accent) / 0.3); }

        .nx-net-detail-row {
          display: flex;
          gap: 6px;
          padding: 4px 0;
          font-size: 11px;
          color: hsl(var(--nx-muted-fg));
          word-break: break-all;
        }
        .nx-net-detail-row .label {
          font-weight: 600;
          color: hsl(var(--nx-fg));
          min-width: 55px;
          flex-shrink: 0;
        }
        .nx-net-detail-row .value {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10px;
          color: hsl(var(--nx-muted-fg));
        }

        .nx-net-actions {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .nx-net-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          border: 1px solid hsl(var(--nx-border));
          background: hsl(var(--nx-secondary) / 0.5);
          color: hsl(var(--nx-fg));
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nx-net-copy-btn:hover { background: hsl(var(--nx-accent)); border-color: hsl(var(--nx-ring) / 0.3); }
        .nx-net-copy-btn:active { transform: scale(0.97); }

        .nx-net-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          text-align: center;
          color: hsl(var(--nx-muted-fg));
        }
        .nx-net-empty-icon { font-size: 24px; margin-bottom: 8px; opacity: 0.4; }
        .nx-net-empty-text { font-size: 12px; }

        /* ═══ Minimized State ═══ */
        .nx-minimized {
          display: none;
          align-items: center;
          gap: 0px;
          padding: 0;
          overflow: hidden;
          white-space: nowrap;
        }
        .nx-widget[data-state="collapsed"] .nx-minimized { display: flex; }
        .nx-widget[data-state="collapsed"] .nx-content,
        .nx-widget[data-state="collapsed"] .nx-header,
        .nx-widget[data-state="collapsed"] .nx-health-bar { display: none; }

        /* ── Trigger capsule: logo + health dot ── */
        .nx-mini-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 10px;
          flex-shrink: 0;
          cursor: grab;
          transition: gap 0.3s ease;
        }
        .nx-mini-logo {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--nx-primary));
          flex-shrink: 0;
          filter: drop-shadow(0 0 4px hsl(var(--nx-primary) / 0.3));
        }
        .nx-mini-logo svg { width: 18px; height: 18px; }

        /* Health dot */
        .nx-mini-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(142 76% 36%);
          transition: background 0.3s;
          animation: nx-breathe 3s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes nx-breathe {
          0%, 100% { box-shadow: 0 0 3px 1px hsl(142 76% 36% / 0.4); transform: scale(1); }
          50%      { box-shadow: 0 0 8px 3px hsl(142 76% 36% / 0.2); transform: scale(1.2); }
        }

        /* ── Expanded pill area (slides out on hover) ── */
        .nx-minimized .nx-mini-expand {
          display: flex;
          align-items: center;
          gap: 4px;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          padding: 0;
          transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.25s ease 0.08s,
                      padding 0.3s ease;
        }
        .nx-widget[data-state="collapsed"]:hover .nx-mini-expand,
        .nx-widget[data-state="collapsed"].is-dragging .nx-mini-expand {
          max-width: 340px;
          opacity: 1;
          padding: 0 8px 0 2px;
        }

        /* Action buttons in the expanded pill */
        .nx-mini-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: hsl(var(--nx-muted-fg));
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s, color 0.12s, transform 0.12s;
          position: relative;
        }
        .nx-mini-action:hover {
          background: hsl(var(--nx-secondary));
          color: hsl(var(--nx-fg));
          transform: scale(1.08);
        }
        .nx-mini-action.primary {
          background: hsl(var(--nx-primary) / 0.1);
          color: hsl(var(--nx-primary));
        }
        .nx-mini-action.primary:hover {
          background: hsl(var(--nx-primary) / 0.2);
        }
        .nx-mini-action.danger:hover {
          background: hsl(0 84% 60% / 0.1);
          color: hsl(0 84% 60%);
        }

        .nx-mini-sep {
          width: 1px;
          height: 18px;
          background-color: hsl(var(--nx-border) / 0.5);
          margin: 0 2px;
          flex-shrink: 0;
        }

        /* Tooltips on mini actions */
        .nx-mini-action[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: hsl(var(--nx-popover));
          color: hsl(var(--nx-popover-fg));
          border: 1px solid hsl(var(--nx-border));
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 10px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          transition: opacity 0.12s ease, transform 0.12s ease;
          z-index: 1;
        }
        .nx-mini-action[data-tooltip]:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Legacy compat: keep .nx-btn-icon tooltips in minimized too */
        .nx-minimized .nx-btn-icon { position: relative; flex-shrink: 0; }
        .nx-minimized .nx-btn-icon[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: hsl(var(--nx-popover));
          color: hsl(var(--nx-popover-fg));
          border: 1px solid hsl(var(--nx-border));
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          transition: opacity 0.12s ease, transform 0.12s ease;
          z-index: 1;
        }
        .nx-minimized .nx-btn-icon[data-tooltip]:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Edge Resize Handles */
        .nx-edge { position: absolute; z-index: 11; }
        .nx-edge.top    { top: -3px; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
        .nx-edge.bottom { bottom: -3px; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
        .nx-edge.left   { left: -3px; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
        .nx-edge.right  { right: -3px; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
        .nx-edge.top-left     { top: -3px; left: -3px; width: 12px; height: 12px; cursor: nwse-resize; }
        .nx-edge.top-right    { top: -3px; right: -3px; width: 12px; height: 12px; cursor: nesw-resize; }
        .nx-edge.bottom-left  { bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: nesw-resize; }
        .nx-edge.bottom-right { bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: nwse-resize; }
        .nx-widget[data-state="collapsed"] .nx-edge { display: none; }

        /* Dragging */
        .nx-widget.is-dragging { opacity: 0.9; transform: scale(1.02); transition: none; pointer-events: none; }
        .nx-widget.is-dragging * { pointer-events: none; }

        /* Context presets row */
        .nx-presets {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .nx-preset-btn {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid hsl(var(--nx-border));
          background: transparent;
          color: hsl(var(--nx-muted-fg));
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
          white-space: nowrap;
        }
        .nx-preset-btn:hover { background: hsl(var(--nx-accent)); color: hsl(var(--nx-fg)); }
        .nx-preset-btn[data-active="true"] {
          background: hsl(var(--nx-primary));
          color: hsl(var(--nx-primary-fg));
          border-color: hsl(var(--nx-primary));
        }

        /* Token counter */
        .nx-token-counter {
          font-size: 10px;
          color: hsl(var(--nx-muted-fg));
          text-align: right;
          padding: 2px 0;
          transition: color 0.2s ease;
        }
        .nx-token-counter.nx-tokens-high { color: hsl(38 92% 50%); }
        .nx-token-counter.nx-tokens-danger { color: hsl(0 84% 60%); }

        .nx-collapsible { margin-top: 8px; }
        .nx-collapsible-toggle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid hsl(var(--nx-border));
          background: transparent;
          color: hsl(var(--nx-muted-fg));
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nx-collapsible-toggle:hover { background: hsl(var(--nx-accent)); color: hsl(var(--nx-fg)); }
        .nx-collapsible-toggle .nx-caret { transition: transform 0.15s ease; font-size: 10px; }
        .nx-collapsible[data-collapsed="true"] .nx-collapsible-toggle .nx-caret { transform: rotate(-90deg); }
        .nx-collapsible-content {
          margin-top: 6px;
          display: grid;
          max-height: 180px;
          overflow-y: auto;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          font-size: 11px;
          color: hsl(var(--nx-muted-fg));
        }
        .nx-collapsible-content label { cursor: pointer; transition: color 0.1s ease; }
        .nx-collapsible-content label:hover { color: hsl(var(--nx-fg)); }
        .nx-collapsible-content input[type="checkbox"] {
          accent-color: hsl(var(--nx-primary));
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
        .nx-collapsible[data-collapsed="true"] .nx-collapsible-content { display: none; }
      `;
      this.shadow.appendChild(style);
    }

    buildUI() {
      const theme = 'dark'; // Default starting theme

      const wrapper = document.createElement('div');
      wrapper.className = 'nx-widget nx-theme';
      wrapper.setAttribute('data-mode', theme);
      wrapper.setAttribute('data-state', this.state);

      wrapper.innerHTML = `
        <!-- Peek Trigger (compact circle when not hovered in expanded/bigger) -->
        <div class="nx-peek-trigger">
           <span class="nx-health-dot nx-mini-dot" id="peek-health-dot"></span>
        </div>

        <!-- Main Header -->
        <div class="nx-header">
           <div class="nx-title-grp">
              <div class="nx-logo-box">${this.icons.logo}</div>
              <span class="nx-title">Nexus</span>
              <div class="nx-health" id="health-indicator" data-status="healthy" title="Page health: analyzing...">
                <span class="nx-health-dot"></span>
                <span id="health-label">Healthy</span>
              </div>
           </div>
           <div class="nx-controls">
              <div class="nx-user-menu-wrap">
                 <button class="nx-user-btn signed-out" id="header-user-btn" title="Sign in">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </button>
                 <div class="nx-user-dropdown" id="header-user-dropdown">
                    <!-- Filled dynamically -->
                 </div>
              </div>
              <button class="nx-btn-icon" id="info-btn" title="About Nexus Helper"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button>
              <button class="nx-btn-icon" id="settings-btn" title="Settings">${this.icons.settings}</button>
              <button class="nx-btn-icon" id="theme-btn" title="Toggle Theme">${this.icons.moon}</button>
              <button class="nx-btn-icon" id="min-btn" title="Minimize">${this.icons.minimize}</button>
              <button class="nx-btn-icon" id="max-btn" title="Maximize">${this.icons.maximize}</button>
              <button class="nx-btn-icon close" id="close-btn" title="Close (Alt+N)">${this.icons.close}</button>
           </div>
        </div>

        <!-- Health Stats Bar -->
        <div class="nx-health-bar" id="health-bar">
          <div class="nx-health-stats">
            <div class="nx-health-stat errors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span class="count" id="health-errors">0</span> errors
            </div>
            <div class="nx-health-stat warnings">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span class="count" id="health-warnings">0</span> warn
            </div>
            <div class="nx-health-stat requests">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span class="count" id="health-requests">0</span> reqs
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="nx-content">
           <!-- Tabs -->
           <div class="nx-tabs">
              <div class="nx-tab" data-tab="capture" data-active="true">Capture</div>
              <div class="nx-tab" data-tab="debug">Network</div>
              <div class="nx-tab" data-tab="api-docs">API Docs</div>
              <div class="nx-tab" data-tab="navigation">Navigation</div>
              <div class="nx-tab" data-tab="settings">Settings</div>
           </div>

           <!-- Panel: Capture -->
           <div class="nx-panel" id="panel-capture" data-active="true">
              <!-- Editor area — grows to fill space -->
              <div class="nx-editor-wrap flex-grow">
                 <div class="nx-editor-inner">
                    <textarea class="nx-input nx-editor-textarea" id="ai-prompt" placeholder="Describe what you need. Type / to attach a route, @ to attach project file/folder..."></textarea>
                    <div class="nx-ghost-overlay" id="ghost-overlay" aria-hidden="true"></div>
                    <div class="nx-tab-hint" id="tab-hint">Tab ↹</div>
                    <div class="nx-intent-badge" id="intent-badge">
                       <span class="nx-intent-label" id="intent-label"></span>
                       <button class="nx-intent-dismiss" id="intent-dismiss" title="Cancel — use minimal context">✕</button>
                    </div>
                    <button class="nx-prompt-clear" id="prompt-clear-btn" title="Clear prompt and attachments">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                 </div>
                 <div class="nx-attached-chips" id="api-attached-chips"></div>
                 <div class="nx-api-suggest-bar" id="api-suggest-bar">
                    <div class="nx-api-suggest-header">
                       <span class="nx-api-suggest-title">API matches</span>
                       <button class="nx-api-suggest-dismiss" id="api-suggest-dismiss" title="Dismiss">✕</button>
                    </div>
                    <div class="nx-api-suggest-items" id="api-suggest-items"></div>
                 </div>
                 <!-- Toolbar inside editor — like chat attach/emoji bar -->
                 <div class="nx-editor-toolbar">
                    <div class="nx-editor-toolbar-left">
                       <button class="nx-toolbar-btn" id="pick-text-btn" title="Pick element text from page">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l3.057-3L21.943 13.886 18.886 16.943z"/><path d="m2 22 5.5-1.5L21.914 6.072a1 1 0 0 0 0-1.414L20.342 3.086a1 1 0 0 0-1.414 0L4.5 16.5Z"/></svg>
                       </button>
                       <button class="nx-toolbar-btn" id="attach-text-btn" title="Attach selected text from page">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                       </button>
                       <button class="nx-toolbar-btn" id="copy-bug-report-btn" title="Copy bug report">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
                       </button>
                       <div class="nx-api-attach-wrap">
                          <button class="nx-toolbar-btn" id="api-attach-btn" title="Attach API docs to context">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                          </button>
                          <div class="nx-api-attach-panel" id="api-attach-panel">
                             <div class="nx-api-attach-search">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input type="text" id="api-attach-search" placeholder="Search endpoints, folders..." autocomplete="off" />
                             </div>
                             <div class="nx-api-attach-body" id="api-attach-body">
                                <div class="nx-api-attach-empty">Sign in to attach API docs</div>
                             </div>
                          </div>
                       </div>
                       <button class="nx-toolbar-btn" id="mic-btn" title="Voice input (speech-to-text)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                       </button>
                       <div class="nx-toolbar-sep"></div>
                       <button class="nx-toolbar-btn" id="ctx-options-toggle" title="Context options">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span class="nx-toolbar-label">Options</span>
                       </button>
                    </div>
                 </div>
                 <div id="prompt-suggest-menu" aria-label="Prompt suggestions"></div>
                 <div class="nx-collapsible" data-collapsed="true" id="ctx-options">
                    <div class="nx-collapsible-content">
                       <div class="nx-presets">
                          <button class="nx-preset-btn" data-preset="auto" data-active="true" title="Auto-detect from prompt">Auto</button>
                          <button class="nx-preset-btn" data-preset="bug" title="Bug fix context">Bug Fix</button>
                          <button class="nx-preset-btn" data-preset="ui" title="UI/styling context">UI</button>
                          <button class="nx-preset-btn" data-preset="full" title="Everything on">Full</button>
                          <button class="nx-preset-btn" data-preset="minimal" title="Bare minimum">Minimal</button>
                       </div>
                       <div class="nx-token-counter" id="ctx-token-counter">~0 tokens</div>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-route" checked />Route</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-selection" checked />Selection</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-prompt" checked />Prompt</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-network" checked />Network</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-console" checked />Console</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-dom" />DOM</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-files" checked />Related Files</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-ui-state" checked />UI State</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-api-shapes" checked />API Shapes</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-route-params" checked />Route Params</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-components" checked />Components</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-framework" checked />Framework Info</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-structured-errors" checked />Error Traces</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-data-fetching" checked />Data Fetching</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-a11y" />Accessibility</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-layout-chain" checked />Layout Chain</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-viewport" />Viewport</label>
                       <label style="display:flex; gap:6px; align-items:center;"><input type="checkbox" id="ctx-include-perf" />Performance</label>
                    </div>
                 </div>
              </div>

              <!-- Quick Actions — compact inline row pinned at bottom -->
              <div class="nx-grid inline" style="flex-shrink:0; padding-top:6px;">
                 <div class="nx-action-btn" data-action="copy-route">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <span class="nx-action-label">Route</span>
                 </div>
                 <div class="nx-action-btn" id="copy-context-btn" data-action="copy-cursor-context">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span class="nx-action-label">Context</span>
                 </div>
                 <div class="nx-action-btn" data-action="copy-screenshot">
                    ${this.icons.camera}
                    <span class="nx-action-label">Screenshot</span>
                 </div>
                 <div class="nx-action-btn" data-action="open-cursor">
                    ${this.icons.cursor || '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'} 
                    <span class="nx-action-label nx-editor-label">Cursor</span>
                 </div>
              </div>
           </div>

           <!-- Panel: Debug -->
           <div class="nx-panel" id="panel-debug">
              <div class="nx-card flex-grow" style="padding:10px;">
                 <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                    <div class="nx-card-title" style="margin-bottom:0;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      Network
                    </div>
                    <span id="network-count-badge" class="nx-badge outline" style="font-size:10px;">0</span>
                 </div>
                 <input class="nx-input" id="network-search" placeholder="Filter by URL, method, or status..." style="margin-bottom:6px; font-size:11px;" />
                 <div id="network-list" style="flex:1; overflow-y: auto; min-height:0;">
                    <div class="nx-net-empty">
                      <div class="nx-net-empty-icon">📡</div>
                      <div class="nx-net-empty-text">Listening for requests...</div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Panel: Navigation -->
           <div class="nx-panel" id="panel-navigation">
              <div class="nx-card-title" style="flex-shrink:0;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                Routes
              </div>
              <input class="nx-input" id="route-search" placeholder="Search recent routes..." style="flex-shrink:0; margin-bottom:6px; font-size:11px;" />
              <div id="recent-list" class="nx-list" style="flex:1; overflow-y:auto; min-height:0;"></div>
           </div>

           <!-- Panel: Settings -->
           <div class="nx-panel" id="panel-settings">
              <div class="nx-card" style="padding:10px;">
                 <div class="nx-card-title">Project</div>
                 <div style="margin-bottom: 6px;">
                    <label style="display:block; font-size:11px; margin-bottom:3px; color:hsl(var(--nx-muted-fg));">Project Path</label>
                    <div style="display:flex; gap:6px;">
                       <input class="nx-input" id="setting-project-path" placeholder="/Users/.../my-app" style="flex:1; font-size:11px;" />
                       <button class="nx-action-btn compact" id="pick-folder-btn" title="Pick Folder" style="padding: 6px;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                       </button>
                    </div>
                    <button class="nx-action-btn compact" id="magic-detect-btn" style="width:100%; margin-top:6px; justify-content:center; background-color:hsl(var(--nx-primary)); color:hsl(var(--nx-primary-fg)); font-size:10px;">
                       ✨ Auto-Detect Path
                    </button>
                    <details style="margin-top:4px;">
                      <summary style="font-size:10px; color:hsl(var(--nx-muted-fg)); cursor:pointer;">Path help</summary>
                      <div style="font-size:10px; color:hsl(var(--nx-muted-fg)); margin-top:3px; line-height:1.4;">
                         <b>Mac:</b> Right-click folder + Hold ⌥ → "Copy as Pathname"<br>
                         <b>Win:</b> Shift + Right-click → "Copy as path"
                      </div>
                    </details>
                    <input type="file" id="folder-picker" webkitdirectory directory style="display:none;" />
                   <div style="margin-top:6px;">
                      <label style="display:block; font-size:11px; margin-bottom:3px; color:hsl(var(--nx-muted-fg));">Index extensions</label>
                      <input class="nx-input" id="index-ext-filter" placeholder="tsx,ts,jsx,js,json,md" style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:11px;" />
                   </div>
                   <div style="display:flex; gap:6px; margin-top:6px;">
                      <button class="nx-action-btn compact" id="reindex-btn" style="flex:1; justify-content:center; border:1px solid hsl(var(--nx-border)); font-size:10px;">♻ Re-index</button>
                      <button class="nx-action-btn compact" id="clear-index-filter-btn" style="justify-content:center; border:1px solid hsl(var(--nx-border)); font-size:10px;">Reset</button>
                   </div>
                   <div id="index-status" style="margin-top:6px; font-size:10px; color:hsl(var(--nx-muted-fg)); line-height:1.4; border:1px dashed hsl(var(--nx-border)); border-radius:6px; padding:6px;">
                      Not indexed yet
                   </div>
                 </div>
                 <button class="nx-action-btn" id="save-settings-btn" style="width:100%; justify-content:center; font-size:11px;">Save Configuration</button>
              </div>
              <!-- Account -->
              <div class="nx-card" style="padding:10px; margin-top:6px;">
                 <div class="nx-card-title">Account</div>
                 <!-- Logged out state -->
                 <div id="auth-logged-out">
                    <div class="nx-auth-tabs">
                       <button class="nx-auth-tab" data-auth-tab="login" data-active="true">Sign In</button>
                       <button class="nx-auth-tab" data-auth-tab="register" data-active="false">Register</button>
                    </div>
                    <div class="nx-auth-form" id="auth-login-form">
                       <input class="nx-input" id="auth-email" type="email" placeholder="Email" style="font-size:11px; margin-bottom:6px;" />
                       <input class="nx-input" id="auth-password" type="password" placeholder="Password" style="font-size:11px; margin-bottom:6px;" />
                       <div id="auth-error" style="display:none; font-size:10px; color:hsl(0 84% 60%); margin-bottom:6px; line-height:1.3;"></div>
                       <button class="nx-action-btn" id="auth-signin-btn" style="width:100%; justify-content:center; font-size:11px; background:hsl(var(--nx-primary)); color:hsl(var(--nx-primary-fg));">Sign In</button>
                       <div class="nx-auth-divider"><span>or</span></div>
                       <button class="nx-action-btn nx-google-btn" id="auth-google-btn" style="width:100%; justify-content:center; font-size:11px;">
                          <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.998 23.998 0 0 0 0 24c0 3.77.9 7.35 2.56 10.52l7.97-5.93z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.93C6.51 42.62 14.62 48 24 48z"/></svg>
                          Sign in with Google
                       </button>
                    </div>
                    <div class="nx-auth-form" id="auth-register-form" style="display:none;">
                       <input class="nx-input" id="auth-reg-email" type="email" placeholder="Email" style="font-size:11px; margin-bottom:6px;" />
                       <input class="nx-input" id="auth-reg-password" type="password" placeholder="Password (min 6 chars)" style="font-size:11px; margin-bottom:6px;" />
                       <input class="nx-input" id="auth-reg-confirm" type="password" placeholder="Confirm password" style="font-size:11px; margin-bottom:6px;" />
                       <div id="auth-reg-error" style="display:none; font-size:10px; color:hsl(0 84% 60%); margin-bottom:6px; line-height:1.3;"></div>
                       <button class="nx-action-btn" id="auth-register-btn" style="width:100%; justify-content:center; font-size:11px; background:hsl(var(--nx-primary)); color:hsl(var(--nx-primary-fg));">Create Account</button>
                       <div class="nx-auth-divider"><span>or</span></div>
                       <button class="nx-action-btn nx-google-btn" id="auth-google-btn-reg" style="width:100%; justify-content:center; font-size:11px;">
                          <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.998 23.998 0 0 0 0 24c0 3.77.9 7.35 2.56 10.52l7.97-5.93z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.93C6.51 42.62 14.62 48 24 48z"/></svg>
                          Sign up with Google
                       </button>
                    </div>
                 </div>
                 <!-- Logged in state -->
                 <div id="auth-logged-in" style="display:none;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                       <div class="nx-avatar" id="auth-avatar">U</div>
                       <div style="flex:1; min-width:0;">
                          <div id="auth-user-email" style="font-size:11px; font-weight:500; color:hsl(var(--nx-fg)); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></div>
                          <div id="auth-user-uid" style="font-size:9px; color:hsl(var(--nx-muted-fg)); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></div>
                       </div>
                    </div>
                    <button class="nx-action-btn compact" id="auth-signout-btn" style="width:100%; justify-content:center; border:1px solid hsl(var(--nx-border)); font-size:10px;">Sign Out</button>
                 </div>
              </div>
              <div class="nx-card compact" style="display:flex; align-items:center; justify-content:space-between;">
                 <span style="font-size:11px; color:hsl(var(--nx-muted-fg));">Version</span>
                 <span class="nx-badge outline">3.2.0</span>
              </div>
              <div class="nx-card" style="padding:10px; margin-top:6px;">
                 <div class="nx-card-title">Default Editor</div>
                 <div style="margin-bottom: 6px;">
                    <label style="display:block; font-size:11px; margin-bottom:3px; color:hsl(var(--nx-muted-fg));">Open with</label>
                    <select class="nx-input nx-select" id="setting-default-editor" style="font-size:11px; width:100%;">
                       <option value="cursor">Cursor</option>
                       <option value="antigravity">Antigravity</option>
                       <option value="vscode">VS Code</option>
                       <option value="windsurf">Windsurf</option>
                       <option value="zed">Zed</option>
                    </select>
                 </div>
                 <label class="nx-checkbox-row" style="display:flex; align-items:center; gap:6px; margin-top:6px; cursor:pointer;">
                    <input type="checkbox" id="setting-auto-copy-context" checked />
                    <span style="font-size:11px; color:hsl(var(--nx-fg));">Auto-copy context when opening editor</span>
                 </label>
                 <p style="font-size:9px; color:hsl(var(--nx-muted-fg)); margin:4px 0 0 0; line-height:1.4;">
                    When enabled, context is automatically copied to your clipboard before the editor opens — ready to paste.
                 </p>
              </div>
              <div class="nx-card" style="padding:10px; margin-top:6px;">
                 <div class="nx-card-title">Backup</div>
                 <div style="display:flex; gap:6px;">
                    <button class="nx-action-btn compact" id="export-settings-btn" style="flex:1; justify-content:center; border:1px solid hsl(var(--nx-border)); font-size:10px;">⬇ Export</button>
                    <button class="nx-action-btn compact" id="import-settings-btn" style="flex:1; justify-content:center; border:1px solid hsl(var(--nx-border)); font-size:10px;">⬆ Import</button>
                 </div>
                 <input type="file" id="import-file-input" accept=".json" style="display:none;" />
              </div>
           </div>

           <!-- Panel: API Docs -->
           <div class="nx-panel" id="panel-api-docs">
              <!-- Not logged in -->
              <div id="api-docs-auth-prompt" class="nx-card" style="padding:16px; text-align:center;">
                 <div style="font-size:20px; margin-bottom:8px;">🔒</div>
                 <div style="font-size:12px; font-weight:500; margin-bottom:4px; color:hsl(var(--nx-fg));">Sign in to access API Docs</div>
                 <p style="font-size:10px; color:hsl(var(--nx-muted-fg)); margin:0 0 10px 0; line-height:1.4;">
                    View your published Postman collections from the Nexus Docs platform.
                 </p>
                 <button class="nx-action-btn" id="api-docs-goto-login" style="justify-content:center; font-size:11px; background:hsl(var(--nx-primary)); color:hsl(var(--nx-primary-fg)); width:100%;">Go to Sign In</button>
              </div>
              <!-- Logged in — doc list -->
              <div id="api-docs-content" style="display:none;">
                 <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <span style="font-size:12px; font-weight:500; color:hsl(var(--nx-fg));">My API Collections</span>
                    <button class="nx-action-btn compact" id="api-docs-refresh" style="font-size:9px; border:1px solid hsl(var(--nx-border));">↻ Refresh</button>
                 </div>
                 <div id="api-docs-list" class="nx-api-docs-list">
                    <div style="text-align:center; padding:20px; color:hsl(var(--nx-muted-fg)); font-size:11px;">Loading...</div>
                 </div>
              </div>
              <!-- Doc detail view -->
              <div id="api-docs-detail" style="display:none;">
                 <button class="nx-action-btn compact" id="api-docs-back" style="font-size:10px; margin-bottom:8px; border:1px solid hsl(var(--nx-border));">← Back to list</button>
                 <div id="api-docs-detail-header" style="margin-bottom:8px;">
                    <div id="api-doc-title" style="font-size:13px; font-weight:600; color:hsl(var(--nx-fg));"></div>
                    <div id="api-doc-desc" style="font-size:10px; color:hsl(var(--nx-muted-fg)); margin-top:2px; line-height:1.3;"></div>
                    <div id="api-doc-meta" style="display:flex; gap:8px; margin-top:6px;"></div>
                 </div>
                 <div id="api-docs-endpoints" class="nx-api-endpoints-list"></div>
              </div>
           </div>
        </div>

        <!-- Minimized Bar -->
        <div class="nx-minimized">
           <div class="nx-mini-trigger">
              <div class="nx-mini-logo">${this.icons.logo}</div>
              <span class="nx-health-dot nx-mini-dot" id="mini-health-dot"></span>
           </div>
           <div class="nx-mini-expand">
              <button class="nx-mini-action" data-action="copy-screenshot" data-tooltip="Screenshot">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="nx-mini-action" data-action="copy-route" data-tooltip="Copy Route">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button class="nx-mini-action primary" data-action="copy-cursor-context" data-tooltip="Copy Context">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
              <button class="nx-mini-action primary nx-editor-btn" data-action="open-cursor" data-tooltip="Open Editor">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
              <div class="nx-mini-sep"></div>
              <button class="nx-mini-action" id="restore-btn" data-tooltip="Expand">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
              <button class="nx-mini-action danger" id="close-mini-btn" data-tooltip="Close">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
           </div>
        </div>

        <!-- Edge Resize Handles -->
        <div class="nx-edge top" data-edge="top"></div>
        <div class="nx-edge bottom" data-edge="bottom"></div>
        <div class="nx-edge left" data-edge="left"></div>
        <div class="nx-edge right" data-edge="right"></div>
        <div class="nx-edge top-left" data-edge="top-left"></div>
        <div class="nx-edge top-right" data-edge="top-right"></div>
        <div class="nx-edge bottom-left" data-edge="bottom-left"></div>
        <div class="nx-edge bottom-right" data-edge="bottom-right"></div>
      `;

      this.shadow.appendChild(wrapper);
      this.root = wrapper;
    }

    async setupInteraction() {
      // Logic for tabs
      const tabs = this.root.querySelectorAll('.nx-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.setAttribute('data-active', 'false'));
          tab.setAttribute('data-active', 'true');

          const target = tab.dataset.tab;
          const panels = this.root.querySelectorAll('.nx-panel');
          panels.forEach(p => p.setAttribute('data-active', 'false'));
          this.root.querySelector(`#panel-${target}`)?.setAttribute('data-active', 'true');

          // Auto-load API docs when tab is opened
          if (target === 'api-docs' && this._currentUser) {
            this.loadApiDocs();
          }
        });
      });

      // Logic for window controls
      this.root.querySelector('#info-btn')?.addEventListener('click', () => window.open('https://nexushelper.web.app', '_blank'));
      this.root.querySelector('#settings-btn').addEventListener('click', () => this.openSettings());
      this.root.querySelector('#min-btn').addEventListener('click', () => this.setState('collapsed'));
      this.root.querySelector('#max-btn').addEventListener('click', () => this.setState(this.state === 'expanded' ? 'bigger' : 'expanded'));
      this.root.querySelector('#close-btn').addEventListener('click', () => this.toggle(false));
      this.root.querySelector('#close-mini-btn').addEventListener('click', () => this.toggle(false));
      this.root.querySelector('#restore-btn').addEventListener('click', () => {
        this.setState(this.lastExpandedState || 'expanded');
      });

      // Theme Toggle
      const themeBtn = this.root.querySelector('#theme-btn');
      themeBtn.addEventListener('click', () => {
        const current = this.root.getAttribute('data-mode');
        const next = current === 'dark' ? 'light' : 'dark';
        this.root.setAttribute('data-mode', next);
        themeBtn.innerHTML = next === 'dark' ? this.icons.moon : this.icons.sun;
        chrome.storage.local.set({ theme: next });
      });

      // Actions
      this.root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
      });

      // Special Context Buttons
      this.root.querySelector('#copy-context-btn').addEventListener('click', () => this.copyContext());
      this.root.querySelector('#copy-bug-report-btn')?.addEventListener('click', () => this.copyBugReport());
      this.root.querySelector('#attach-text-btn').addEventListener('click', () => this.attachSelection());
      this.root.querySelector('#pick-text-btn').addEventListener('click', () => this.togglePicker());

      // API docs attach panel
      this.root.querySelector('#api-attach-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleApiAttachPanel();
      });
      const apiAttachSearch = this.root.querySelector('#api-attach-search');
      if (apiAttachSearch) {
        apiAttachSearch.addEventListener('input', () => {
          const query = apiAttachSearch.value;
          this.filterApiAttachPanel(query);
        });
        apiAttachSearch.addEventListener('click', (e) => e.stopPropagation());
      }
      // Close panel on outside click
      this.root.addEventListener('click', () => {
        this.root.querySelector('#api-attach-panel')?.classList.remove('open');
      });
      this.root.querySelector('#api-attach-panel')?.addEventListener('click', (e) => e.stopPropagation());

      // API suggest bar dismiss
      this.root.querySelector('#api-suggest-dismiss')?.addEventListener('click', () => {
        this._apiSuggestDismissed = true;
        this._apiSuggestDismissedText = this.root.querySelector('#ai-prompt')?.value || '';
        this.root.querySelector('#api-suggest-bar')?.classList.remove('visible');
      });

      this.root.querySelector('#save-settings-btn').addEventListener('click', () => this.saveSettings());
      this.root.querySelector('#reindex-btn')?.addEventListener('click', () => this.reindexProject(fileInput));
      this.root.querySelector('#clear-index-filter-btn')?.addEventListener('click', async () => {
        this.root.querySelector('#index-ext-filter').value = 'tsx,ts,jsx,js,json,md';
        this.indexExtensions = ['tsx', 'ts', 'jsx', 'js', 'json', 'md'];
        await Storage.setIndexPreferences({ extensions: this.indexExtensions });
        this.showToast('Index filter reset');
      });

      // Editor preference — auto-save on change
      this.root.querySelector('#setting-default-editor')?.addEventListener('change', () => this.saveEditorPreference());
      this.root.querySelector('#setting-auto-copy-context')?.addEventListener('change', () => this.saveEditorPreference());

      // ── Auth event listeners ─────────────────────────────────────────────
      // Auth tab toggle (login/register)
      this.root.querySelectorAll('.nx-auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const mode = tab.dataset.authTab;
          this.root.querySelectorAll('.nx-auth-tab').forEach(t => t.setAttribute('data-active', 'false'));
          tab.setAttribute('data-active', 'true');
          const loginForm = this.root.querySelector('#auth-login-form');
          const regForm = this.root.querySelector('#auth-register-form');
          if (loginForm) loginForm.style.display = mode === 'login' ? 'block' : 'none';
          if (regForm) regForm.style.display = mode === 'register' ? 'block' : 'none';
        });
      });

      // Sign in
      this.root.querySelector('#auth-signin-btn')?.addEventListener('click', () => this.handleSignIn());
      // Sign in on Enter key
      this.root.querySelector('#auth-password')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSignIn();
      });

      // Google sign in (both buttons trigger the same flow)
      this.root.querySelector('#auth-google-btn')?.addEventListener('click', () => this.handleGoogleSignIn());
      this.root.querySelector('#auth-google-btn-reg')?.addEventListener('click', () => this.handleGoogleSignIn());

      // Register
      this.root.querySelector('#auth-register-btn')?.addEventListener('click', () => this.handleRegister());
      this.root.querySelector('#auth-reg-confirm')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleRegister();
      });

      // Sign out
      this.root.querySelector('#auth-signout-btn')?.addEventListener('click', () => this.handleSignOut());

      // ── Header user menu ─────────────────────────────────────────────
      const userBtn = this.root.querySelector('#header-user-btn');
      const userDropdown = this.root.querySelector('#header-user-dropdown');
      if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this._currentUser) {
            // Not logged in → open settings to the auth section
            this.openSettings();
            setTimeout(() => {
              const authSection = this.root.querySelector('#auth-email');
              if (authSection) authSection.focus();
            }, 250);
            return;
          }
          userDropdown.classList.toggle('open');
        });
        // Close dropdown when clicking outside
        this.root.addEventListener('click', () => userDropdown.classList.remove('open'));
        userDropdown.addEventListener('click', (e) => e.stopPropagation());
      }

      // API Docs: go to login
      this.root.querySelector('#api-docs-goto-login')?.addEventListener('click', () => {
        // Switch to settings tab
        this.root.querySelectorAll('.nx-tab').forEach(t => t.setAttribute('data-active', 'false'));
        this.root.querySelectorAll('.nx-panel').forEach(p => p.setAttribute('data-active', 'false'));
        this.root.querySelector('[data-tab="settings"]')?.setAttribute('data-active', 'true');
        this.root.querySelector('#panel-settings')?.setAttribute('data-active', 'true');
      });

      // API Docs: refresh
      this.root.querySelector('#api-docs-refresh')?.addEventListener('click', () => this.loadApiDocs());

      // API Docs: back to list
      this.root.querySelector('#api-docs-back')?.addEventListener('click', () => this.showApiDocsList());

      // Check auth state on init
      this.checkAuthState();

      // Export / Import settings
      this.root.querySelector('#export-settings-btn')?.addEventListener('click', () => this.exportSettings());
      this.root.querySelector('#import-settings-btn')?.addEventListener('click', () => {
        this.root.querySelector('#import-file-input')?.click();
      });
      this.root.querySelector('#import-file-input')?.addEventListener('change', (e) => this.importSettings(e));

      // Prompt UX
      const promptInput = this.root.querySelector('#ai-prompt');
      const suggestMenu = this.root.querySelector('#prompt-suggest-menu');
      // Clear prompt button
      const clearBtn = this.root.querySelector('#prompt-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearPromptAndAttachments());
      }

      if (promptInput) {
        promptInput.addEventListener('input', () => {
          this.handlePromptInput();
          this.updateLivePreset();
          this.checkApiSuggest();
          this.updateClearBtnVisibility();
        });
        promptInput.addEventListener('click', () => this.handlePromptInput());
        promptInput.addEventListener('focus', () => this.handlePromptInput());
        promptInput.addEventListener('keydown', (e) => this.handlePromptKeydown(e));
        promptInput.addEventListener('blur', () => {
          setTimeout(() => this.hidePromptSuggestions(), 120);
        });
      }
      if (suggestMenu) {
        suggestMenu.addEventListener('mousedown', (e) => e.preventDefault());
      }

      const ctxToggle = this.root.querySelector('#ctx-options-toggle');
      const ctxOptions = this.root.querySelector('#ctx-options');
      if (ctxToggle && ctxOptions) {
        ctxToggle.addEventListener('click', () => {
          const isCollapsed = ctxOptions.getAttribute('data-collapsed') === 'true';
          const next = !isCollapsed;
          ctxOptions.setAttribute('data-collapsed', String(next));
          ctxToggle.setAttribute('aria-expanded', String(!next));
        });
      }

      // Context preset buttons
      this._activePreset = 'auto';
      this._intentDismissed = false;
      this.root.querySelectorAll('.nx-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._intentDismissed = false; // reset dismiss when user picks a preset
          this.applyPreset(btn.dataset.preset);
        });
      });

      // Intent badge dismiss button
      this.root.querySelector('#intent-dismiss')?.addEventListener('click', () => this.dismissIntent());

      // When user manually changes a checkbox, switch preset indicator to none
      this.root.querySelectorAll('#ctx-options input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          this._activePreset = null;
          this.root.querySelectorAll('.nx-preset-btn').forEach(b => b.setAttribute('data-active', 'false'));
        });
      });

      const routeSearch = this.root.querySelector('#route-search');
      if (routeSearch) {
        routeSearch.addEventListener('input', (e) => this.updateRecentList(e.target.value.trim()));
      }

      const networkSearch = this.root.querySelector('#network-search');
      if (networkSearch) {
        networkSearch.addEventListener('input', (e) => {
          this.networkSearchText = (e.target.value || '').trim().toLowerCase();
          this.updateNetworkList(this.networkEntries, this.networkSearchText);
        });
      }

      // Folder Picker Logic
      const pickBtn = this.root.querySelector('#pick-folder-btn');
      const fileInput = this.root.querySelector('#folder-picker');

      pickBtn.addEventListener('click', () => this.pickProjectFolder(fileInput));
      this.root.querySelector('#magic-detect-btn').addEventListener('click', () => this.runMagicDetect());

      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files);
          const file = files[0];

          // Build searchable index from selected folder file list
          const relPaths = files
            .map(f => f.webkitRelativePath || f.name)
            .filter(Boolean)
            .map(p => p.replace(/^\/+/, ''));

          const pickedRootFolder = (relPaths[0]?.split('/').filter(Boolean)[0] || '').trim();
          await this.indexPickedPaths(relPaths, pickedRootFolder || 'selected-project');

          // Try to get path (Electron/Native) or show warning
          if (file.path) {
            this.root.querySelector('#setting-project-path').value = file.path;
          } else {
            this.showToast('Selected. If path is empty, see security note.');
          }

          await this.refreshIndexStatus();
        }
      });

      await this.loadIndexPreferences();
      await this.refreshIndexStatus();

      // Dragging & Resizing
      this.setupDragLogic();
      this.setupResizeLogic();

      // Widget keyboard shortcuts
      this.root.addEventListener('keydown', (e) => {
        const isMod = e.metaKey || e.ctrlKey;

        // Ctrl/Cmd+Enter → Copy AI context
        if (isMod && e.key === 'Enter') {
          e.preventDefault();
          this.copyContext();
          return;
        }

        // Ctrl/Cmd+K → Focus AI prompt
        if (isMod && e.key === 'k') {
          e.preventDefault();
          const prompt = this.root.querySelector('#ai-prompt');
          if (prompt) { prompt.focus(); prompt.select(); }
          return;
        }

        // Escape → Close widget (only when no input is focused)
        if (e.key === 'Escape') {
          const active = this.shadow.activeElement;
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            active.blur(); // First Escape blurs input
          } else {
            this.toggle(false);
          }
          return;
        }
      });
    }

    async reindexProject(fileInput) {
      await this.pickProjectFolder(fileInput);
      await this.refreshIndexStatus();
    }

    async pickProjectFolder(fileInput) {
      // Progressive enhancement: use File System Access API when available,
      // fallback to webkitdirectory input for broader support.
      if (window.showDirectoryPicker) {
        try {
          const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
          const relPaths = await this.collectRelativePathsFromDirectoryHandle(dirHandle);
          await this.indexPickedPaths(relPaths, dirHandle?.name || 'selected-project');
          return;
        } catch (err) {
          // User cancellation should be silent; any other failure falls back.
          if (err?.name !== 'AbortError') {
            console.warn('[Nexus Helper] showDirectoryPicker failed, falling back:', err);
          }
        }
      }

      fileInput.click();
    }

    async collectRelativePathsFromDirectoryHandle(dirHandle) {
      const paths = [];

      const walk = async (handle, prefix = '') => {
        for await (const [name, child] of handle.entries()) {
          const currentPath = prefix ? `${prefix}/${name}` : name;
          if (child.kind === 'file') {
            paths.push(currentPath);
          } else if (child.kind === 'directory') {
            await walk(child, currentPath);
          }
        }
      };

      await walk(dirHandle, '');
      return paths;
    }

    async indexPickedPaths(relPaths, pickedRootFolder = 'selected-project') {
      const safePaths = (Array.isArray(relPaths) ? relPaths : [])
        .map(p => String(p || '').replace(/^\/+/, '').replace(/\\/g, '/'))
        .filter(Boolean);

      const activeExtensions = this.getActiveIndexExtensions();
      const extensionFilteredPaths = safePaths.filter(p => this.matchesExtensionFilter(p, activeExtensions));

      if (!extensionFilteredPaths.length) {
        this.showToast('No files found in selected folder');
        return;
      }

      // Remove picked root segment only when present on every path.
      // - webkitdirectory paths usually include root folder prefix
      // - showDirectoryPicker traversal paths usually don't
      const hasRootPrefix = !!pickedRootFolder && extensionFilteredPaths.every(p => p.startsWith(`${pickedRootFolder}/`));
      const normalizedFiles = extensionFilteredPaths
        .map(p => (hasRootPrefix ? p.slice(pickedRootFolder.length + 1) : p))
        .map(p => p.replace(/^\/+/, ''))
        .filter(Boolean);

      const folderSet = new Set();
      normalizedFiles.forEach(path => {
        const parts = path.split('/').filter(Boolean);
        for (let i = 1; i < parts.length; i++) {
          folderSet.add(parts.slice(0, i).join('/') + '/');
        }
      });

      this.pendingProjectIndex = {
        files: [...new Set(normalizedFiles)],
        folders: [...folderSet]
      };

      const typedPath = this.root.querySelector('#setting-project-path')?.value?.trim();
      const typedAlias = this.getProjectAlias({ path: typedPath, name: typedPath.split('/').filter(Boolean).pop() });
      this.pendingProjectAlias = this.getProjectAlias({
        path: typedPath,
        name: pickedRootFolder || typedAlias || 'selected-project'
      });

      this.indexExtensions = activeExtensions;
      await Storage.setIndexPreferences({ extensions: activeExtensions });

      await Storage.setLastPickedProjectIndex({
        alias: this.pendingProjectAlias,
        files: this.pendingProjectIndex.files,
        folders: this.pendingProjectIndex.folders,
        sourcePath: typedPath || ''
      });

      // Persist index for explicitly typed path first, then fallback to mapped path
      const mappedPath = await this.getProjectPath();
      const targetPath = typedPath || mappedPath;

      if (targetPath) {
        await Storage.setProjectFileIndex(targetPath, this.pendingProjectIndex);
      }

      this.showToast(`Indexed ${this.pendingProjectIndex.files.length} files`);
      await this.refreshIndexStatus();
    }

    async loadIndexPreferences() {
      const prefs = await Storage.getIndexPreferences();
      const extensions = Array.isArray(prefs.extensions) && prefs.extensions.length
        ? prefs.extensions
        : ['tsx', 'ts', 'jsx', 'js', 'json', 'md'];

      this.indexExtensions = extensions.map(ext => this.normalizeExt(ext)).filter(Boolean);
      const input = this.root.querySelector('#index-ext-filter');
      if (input) input.value = this.indexExtensions.join(',');
    }

    getActiveIndexExtensions() {
      const input = this.root.querySelector('#index-ext-filter');
      if (!input) return this.indexExtensions;

      const parsed = (input.value || '')
        .split(',')
        .map(v => this.normalizeExt(v))
        .filter(Boolean);

      if (!parsed.length) return ['tsx', 'ts', 'jsx', 'js', 'json', 'md'];
      return [...new Set(parsed)];
    }

    normalizeExt(ext) {
      return String(ext || '').trim().toLowerCase().replace(/^\./, '');
    }

    matchesExtensionFilter(path, extensions) {
      if (this.isExcludedGeneratedPath(path)) return false;

      const extList = Array.isArray(extensions) ? extensions : [];
      if (!extList.length) return true;
      const name = String(path || '').toLowerCase();
      const idx = name.lastIndexOf('.');
      if (idx === -1 || idx === name.length - 1) return false;
      const fileExt = name.slice(idx + 1);
      return extList.includes(fileExt);
    }

    isExcludedGeneratedPath(path) {
      const normalized = String(path || '').replace(/\\/g, '/').toLowerCase();
      if (!normalized) return true;

      const wrapped = `/${normalized}/`;
      const blockedSegments = [
        '/node_modules/',
        '/.next/',
        '/dist/',
        '/build/',
        '/coverage/',
        '/out/',
        '/.turbo/',
        '/server/chunks/',
        '/static/chunks/'
      ];

      if (blockedSegments.some(seg => wrapped.includes(seg))) return true;
      if (/\.map$/i.test(normalized)) return true;
      if (/_next-internal_|hot-update|webpack/i.test(normalized)) return true;

      return false;
    }

    async refreshIndexStatus() {
      const statusEl = this.root.querySelector('#index-status');
      if (!statusEl) return;

      const typedPath = this.root.querySelector('#setting-project-path')?.value?.trim();
      const mappedPath = await this.getProjectPath();
      const targetPath = typedPath || mappedPath;

      let sourceLabel = '';
      let data = null;

      if (targetPath) {
        data = await Storage.getProjectFileIndex(targetPath);
        sourceLabel = targetPath;
      }

      if ((!data || !data.files?.length) && this.pendingProjectIndex?.files?.length) {
        data = {
          files: this.pendingProjectIndex.files,
          folders: this.pendingProjectIndex.folders,
          updatedAt: Date.now()
        };
        sourceLabel = `${this.pendingProjectAlias || 'selected-project'} (selected now)`;
      }

      if ((!data || !data.files?.length) && !targetPath) {
        const lastPicked = await Storage.getLastPickedProjectIndex();
        if (lastPicked?.files?.length) {
          data = {
            files: lastPicked.files,
            folders: lastPicked.folders,
            updatedAt: lastPicked.updatedAt
          };
          sourceLabel = `${lastPicked.alias || 'last-picked'} (last picked)`;
        }
      }

      const extText = this.getActiveIndexExtensions().join(', ');
      if (!data || !data.files?.length) {
        statusEl.innerHTML = `
          <div><b>Index status:</b> No index yet.</div>
          <div style="opacity:.85; margin-top:4px;">Pick a folder to build searchable file suggestions.</div>
          <div style="opacity:.75; margin-top:4px;">Filter: ${this.escapeHtml(extText)}</div>
        `;
        return;
      }

      const updatedText = this.formatTimeAgo(data.updatedAt || Date.now());
      statusEl.innerHTML = `
        <div><b>Indexed:</b> ${data.files.length.toLocaleString()} files • ${(data.folders || []).length.toLocaleString()} folders</div>
        <div style="opacity:.85; margin-top:4px;"><b>Source:</b> ${this.escapeHtml(sourceLabel || 'selected project')}</div>
        <div style="opacity:.85; margin-top:4px;"><b>Updated:</b> ${this.escapeHtml(updatedText)}</div>
        <div style="opacity:.75; margin-top:4px;"><b>Filter:</b> ${this.escapeHtml(extText)}</div>
      `;
    }

    formatTimeAgo(ts) {
      const deltaMs = Math.max(0, Date.now() - Number(ts || Date.now()));
      const sec = Math.floor(deltaMs / 1000);
      if (sec < 5) return 'just now';
      if (sec < 60) return `${sec}s ago`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m ago`;
      const hrs = Math.floor(min / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }

    setupDragLogic() {
      const header = this.root.querySelector('.nx-header');
      const miniBar = this.root.querySelector('.nx-minimized');

      const startDrag = (e) => {
        if (e.target.closest('button')) return;
        this.isDragging = true;
        this.dragStartTime = Date.now();
        this.hasDragged = false;

        this.dragOffset.x = e.clientX - this.lastPosition.x;
        this.dragOffset.y = e.clientY - this.lastPosition.y;

        this.root.classList.add('is-dragging');

        const move = (ev) => {
          if (!this.isDragging) return;
          ev.preventDefault();
          this.hasDragged = true;
          const x = ev.clientX - this.dragOffset.x;
          const y = ev.clientY - this.dragOffset.y;

          this.lastPosition = { x, y };
          this.root.style.left = x + 'px';
          this.root.style.top = y + 'px';
          this.root.style.right = 'auto'; // ensure fixed positioning
        };

        const end = () => {
          this.isDragging = false;
          this.root.classList.remove('is-dragging');
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', end);
          if (this.hasDragged) this.saveState();
        };

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
      };

      const peekTrigger = this.root.querySelector('.nx-peek-trigger');
      header.addEventListener('mousedown', startDrag);
      miniBar.addEventListener('mousedown', startDrag);
      peekTrigger.addEventListener('mousedown', startDrag);

      // Clamp widget position when the viewport is resized
      window.addEventListener('resize', () => {
        if (this.isDragging) return;
        const w = this.root.offsetWidth || 400;
        const h = this.root.offsetHeight || 600;
        const maxX = Math.max(0, window.innerWidth - w);
        const maxY = Math.max(0, window.innerHeight - h);
        const clampedX = Math.min(Math.max(0, this.lastPosition.x), maxX);
        const clampedY = Math.min(Math.max(0, this.lastPosition.y), maxY);
        if (clampedX !== this.lastPosition.x || clampedY !== this.lastPosition.y) {
          this.lastPosition = { x: clampedX, y: clampedY };
          this.root.style.left = clampedX + 'px';
          this.root.style.top = clampedY + 'px';
          this.root.style.right = 'auto';
        }
      });
    }

    // Pin the widget open while the user is interacting with it (focus, click, typing)
    setupPeekPin() {
      let unpinTimer = null;

      const pin = () => {
        clearTimeout(unpinTimer);
        this.root.setAttribute('data-pinned', 'true');
      };

      const scheduleUnpin = () => {
        clearTimeout(unpinTimer);
        // Delay unpin so quick mouse-outs during interaction don't flash
        unpinTimer = setTimeout(() => {
          // Don't unpin if something inside is still focused
          const active = this.shadow.activeElement || this.root.querySelector(':focus');
          if (active && active !== this.root) return;
          this.root.removeAttribute('data-pinned');
        }, 400);
      };

      // Pin on any focusin inside the widget (textarea, buttons, inputs)
      this.root.addEventListener('focusin', pin);
      // Schedule unpin on focusout (will be cancelled if focus moves to another element inside)
      this.root.addEventListener('focusout', scheduleUnpin);

      // Pin when entering the widget, schedule unpin when leaving
      this.root.addEventListener('mouseenter', pin);
      this.root.addEventListener('mouseleave', scheduleUnpin);

      // Also keep the peek health dot in sync
      this._peekHealthDot = this.root.querySelector('#peek-health-dot');
    }

    setupResizeLogic() {
      const MIN_W = 300;
      const MAX_W = 900;
      const MIN_H = 320;
      const MAX_H = 800;

      this.root.querySelectorAll('.nx-edge').forEach(edge => {
        edge.addEventListener('pointerdown', (e) => {
          if (this.state === 'collapsed') return;
          e.preventDefault();
          e.stopPropagation();

          // Capture pointer so all move/up events go to this element
          edge.setPointerCapture(e.pointerId);

          const dir = edge.dataset.edge;
          const startX = e.clientX;
          const startY = e.clientY;
          const rect = this.root.getBoundingClientRect();
          const startW = rect.width;
          const startH = rect.height;
          const startL = rect.left;
          const startT = rect.top;

          this.root.style.transition = 'none';

          const move = (ev) => {
            ev.preventDefault();
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            let w = startW;
            let h = startH;
            let l = startL;
            let t = startT;

            // Horizontal
            if (dir.includes('right')) w = startW + dx;
            if (dir.includes('left')) { w = startW - dx; l = startL + dx; }
            // Vertical
            if (dir.includes('bottom')) h = startH + dy;
            if (dir === 'top' || dir === 'top-left' || dir === 'top-right') { h = startH - dy; t = startT + dy; }

            // Clamp
            w = Math.max(MIN_W, Math.min(MAX_W, w));
            h = Math.max(MIN_H, Math.min(MAX_H, h));

            // Recalculate position if we clamped and were dragging from left/top
            if (dir.includes('left')) l = startL + startW - w;
            if (dir === 'top' || dir === 'top-left' || dir === 'top-right') t = startT + startH - h;

            // Keep within viewport
            l = Math.max(0, Math.min(l, window.innerWidth - w));
            t = Math.max(0, Math.min(t, window.innerHeight - h));

            this.root.style.width = w + 'px';
            this.root.style.height = h + 'px';
            this.root.style.left = l + 'px';
            this.root.style.top = t + 'px';
            this.root.style.right = 'auto';
          };

          const end = (ev) => {
            edge.releasePointerCapture(ev.pointerId);
            edge.removeEventListener('pointermove', move);
            edge.removeEventListener('pointerup', end);
            edge.removeEventListener('pointercancel', end);
            this.root.style.transition = '';
            this.lastPosition = { x: this.root.offsetLeft, y: this.root.offsetTop };
            this._customSize = { w: this.root.offsetWidth, h: this.root.offsetHeight };
            this.saveState();
          };

          edge.addEventListener('pointermove', move);
          edge.addEventListener('pointerup', end);
          edge.addEventListener('pointercancel', end);
        });
      });
    }

    setState(newState) {
      const prevState = this.state;
      // Remember position when leaving expanded (so when returning from bigger we restore it)
      if (prevState === 'expanded') {
        this._positionWhenExpanded = { ...this.lastPosition };
      }
      // Remember position when minimizing (minimized bar is at this spot; restore uses current lastPosition if user drags bar)
      if (newState === 'collapsed') {
        this._positionWhenCollapsed = { ...this.lastPosition };
      }
      this.state = newState;
      this.root.setAttribute('data-state', newState);
      if (newState !== 'collapsed') {
        this.lastExpandedState = newState;
        // When returning from bigger to expanded, restore to the position it was when we maximized
        if (newState === 'expanded' && prevState === 'bigger' && this._positionWhenExpanded) {
          this.lastPosition = { ...this._positionWhenExpanded };
          this.root.style.left = this.lastPosition.x + 'px';
          this.root.style.top = this.lastPosition.y + 'px';
          this.root.style.right = 'auto';
        }
        // When returning from collapsed to expanded, ensure DOM matches lastPosition (user may have dragged the bar)
        if (newState === 'expanded' && prevState === 'collapsed') {
          this.root.style.left = this.lastPosition.x + 'px';
          this.root.style.top = this.lastPosition.y + 'px';
          this.root.style.right = 'auto';
        }
        // When switching modes (e.g. expanded ↔ bigger), clear custom size so CSS defaults apply
        // But keep the saved customSize so it can be re-applied if desired
        if (newState === 'bigger') {
          this.root.style.width = '';
          this.root.style.height = '';
          this._customSize = null;
        } else if (newState === 'expanded' && this._customSize) {
          this.root.style.width = this._customSize.w + 'px';
          this.root.style.height = this._customSize.h + 'px';
        }
      } else {
        // Collapsed — clear inline size so CSS !important auto takes over
        this.root.style.width = '';
        this.root.style.height = '';
      }
      this.saveState();
    }

    toggle(force) {
      const isVisible = this.container.style.display !== 'none';
      const shouldShow = force !== undefined ? force : !isVisible;

      if (shouldShow) {
        this.container.style.display = 'block';
        this.root.style.opacity = '0';
        requestAnimationFrame(() => this.root.style.opacity = '1');
      } else {
        this.root.style.opacity = '0';
        setTimeout(() => this.container.style.display = 'none', 200);
      }
    }

    async handleAction(action) {
      if (action === 'copy-route') {
        const fullRoute = window.location.pathname + window.location.search + window.location.hash;
        navigator.clipboard.writeText(fullRoute);
        this.showToast('Route copied');
      } else if (action === 'copy-screenshot') {
        try {
          if (!this.isExtensionContextValid()) {
            this.showToast('Extension reloaded. Refresh the page.');
            return;
          }

          // Temporarily hide the widget so it doesn't appear in the screenshot
          const prevDisplay = this.container.style.display;
          const prevOpacity = this.root.style.opacity;
          this.container.style.display = 'none';

          // Small delay to let the browser repaint without the widget
          await new Promise(r => setTimeout(r, 150));

          let response;
          try {
            response = await chrome.runtime.sendMessage({ action: 'captureScreenshot' });
          } finally {
            // Always restore the widget, even if capture fails
            this.container.style.display = prevDisplay || '';
            this.root.style.opacity = prevOpacity || '1';
          }

          if (!response) {
            this.showToast('Screenshot failed — no response');
            return;
          }

          if (!response.ok || !response.dataUrl) {
            this.showToast(`Screenshot failed: ${response.error || 'unknown error'}`);
            return;
          }

          try {
            const res = await fetch(response.dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            this.showToast('Screenshot copied');
          } catch (clipErr) {
            // Clipboard write may fail if the document lost focus — fall back to download
            console.error('[Nexus Helper] Clipboard write failed:', clipErr);
            try {
              const a = document.createElement('a');
              a.href = response.dataUrl;
              a.download = `screenshot-${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              this.showToast('Clipboard blocked — downloaded instead');
            } catch (dlErr) {
              this.showToast('Screenshot failed to save');
            }
          }
        } catch (e) {
          if (this.handleContextInvalidated(e)) {
            this.showToast('Extension reloaded. Refresh the page.');
            return;
          }
          console.error('[Nexus Helper] Screenshot error:', e);
          this.showToast(`Screenshot failed: ${e.message || 'unknown error'}`);
        }
      } else if (action === 'copy-cursor-context') {
        this.copyContext();
      } else if (action === 'open-cursor') {
        this.openInEditor();
      }
    }

    // Editor display names
    _editorNames = {
      cursor: 'Cursor',
      antigravity: 'Antigravity',
      vscode: 'VS Code',
      windsurf: 'Windsurf',
      zed: 'Zed'
    };

    async openInEditor() {
      const prefs = await Storage.getEditorPreference();
      const editorKey = prefs.editor || 'cursor';
      const autoCopy = prefs.autoCopyContext !== false;
      const editorName = this._editorNames[editorKey] || editorKey;

      let projectPath = await this.getProjectPath();

      if (!projectPath) {
        this.showToast('Set project path in Settings first');
        this.root.querySelectorAll('.nx-tab').forEach(t => t.setAttribute('data-active', 'false'));
        this.root.querySelectorAll('.nx-panel').forEach(p => p.setAttribute('data-active', 'false'));
        const settingsTab = this.root.querySelector('[data-tab="settings"]');
        if (settingsTab) settingsTab.setAttribute('data-active', 'true');
        this.root.querySelector('#panel-settings')?.setAttribute('data-active', 'true');
        setTimeout(() => {
          this.root.querySelector('#setting-project-path')?.focus();
        }, 200);
        return;
      }

      // Auto-copy context before opening the editor
      if (autoCopy) {
        await this.copyContext({ silent: true });
      }

      const name = projectPath.split('/').pop();
      const copyMsg = autoCopy ? ' (context copied)' : '';
      this.showToast(`Opening ${name} in ${editorName}...${copyMsg}`);

      if (!this.isExtensionContextValid()) {
        this.showToast('Extension reloaded. Refresh the page.');
        return;
      }

      try {
        chrome.runtime.sendMessage({
          action: 'openInEditor',
          editor: editorKey,
          url: window.location.href,
          title: document.title,
          projectPath: projectPath
        }, (response) => {
          if (chrome.runtime.lastError) {
            if (this.handleContextInvalidated(chrome.runtime.lastError)) {
              this.showToast('Extension reloaded. Refresh the page.');
              return;
            }
          }
          if (response && response.scheme) {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = response.scheme;
            document.body.appendChild(iframe);
            setTimeout(() => iframe.remove(), 2000);
          } else {
            this.showToast('Failed to open editor');
          }
        });
      } catch (e) {
        if (this.handleContextInvalidated(e)) {
          this.showToast('Extension reloaded. Refresh the page.');
        }
      }
    }

    // Backward compat alias
    openInCursor() { return this.openInEditor(); }

    async getProjectPath() {
      try {
        const project = await Storage.getProjectForUrl(window.location.href);
        if (project?.path) {
          return project.path;
        }
      } catch (e) {
        console.error('Failed to resolve project path:', e);
      }
      return null;
    }

    async copyContext({ silent = false } = {}) {
      const prompt = this.root.querySelector('#ai-prompt').value;
      const toggles = this.getContextToggles();
      const debug = await this.getLatestDebugInfo();

      const route = window.location.pathname + window.location.search;
      const selection = window.getSelection().toString().trim();
      const title = document.title;

      // Build structured, AI-optimized context
      const sections = [];

      // ── Task (always first — tells the AI what to do)
      if (toggles.prompt && prompt) {
        sections.push(`<task>\n${prompt.trim()}\n</task>`);
      }

      // ── Framework & environment info (gives model the tech stack context)
      if (toggles.framework) {
        const frameworkInfo = this.buildFrameworkInfo();
        if (frameworkInfo) sections.push(`<framework>\n${frameworkInfo}\n</framework>`);
      }

      // ── Page location (compact single line)
      if (toggles.route) {
        let loc = `<page route="${route}"`;
        if (title) loc += ` title="${title}"`;
        loc += ` />`;
        sections.push(loc);
      }

      // ── Route params & query string
      if (toggles.routeParams) {
        const routeParams = this.buildRouteParams();
        if (routeParams) sections.push(`<route_params>\n${routeParams}\n</route_params>`);
      }

      // ── Selected text (only if present)
      if (toggles.selection && selection) {
        sections.push(`<selection>\n${selection}\n</selection>`);
      }

      // ── Related files (only if found)
      if (toggles.files) {
        const relatedFiles = await this.resolveRouteRelatedFiles();
        if (relatedFiles.length) {
          const fileLines = relatedFiles
            .map(f => `  ${f.shortPath}  (${f.role})`)
            .join('\n');
          sections.push(`<related_files>\n${fileLines}\n</related_files>`);
        }
      }

      // ── Layout chain (root layout → nested layouts → page)
      if (toggles.layoutChain) {
        const chain = await this.buildLayoutChain();
        if (chain) sections.push(`<layout_chain>\n${chain}\n</layout_chain>`);
      }

      // ── React/Vue component tree
      if (toggles.components) {
        const tree = this.buildComponentTree();
        if (tree) sections.push(`<component_tree>\n${tree}\n</component_tree>`);
      }

      // ── Visible UI state (forms, modals, tabs, loading)
      if (toggles.uiState) {
        const uiState = this.buildUIState();
        if (uiState) sections.push(`<ui_state>\n${uiState}\n</ui_state>`);
      }

      // ── Errors — use structured version (with stack traces) if enabled, else basic
      if (toggles.structuredErrors) {
        const structured = this.buildStructuredErrors(debug.errors || []);
        if (structured) sections.push(`<errors>\n${structured}\n</errors>`);
      } else if (toggles.console) {
        const errors = (debug.errors || []).slice(0, 5);
        if (errors.length) {
          const errorLines = errors.map(e => {
            const type = e?.type || 'error';
            const msg = String(e?.message || e?.error || 'Unknown').replace(/\s+/g, ' ').slice(0, 240);
            return `  [${type}] ${msg}`;
          }).join('\n');
          sections.push(`<console_errors>\n${errorLines}\n</console_errors>`);
        }
      }

      // ── Data fetching summary (pending + completed + failed overview)
      if (toggles.dataFetching) {
        const fetchSummary = this.buildDataFetchingSummary(debug.network || []);
        if (fetchSummary) sections.push(`<data_fetching>\n${fetchSummary}\n</data_fetching>`);
      } else if (toggles.network) {
        // Fallback: just show failed requests
        const entries = Array.isArray(debug.network) ? debug.network : [];
        const failed = entries.filter(r => Number(r?.status || 0) >= 400 || r?.error).slice(0, 5);
        if (failed.length) {
          const netLines = failed.map(r => {
            let path = r.path || r.url || 'unknown';
            try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
            const method = String(r.method || 'GET').toUpperCase();
            const status = r.error ? `ERR` : String(r.status);
            const dur = r.duration ? ` ${r.duration}ms` : '';
            let line = `  ${method} ${path} → ${status}${dur}`;
            if (r.error) line += ` (${r.error})`;
            if (r.responseBody) line += `\n    body: ${String(r.responseBody).trim().slice(0, 300)}`;
            return line;
          }).join('\n');
          sections.push(`<failed_requests>\n${netLines}\n</failed_requests>`);
        }
      }

      // ── API response shapes (successful endpoints — data structures)
      if (toggles.apiShapes) {
        const apiShapes = this.buildAPIShapes(debug.network || []);
        if (apiShapes) sections.push(`<api_responses>\n${apiShapes}\n</api_responses>`);
      }

      // ── Accessibility / semantic tree
      if (toggles.a11y) {
        const a11y = this.buildAccessibilityTree();
        if (a11y) sections.push(`<accessibility>\n${a11y}\n</accessibility>`);
      }

      // ── Viewport & responsive info
      if (toggles.viewport) {
        const viewport = this.buildViewportInfo();
        if (viewport) sections.push(`<viewport>\n${viewport}\n</viewport>`);
      }

      // ── Performance hints
      if (toggles.perf) {
        const perf = this.buildPerformanceHints(debug.network || []);
        if (perf) sections.push(`<performance>\n${perf}\n</performance>`);
      }

      // ── Attached API reference docs
      const apiRef = this.buildApiReferenceContext();
      if (apiRef) {
        sections.push(`<api_reference>\n${apiRef}\n</api_reference>`);
      }

      // ── DOM snapshot (only if enabled and has content)
      if (toggles.dom) {
        const domSnapshot = this.buildCompactDomSnapshot();
        if (domSnapshot) {
          sections.push(`<visible_ui>\n${domSnapshot}\n</visible_ui>`);
        }
      }

      const text = sections.join('\n\n');
      await navigator.clipboard.writeText(text);
      const tokens = this.estimateTokens(text);
      if (!silent) {
        this.showToast(`Context copied (~${tokens.toLocaleString()} tokens)`);
      }
      this.updateTokenCounter(tokens);
    }

    getContextToggles() {
      // If auto-detect is active, detect intent first
      const activePreset = this._activePreset || 'auto';
      if (activePreset === 'auto') {
        const prompt = this.root.querySelector('#ai-prompt')?.value || '';
        if (prompt.trim()) {
          this.applyAutoDetect(prompt);
        }
      }

      const checked = (id, fallback = true) => {
        const el = this.root.querySelector(`#${id}`);
        return el ? !!el.checked : fallback;
      };

      return {
        route: checked('ctx-include-route', true),
        selection: checked('ctx-include-selection', true),
        prompt: checked('ctx-include-prompt', true),
        network: checked('ctx-include-network', true),
        console: checked('ctx-include-console', true),
        dom: checked('ctx-include-dom', false),
        files: checked('ctx-include-files', true),
        uiState: checked('ctx-include-ui-state', true),
        apiShapes: checked('ctx-include-api-shapes', true),
        routeParams: checked('ctx-include-route-params', true),
        components: checked('ctx-include-components', true),
        framework: checked('ctx-include-framework', true),
        structuredErrors: checked('ctx-include-structured-errors', true),
        dataFetching: checked('ctx-include-data-fetching', true),
        a11y: checked('ctx-include-a11y', false),
        layoutChain: checked('ctx-include-layout-chain', true),
        viewport: checked('ctx-include-viewport', false),
        perf: checked('ctx-include-perf', false)
      };
    }

    // ═══════════════════════════════════════════════════════════════════
    // Context Presets
    // ═══════════════════════════════════════════════════════════════════

    // Preset definitions: which toggles are on/off for each mode
    _contextPresets = {
      auto: null, // special: handled by applyAutoDetect()
      bug: {
        route: true, selection: true, prompt: true, network: true, console: true,
        dom: false, files: true, uiState: true, apiShapes: true, routeParams: true,
        components: true, framework: true, structuredErrors: true, dataFetching: true,
        a11y: false, layoutChain: true, viewport: false, perf: false
      },
      ui: {
        route: true, selection: true, prompt: true, network: false, console: false,
        dom: true, files: true, uiState: true, apiShapes: false, routeParams: false,
        components: true, framework: true, structuredErrors: false, dataFetching: false,
        a11y: false, layoutChain: true, viewport: true, perf: false
      },
      full: {
        route: true, selection: true, prompt: true, network: true, console: true,
        dom: true, files: true, uiState: true, apiShapes: true, routeParams: true,
        components: true, framework: true, structuredErrors: true, dataFetching: true,
        a11y: true, layoutChain: true, viewport: true, perf: true
      },
      minimal: {
        route: true, selection: false, prompt: true, network: false, console: false,
        dom: false, files: true, uiState: false, apiShapes: false, routeParams: false,
        components: false, framework: true, structuredErrors: false, dataFetching: false,
        a11y: false, layoutChain: false, viewport: false, perf: false
      }
    };

    // Toggle-to-checkbox mapping
    _toggleCheckboxMap = {
      route: 'ctx-include-route',
      selection: 'ctx-include-selection',
      prompt: 'ctx-include-prompt',
      network: 'ctx-include-network',
      console: 'ctx-include-console',
      dom: 'ctx-include-dom',
      files: 'ctx-include-files',
      uiState: 'ctx-include-ui-state',
      apiShapes: 'ctx-include-api-shapes',
      routeParams: 'ctx-include-route-params',
      components: 'ctx-include-components',
      framework: 'ctx-include-framework',
      structuredErrors: 'ctx-include-structured-errors',
      dataFetching: 'ctx-include-data-fetching',
      a11y: 'ctx-include-a11y',
      layoutChain: 'ctx-include-layout-chain',
      viewport: 'ctx-include-viewport',
      perf: 'ctx-include-perf'
    };

    applyPreset(presetName) {
      this._activePreset = presetName;

      // Update active state on buttons
      this.root.querySelectorAll('.nx-preset-btn').forEach(btn => {
        btn.setAttribute('data-active', btn.dataset.preset === presetName ? 'true' : 'false');
      });

      if (presetName === 'auto') {
        // Reset to defaults, then let auto-detect handle it on next copy
        this.applyToggleStates(this._contextPresets.bug); // bug preset is closest to defaults
        // Also turn off the extras that default off
        this.setCheckbox('ctx-include-dom', false);
        this.setCheckbox('ctx-include-a11y', false);
        this.setCheckbox('ctx-include-viewport', false);
        this.setCheckbox('ctx-include-perf', false);
        return;
      }

      const preset = this._contextPresets[presetName];
      if (preset) this.applyToggleStates(preset);
    }

    applyToggleStates(states) {
      for (const [key, value] of Object.entries(states)) {
        const checkboxId = this._toggleCheckboxMap[key];
        if (checkboxId) this.setCheckbox(checkboxId, value);
      }
    }

    setCheckbox(id, checked) {
      const el = this.root.querySelector(`#${id}`);
      if (el) el.checked = checked;
    }

    // ═══════════════════════════════════════════════════════════════════
    // Auto-detect Intent
    // ═══════════════════════════════════════════════════════════════════

    // Shared intent definitions used by both auto-detect and live preset switching
    _intentDefinitions = [
      {
        name: 'bug',
        preset: 'bug',
        patterns: [/bug/, /fix/, /error/, /broken/, /crash/, /fail/, /not work/, /issue/, /wrong/, /undefined/, /null/, /exception/, /throw/],
        enable: ['structuredErrors', 'console', 'network', 'dataFetching', 'apiShapes', 'components']
      },
      {
        name: 'ui',
        preset: 'ui',
        patterns: [/style/, /css/, /layout/, /padding/, /margin/, /color/, /font/, /align/, /center/, /responsive/, /mobile/, /desktop/, /ui/, /design/, /spacing/, /border/, /shadow/, /animation/, /hover/, /theme/, /dark mode/, /light mode/],
        enable: ['uiState', 'components', 'dom', 'viewport']
      },
      {
        name: 'performance',
        preset: null, // no dedicated preset button — stays on auto
        patterns: [/slow/, /fast/, /performance/, /speed/, /optimize/, /loading/, /lazy/, /bundle/, /render/, /heavy/, /memory/, /lag/],
        enable: ['perf', 'dataFetching', 'components']
      },
      {
        name: 'data',
        preset: null,
        patterns: [/api/, /fetch/, /data/, /request/, /response/, /endpoint/, /graphql/, /mutation/, /query/, /payload/, /json/, /status code/],
        enable: ['dataFetching', 'apiShapes', 'network', 'routeParams']
      },
      {
        name: 'a11y',
        preset: null,
        patterns: [/accessib/, /aria/, /screen reader/, /keyboard/, /focus/, /tab order/, /a11y/, /wcag/, /semantic/],
        enable: ['a11y', 'dom', 'uiState']
      },
      {
        name: 'routing',
        preset: null,
        patterns: [/route/, /redirect/, /navigate/, /link/, /url/, /param/, /query string/, /path/, /slug/],
        enable: ['routeParams', 'layoutChain', 'files']
      },
      {
        name: 'form',
        preset: 'ui', // form tasks map to UI preset
        patterns: [/form/, /input/, /validation/, /submit/, /field/, /select/, /checkbox/, /radio/, /required/, /disabled/],
        enable: ['uiState', 'a11y', 'dom']
      }
    ];

    // Intent display names
    _intentLabels = {
      bug: 'Bug Fix',
      ui: 'UI / Style',
      performance: 'Performance',
      data: 'Data / API',
      a11y: 'Accessibility',
      routing: 'Routing',
      form: 'Form / UI',
      implement: 'Implement'
    };

    // Patterns that trigger API doc auto-search
    _implementPatterns = [
      /\bimplement/i, /\bintegrat/i, /\bbuild\b/i, /\bcreate\b/i,
      /\badd\b/i, /\bconnect\b/i, /\bconsume\b/i, /\bcall\b/i,
      /\buse\b.*\bapi\b/i, /\bhook\s*up\b/i, /\bwire\s*up\b/i,
      /\bset\s*up\b/i, /\bfetch\b/i
    ];

    _apiSuggestDismissed = false;
    _apiSuggestDebounce = null;

    /**
     * Detect the dominant intent from prompt text.
     * Returns { intent, preset } or { intent: null, preset: 'auto' } if no match.
     */
    detectIntent(promptText) {
      if (!promptText || !promptText.trim()) return { intent: null, preset: 'auto' };
      const text = promptText.toLowerCase();

      let bestIntent = null;
      let bestPreset = 'auto';
      let bestScore = 0;

      for (const def of this._intentDefinitions) {
        const score = def.patterns.filter(p => p.test(text)).length;
        if (score > bestScore) {
          bestScore = score;
          bestIntent = def.name;
          bestPreset = def.preset || 'auto';
        }
      }

      return bestScore > 0 ? { intent: bestIntent, preset: bestPreset } : { intent: null, preset: 'auto' };
    }

    // Backward compat wrapper
    detectIntentPreset(promptText) {
      return this.detectIntent(promptText).preset;
    }

    /**
     * Live-update the preset indicator and floating intent badge as the user types.
     * Only works when in auto mode — manual preset selection is not overridden.
     */
    updateLivePreset() {
      const currentText = this.root.querySelector('#ai-prompt')?.value || '';

      // If dismissed, re-enable detection once the text changes from what was dismissed
      if (this._intentDismissed) {
        if (currentText === this._dismissedText) return; // text unchanged — stay dismissed
        // Text changed — re-enable auto detection
        this._intentDismissed = false;
        this._dismissedText = '';
        this._activePreset = 'auto';
        this.root.querySelectorAll('.nx-preset-btn').forEach(btn => {
          btn.setAttribute('data-active', btn.dataset.preset === 'auto' ? 'true' : 'false');
        });
      }

      // Only auto-switch when in auto mode
      if (this._activePreset !== 'auto' && this._activePreset !== null) return;

      const prompt = this.root.querySelector('#ai-prompt')?.value || '';
      const { intent, preset } = this.detectIntent(prompt);

      // Highlight the detected preset button
      this.root.querySelectorAll('.nx-preset-btn').forEach(btn => {
        btn.setAttribute('data-active', btn.dataset.preset === preset ? 'true' : 'false');
      });

      // Update the floating intent badge
      const badge = this.root.querySelector('#intent-badge');
      const label = this.root.querySelector('#intent-label');
      if (badge && label) {
        if (intent) {
          label.textContent = this._intentLabels[intent] || intent;
          badge.setAttribute('data-intent', intent);
          badge.classList.add('visible');
        } else {
          badge.classList.remove('visible');
          badge.removeAttribute('data-intent');
        }
      }

      this._activePreset = 'auto';
      this._detectedPreset = preset;
    }

    /**
     * Dismiss intent detection — revert to minimal and stop auto-detecting until prompt changes significantly.
     */
    dismissIntent() {
      this._intentDismissed = true;
      this._dismissedText = this.root.querySelector('#ai-prompt')?.value || '';
      this.applyPreset('minimal');

      // Hide the badge
      const badge = this.root.querySelector('#intent-badge');
      if (badge) {
        badge.classList.remove('visible');
        badge.removeAttribute('data-intent');
      }
    }

    clearPromptAndAttachments() {
      // Clear prompt text
      const textarea = this.root.querySelector('#ai-prompt');
      if (textarea) {
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Clear ghost overlay
      const ghost = this.root.querySelector('#ghost-overlay');
      if (ghost) ghost.textContent = '';

      // Clear all attached API items
      this._attachedApiItems = [];
      this.renderAttachedChips();

      // Hide API suggest bar
      this.root.querySelector('#api-suggest-bar')?.classList.remove('visible');
      this._apiSuggestDismissed = false;

      // Reset intent badge
      const badge = this.root.querySelector('#intent-badge');
      if (badge) {
        badge.classList.remove('visible');
        badge.removeAttribute('data-intent');
      }
      this._intentDismissed = false;
      this._dismissedText = '';

      // Reset preset to auto
      this._activePreset = 'auto';
      this._detectedPreset = 'auto';
      this.root.querySelectorAll('.nx-preset-btn').forEach(btn => {
        btn.setAttribute('data-active', btn.dataset.preset === 'auto' ? 'true' : 'false');
      });

      // Reset token counter
      this.updateTokenCounter(0);

      // Hide clear button
      this.root.querySelector('#prompt-clear-btn')?.classList.remove('visible');
    }

    updateClearBtnVisibility() {
      const btn = this.root.querySelector('#prompt-clear-btn');
      if (!btn) return;
      const hasText = (this.root.querySelector('#ai-prompt')?.value || '').trim().length > 0;
      const hasAttachments = this._attachedApiItems.length > 0;
      btn.classList.toggle('visible', hasText || hasAttachments);
    }

    applyAutoDetect(promptText) {
      const text = promptText.toLowerCase();
      const intents = this._intentDefinitions;

      // Start from defaults (all the "on-by-default" ones)
      const baseOn = new Set([
        'route', 'selection', 'prompt', 'files', 'framework',
        'structuredErrors', 'dataFetching', 'components',
        'uiState', 'apiShapes', 'routeParams', 'layoutChain',
        'network', 'console'
      ]);

      // Detect which intents match
      const detected = new Set();
      for (const intent of intents) {
        if (intent.patterns.some(p => p.test(text))) {
          intent.enable.forEach(t => detected.add(t));
        }
      }

      // Merge: base + detected extras
      const finalToggles = {};
      for (const key of Object.keys(this._toggleCheckboxMap)) {
        finalToggles[key] = baseOn.has(key) || detected.has(key);
      }

      // Prompt and route are always on
      finalToggles.prompt = true;
      finalToggles.route = true;

      this.applyToggleStates(finalToggles);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Token Counter
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Rough token estimate: ~4 chars per token for English (GPT/Claude heuristic).
     */
    estimateTokens(text) {
      if (!text) return 0;
      // Rough: 1 token ≈ 4 characters for English, ~3.5 for code
      return Math.round(text.length / 3.8);
    }

    updateTokenCounter(tokens) {
      const counter = this.root.querySelector('#ctx-token-counter');
      if (!counter) return;
      counter.textContent = `~${tokens.toLocaleString()} tokens`;
      counter.classList.remove('nx-tokens-high', 'nx-tokens-danger');
      if (tokens > 4000) counter.classList.add('nx-tokens-danger');
      else if (tokens > 2000) counter.classList.add('nx-tokens-high');
    }

    async getLatestDebugInfo() {
      return new Promise((resolve) => {
        try {
          if (!this.isExtensionContextValid()) {
            resolve({ errors: [], network: [] });
            return;
          }
          chrome.runtime.sendMessage({ action: 'getDebugInfo' }, (res) => {
            if (chrome.runtime.lastError) {
              if (this.handleContextInvalidated(chrome.runtime.lastError)) {
                resolve({ errors: [], network: [] });
                return;
              }
            }
            if (!res?.ok) {
              resolve({ errors: [], network: [] });
              return;
            }
            resolve({
              errors: Array.isArray(res.errors) ? res.errors : [],
              network: Array.isArray(res.network) ? res.network : []
            });
          });
        } catch (e) {
          resolve({ errors: [], network: [] });
        }
      });
    }

    buildNetworkSummary(networkEntries = []) {
      const entries = Array.isArray(networkEntries) ? networkEntries : [];
      const failed = entries
        .filter(r => Number(r?.status || 0) >= 400 || r?.error)
        .slice(0, 5);

      if (!failed.length) return 'No failed requests in recent activity.';

      return failed.map((r, i) => {
        let path = r.path || r.url || 'unknown';
        try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
        const status = r.error ? `ERR (${r.error})` : String(r.status || 'ERR');
        const statusText = r.statusText ? ` ${r.statusText}` : '';
        const method = String(r.method || 'GET').toUpperCase();
        const duration = r.duration ? ` (${r.duration}ms)` : '';

        let line = `${i + 1}. ${method} ${path} → ${status}${statusText}${duration}`;

        // Include response body if available (truncated)
        if (r.responseBody) {
          const body = String(r.responseBody).trim().slice(0, 500);
          line += `\n   Response: ${body}`;
        }
        if (r.error) {
          line += `\n   Error: ${r.error}`;
        }
        return line;
      }).join('\n');
    }

    buildConsoleSummary(errors = []) {
      const list = (Array.isArray(errors) ? errors : []).slice(0, 5);
      if (!list.length) return 'No recent console errors.';

      return list.map((e, i) => {
        const type = e?.type || 'error';
        const message = String(e?.message || e?.error || 'Unknown error').replace(/\s+/g, ' ').slice(0, 240);
        return `${i + 1}. [${type}] ${message}`;
      }).join('\n');
    }

    buildCompactDomSnapshot() {
      const grab = (selector, limit = 6) => Array.from(document.querySelectorAll(selector))
        .map(el => (el.innerText || el.textContent || '').trim())
        .filter(Boolean)
        .filter(text => text.length <= 120)
        .slice(0, limit);

      const headings = grab('h1, h2, h3', 5);
      const buttons = grab('button, [role="button"]', 6);
      const labels = grab('label', 6);

      const lines = [];
      if (headings.length) lines.push(`Headings: ${headings.join(' | ')}`);
      if (buttons.length) lines.push(`Buttons: ${buttons.join(' | ')}`);
      if (labels.length) lines.push(`Labels: ${labels.join(' | ')}`);

      return lines.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════
    // Tier 1 Context Builders
    // ═══════════════════════════════════════════════════════════════════

    /**
     * T1: Visible UI State — forms, inputs, active tabs, modals, loading states
     */
    buildUIState() {
      const lines = [];

      // Form inputs with current values
      const inputs = Array.from(document.querySelectorAll(
        'input:not([type="hidden"]):not([type="password"]), textarea, select'
      )).slice(0, 15);

      if (inputs.length) {
        const inputLines = inputs.map(el => {
          const tag = el.tagName.toLowerCase();
          const type = el.type || tag;
          const name = el.name || el.id || el.getAttribute('aria-label') || el.placeholder || '';
          const label = name ? name : (el.closest('label')?.textContent?.trim().slice(0, 40) || '');
          let value = '';

          if (tag === 'select') {
            const selected = el.options[el.selectedIndex];
            value = selected ? selected.text.trim() : '';
          } else if (type === 'checkbox' || type === 'radio') {
            value = el.checked ? 'checked' : 'unchecked';
          } else {
            value = (el.value || '').slice(0, 80);
          }

          const disabled = el.disabled ? ' [disabled]' : '';
          const required = el.required ? ' [required]' : '';
          const invalid = el.getAttribute('aria-invalid') === 'true' ? ' [invalid]' : '';

          return `  ${type}${label ? ` "${label}"` : ''}: "${value}"${disabled}${required}${invalid}`;
        }).filter(Boolean);

        if (inputLines.length) {
          lines.push('Form fields:');
          lines.push(...inputLines);
        }
      }

      // Active tabs (aria-selected or data-active or .active)
      const activeTabs = Array.from(document.querySelectorAll(
        '[role="tab"][aria-selected="true"], [data-state="active"], .tab.active, [data-active="true"]'
      )).slice(0, 5);
      if (activeTabs.length) {
        const tabNames = activeTabs
          .map(t => (t.textContent || '').trim().slice(0, 40))
          .filter(Boolean);
        if (tabNames.length) lines.push(`Active tabs: ${tabNames.join(', ')}`);
      }

      // Open modals/dialogs
      const modals = Array.from(document.querySelectorAll(
        'dialog[open], [role="dialog"]:not([aria-hidden="true"]), [data-state="open"], .modal.show, .modal.open'
      )).slice(0, 3);
      if (modals.length) {
        const modalNames = modals.map(m => {
          const heading = m.querySelector('h1, h2, h3, [class*="title"]');
          return heading ? (heading.textContent || '').trim().slice(0, 50) : 'unnamed dialog';
        });
        lines.push(`Open dialogs: ${modalNames.join(', ')}`);
      }

      // Loading states
      const loaders = document.querySelectorAll(
        '[aria-busy="true"], [data-loading="true"], .loading, .spinner, [class*="skeleton"], [class*="Skeleton"]'
      );
      if (loaders.length) {
        lines.push(`Loading indicators: ${loaders.length} element(s) currently loading`);
      }

      // Disabled buttons
      const disabledBtns = Array.from(document.querySelectorAll('button[disabled], [role="button"][aria-disabled="true"]'))
        .slice(0, 5);
      if (disabledBtns.length) {
        const names = disabledBtns
          .map(b => (b.textContent || '').trim().slice(0, 30))
          .filter(Boolean);
        if (names.length) lines.push(`Disabled buttons: ${names.join(', ')}`);
      }

      // Empty states
      const emptyStates = document.querySelectorAll('[class*="empty-state"], [class*="EmptyState"], [class*="no-data"], [class*="NoData"]');
      if (emptyStates.length) {
        lines.push(`Empty states: ${emptyStates.length} section(s) showing no data`);
      }

      return lines.length ? lines.join('\n') : '';
    }

    /**
     * T2: API Response Shapes — summarize data structures from recent successful API calls
     */
    buildAPIShapes(networkEntries = []) {
      const entries = Array.isArray(networkEntries) ? networkEntries : [];
      // Only successful API-like requests (JSON endpoints)
      const successful = entries
        .filter(r => {
          const status = Number(r?.status || 0);
          return status >= 200 && status < 400;
        })
        .filter(r => {
          const url = String(r?.url || '');
          // Only include API-like endpoints, skip static assets
          return /\/(api|graphql|v\d|rest)\b/i.test(url) || /\.(json)$/i.test(url) ||
            (r?.responseBody && !/(\.js|\.css|\.html|\.png|\.jpg|\.svg|\.woff)/i.test(url));
        })
        .slice(0, 5);

      if (!successful.length) return '';

      const lines = successful.map(r => {
        let path = r.path || r.url || 'unknown';
        try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
        const method = String(r.method || 'GET').toUpperCase();
        const status = String(r.status);

        let line = `  ${method} ${path} → ${status}`;

        // Extract data shape from response body
        if (r.responseBody) {
          try {
            const body = typeof r.responseBody === 'string' ? JSON.parse(r.responseBody) : r.responseBody;
            const shape = this._describeShape(body, 2);
            if (shape) line += `\n    shape: ${shape}`;
          } catch (_) {
            // Not JSON — show truncated preview
            const preview = String(r.responseBody).trim().slice(0, 100);
            if (preview) line += `\n    body: ${preview}...`;
          }
        }
        return line;
      });

      return lines.join('\n');
    }

    /**
     * Recursively describe the shape of a JSON value (type + keys), up to maxDepth.
     */
    _describeShape(value, maxDepth = 2, depth = 0) {
      if (value === null || value === undefined) return 'null';
      if (typeof value === 'string') return 'string';
      if (typeof value === 'number') return 'number';
      if (typeof value === 'boolean') return 'boolean';

      if (Array.isArray(value)) {
        if (!value.length) return '[]';
        if (depth >= maxDepth) return `[...${value.length} items]`;
        const itemShape = this._describeShape(value[0], maxDepth, depth + 1);
        return `Array<${itemShape}>(${value.length})`;
      }

      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (!keys.length) return '{}';
        if (depth >= maxDepth) return `{${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ', ...' : ''}}`;
        const fields = keys.slice(0, 8).map(k => {
          const childShape = this._describeShape(value[k], maxDepth, depth + 1);
          return `${k}: ${childShape}`;
        });
        if (keys.length > 8) fields.push(`...${keys.length - 8} more`);
        return `{ ${fields.join(', ')} }`;
      }

      return typeof value;
    }

    /**
     * T3: Route Params & Query String — parse dynamic segments and query params
     */
    buildRouteParams() {
      const lines = [];
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      // Query params
      const params = new URLSearchParams(search);
      const paramEntries = [...params.entries()];
      if (paramEntries.length) {
        const paramLines = paramEntries.slice(0, 10)
          .map(([k, v]) => `  ${k}: "${v.slice(0, 80)}"`)
          .join('\n');
        lines.push(`Query params:\n${paramLines}`);
      }

      // Hash
      if (hash) {
        lines.push(`Hash: ${hash}`);
      }

      // Try to detect dynamic route segments by comparing URL to known file patterns
      const pathParts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
      const dynamicSegments = [];
      pathParts.forEach((seg, i) => {
        // Heuristic: numeric, UUID-like, or very long values are likely dynamic params
        if (/^\d+$/.test(seg) || /^[0-9a-f]{8,}$/i.test(seg) || /^[0-9a-f-]{20,}$/i.test(seg)) {
          const contextName = pathParts[i - 1] || 'param';
          dynamicSegments.push(`  [${contextName}Id]: "${seg}"`);
        }
      });
      if (dynamicSegments.length) {
        lines.push(`Dynamic segments (detected):\n${dynamicSegments.join('\n')}`);
      }

      return lines.length ? lines.join('\n') : '';
    }

    /**
     * T4: React Component Tree — detect rendered component hierarchy from fiber/devtools
     * Supports: Next.js Pages Router (#__next), CRA/Vite (#root), Next.js App Router (body), Vue (#app)
     */
    buildComponentTree() {
      try {
        // ── Step 1: Find a DOM element that has a React fiber key ──
        let fiberKey = null;
        let fiber = null;

        // Try well-known root IDs first, then body
        const candidates = [
          document.getElementById('__next'),
          document.getElementById('root'),
          document.getElementById('app'),
          document.body
        ].filter(Boolean);

        for (const el of candidates) {
          fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
          if (fiberKey) {
            fiber = el[fiberKey];
            break;
          }
        }

        // If none of the root candidates had a fiber, scan child elements (Next.js App Router
        // attaches fibers to inner elements, not body itself)
        if (!fiber) {
          const scanEls = document.querySelectorAll('body > *, body > * > *, main, [data-reactroot]');
          for (const el of Array.from(scanEls).slice(0, 50)) {
            fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
            if (fiberKey) {
              fiber = el[fiberKey];
              break;
            }
          }
        }

        if (!fiber) return '';

        // ── Step 2: Walk up to the fiber root for the most complete tree ──
        let root = fiber;
        let safety = 200;
        while (root.return && --safety > 0) {
          root = root.return;
        }

        // ── Step 3: Walk the fiber tree and collect component names ──
        const components = [];
        const seen = new Set();
        const MAX = 40;

        const walk = (node, depth = 0) => {
          if (!node || components.length >= MAX) return;

          // Component has a function/class type with a displayName or name
          if (node.type && typeof node.type !== 'string') {
            const name = node.type.displayName || node.type.name || '';
            if (name && !name.startsWith('_') && name.length > 1 && !seen.has(name)) {
              seen.add(name);
              const indent = '  '.repeat(Math.min(depth, 6));
              // Grab prop keys (not values — too verbose)
              let propInfo = '';
              if (node.memoizedProps && typeof node.memoizedProps === 'object') {
                const propKeys = Object.keys(node.memoizedProps)
                  .filter(k => k !== 'children' && !k.startsWith('__'))
                  .slice(0, 6);
                if (propKeys.length) propInfo = ` props=[${propKeys.join(', ')}]`;
              }
              components.push(`${indent}${name}${propInfo}`);
            }
          }

          // Traverse child and siblings
          if (node.child) walk(node.child, depth + 1);
          if (node.sibling) walk(node.sibling, depth);
        };

        walk(root);
        return components.length ? components.join('\n') : '';
      } catch (e) {
        return '';
      }
    }

    /**
     * T5: Framework & Meta Info — detect framework, version, router type, environment
     */
    buildFrameworkInfo() {
      const info = [];

      // Next.js
      if (window.__NEXT_DATA__) {
        const nd = window.__NEXT_DATA__;
        info.push(`Framework: Next.js`);
        if (nd.buildId) info.push(`Build: ${nd.buildId.slice(0, 16)}`);
        if (nd.runtimeConfig) info.push(`Runtime config: ${Object.keys(nd.runtimeConfig).join(', ')}`);
        // App Router vs Pages Router
        const isAppRouter = !!document.getElementById('__next')?.querySelector('[data-nextjs-scroll-focus-boundary]') ||
          !!document.querySelector('script[src*="app-pages-internals"]');
        info.push(`Router: ${isAppRouter ? 'App Router' : 'Pages Router'}`);
        if (nd.page) info.push(`Page pattern: ${nd.page}`);
        if (nd.query && Object.keys(nd.query).length) {
          info.push(`Route params: ${JSON.stringify(nd.query)}`);
        }
      }

      // Nuxt
      if (window.__NUXT__) {
        info.push('Framework: Nuxt.js');
      }

      // Vite
      if (document.querySelector('script[type="module"][src*="/@vite"]') || window.__vite_plugin_react_preamble_installed__) {
        if (!info.some(l => l.startsWith('Framework:'))) info.push('Bundler: Vite');
      }

      // React version
      const react = window.React || (window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.values()?.next()?.value);
      if (react?.version) {
        info.push(`React: v${react.version}`);
      } else if (document.querySelector('[data-reactroot]') || document.getElementById('__next')) {
        info.push('React: detected (version unknown)');
      }

      // Vue
      if (window.__VUE__) {
        info.push(`Vue: v${window.__VUE__.version || 'detected'}`);
      }

      // TypeScript — check if source maps reference .tsx/.ts
      const tsEvidence = document.querySelector('script[src*=".tsx"], script[src*=".ts"]') ||
        window.__NEXT_DATA__?.page?.endsWith('.tsx');
      if (tsEvidence) info.push('Language: TypeScript');

      // Environment hints
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ||
        window.location.port !== '' || document.querySelector('[data-nextjs-toast]');
      info.push(`Environment: ${isDev ? 'development' : 'production'}`);

      // Viewport
      info.push(`Viewport: ${window.innerWidth}x${window.innerHeight}`);

      return info.length ? info.map(l => `  ${l}`).join('\n') : '';
    }

    // ═══════════════════════════════════════════════════════════════════
    // Tier 2 Context Builders
    // ═══════════════════════════════════════════════════════════════════

    /**
     * T2-1: Structured Error Context — parse stack traces, map to source files,
     * identify which component threw the error.
     */
    buildStructuredErrors(errors = []) {
      const list = (Array.isArray(errors) ? errors : []).slice(0, 5);
      if (!list.length) return '';

      const lines = list.map(e => {
        const type = e?.type || 'error';
        const msg = String(e?.message || e?.error || 'Unknown').replace(/\s+/g, ' ').slice(0, 300);
        let entry = `  [${type}] ${msg}`;

        // Parse stack trace for source locations
        const stack = e?.stack || e?.trace || '';
        if (stack) {
          const sourceLines = String(stack).split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('at '))
            .slice(0, 5)
            .map(line => {
              // Extract file path and line number: "at Component (file.tsx:12:5)" or "at file.tsx:12:5"
              const match = line.match(/at\s+(\S+)\s*\(?([^)]+)\)?/) || line.match(/at\s+(.+)/);
              if (!match) return null;

              let funcName = match[1] || '';
              let location = match[2] || match[1] || '';

              // Clean webpack/next internal paths
              if (/node_modules|webpack-internal|__next/.test(location)) return null;

              // Extract just the meaningful source path
              const pathMatch = location.match(/((?:src|app|pages|components|lib|utils|hooks)[/\\].+?(?::\d+(?::\d+)?))/);
              if (pathMatch) location = pathMatch[1];

              // Detect component name from function name (PascalCase = React component)
              const isComponent = /^[A-Z][a-zA-Z]+$/.test(funcName);

              return {
                func: funcName,
                location: location.replace(/^.*?\/(?=src\/|app\/|pages\/)/, ''),
                isComponent
              };
            })
            .filter(Boolean);

          if (sourceLines.length) {
            // Find the component that threw (first PascalCase function in stack)
            const component = sourceLines.find(s => s.isComponent);
            if (component) {
              entry += `\n    component: ${component.func}`;
            }

            entry += '\n    stack:';
            sourceLines.forEach(s => {
              entry += `\n      ${s.func} → ${s.location}`;
            });
          }
        }

        // Check for error boundary info
        if (e?.componentStack) {
          const boundaryComponents = String(e.componentStack)
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.startsWith('at '))
            .slice(0, 4)
            .map(l => l.replace(/^at\s+/, '').split(/\s/)[0]);
          if (boundaryComponents.length) {
            entry += `\n    component chain: ${boundaryComponents.join(' → ')}`;
          }
        }

        return entry;
      });

      return lines.join('\n');
    }

    /**
     * T2-2: Active Data Fetching — detect pending/completed data requests
     * by intercepting fetch and summarizing what the page loads.
     */
    buildDataFetchingSummary(networkEntries = []) {
      const entries = Array.isArray(networkEntries) ? networkEntries : [];
      if (!entries.length) return '';

      const lines = [];

      // Categorize requests
      const apiRequests = entries.filter(r => {
        const url = String(r?.url || '');
        // Skip static assets, focus on data endpoints
        return !/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico|map)(\?|$)/i.test(url);
      });

      if (!apiRequests.length) return '';

      // Group by status category
      const pending = apiRequests.filter(r => !r.status && !r.error);
      const ok = apiRequests.filter(r => { const s = Number(r?.status || 0); return s >= 200 && s < 400; });
      const failed = apiRequests.filter(r => Number(r?.status || 0) >= 400 || r?.error);

      if (pending.length) {
        lines.push(`Pending requests (${pending.length}):`);
        pending.slice(0, 3).forEach(r => {
          const method = String(r?.method || 'GET').toUpperCase();
          let path = r.url || 'unknown';
          try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
          lines.push(`  ${method} ${path} — waiting...`);
        });
      }

      if (ok.length) {
        lines.push(`Completed (${ok.length}):`);
        ok.slice(0, 5).forEach(r => {
          const method = String(r?.method || 'GET').toUpperCase();
          let path = r.url || 'unknown';
          try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
          const dur = r.duration ? ` ${r.duration}ms` : '';
          lines.push(`  ${method} ${path} → ${r.status}${dur}`);
        });
      }

      if (failed.length) {
        lines.push(`Failed (${failed.length}):`);
        failed.slice(0, 3).forEach(r => {
          const method = String(r?.method || 'GET').toUpperCase();
          let path = r.url || 'unknown';
          try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
          const status = r.error ? `ERR (${r.error})` : String(r.status);
          lines.push(`  ${method} ${path} → ${status}`);
        });
      }

      return lines.map(l => `  ${l}`).join('\n');
    }

    /**
     * T2-3: Accessibility / Semantic Tree — ARIA roles, landmarks, form semantics,
     * validation states. Richer than the basic DOM snapshot.
     */
    buildAccessibilityTree() {
      const lines = [];

      // Landmarks
      const landmarks = Array.from(document.querySelectorAll(
        'header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], [role="search"]'
      )).slice(0, 8);
      if (landmarks.length) {
        const landmarkNames = landmarks.map(el => {
          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          const label = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '';
          return label ? `${role}("${label.slice(0, 30)}")` : role;
        });
        lines.push(`Landmarks: ${landmarkNames.join(', ')}`);
      }

      // Forms with their fields and validation
      const forms = Array.from(document.querySelectorAll('form')).slice(0, 4);
      if (forms.length) {
        forms.forEach((form, fi) => {
          const formName = form.getAttribute('aria-label') || form.name || form.id || `form-${fi + 1}`;
          const fields = Array.from(form.querySelectorAll('input:not([type="hidden"]), textarea, select')).slice(0, 10);
          const fieldDescs = fields.map(f => {
            const name = f.name || f.id || f.getAttribute('aria-label') || f.placeholder || f.type;
            const valid = f.getAttribute('aria-invalid') === 'true' ? ' INVALID' : '';
            const required = f.required || f.getAttribute('aria-required') === 'true' ? ' *' : '';
            const errId = f.getAttribute('aria-describedby') || f.getAttribute('aria-errormessage');
            let errMsg = '';
            if (errId) {
              const errEl = document.getElementById(errId);
              if (errEl) errMsg = ` err="${(errEl.textContent || '').trim().slice(0, 60)}"`;
            }
            return `${name}${required}${valid}${errMsg}`;
          });
          lines.push(`Form "${formName}": [${fieldDescs.join(', ')}]`);
        });
      }

      // Interactive elements with ARIA states
      const stateEls = Array.from(document.querySelectorAll(
        '[aria-expanded], [aria-pressed], [aria-checked], [aria-disabled="true"]'
      )).slice(0, 10);
      if (stateEls.length) {
        const stateDescs = stateEls.map(el => {
          const label = el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 30) || el.tagName.toLowerCase();
          const states = [];
          if (el.hasAttribute('aria-expanded')) states.push(`expanded=${el.getAttribute('aria-expanded')}`);
          if (el.hasAttribute('aria-pressed')) states.push(`pressed=${el.getAttribute('aria-pressed')}`);
          if (el.hasAttribute('aria-checked')) states.push(`checked=${el.getAttribute('aria-checked')}`);
          if (el.getAttribute('aria-disabled') === 'true') states.push('disabled');
          return `${label} (${states.join(', ')})`;
        });
        lines.push(`Interactive states:\n${stateDescs.map(s => `  ${s}`).join('\n')}`);
      }

      // Live regions
      const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
      if (liveRegions.length) {
        const liveDescs = Array.from(liveRegions).slice(0, 4).map(el => {
          const role = el.getAttribute('role') || `aria-live=${el.getAttribute('aria-live')}`;
          const text = (el.textContent || '').trim().slice(0, 80);
          return text ? `${role}: "${text}"` : role;
        }).filter(Boolean);
        if (liveDescs.length) lines.push(`Live regions:\n${liveDescs.map(s => `  ${s}`).join('\n')}`);
      }

      return lines.length ? lines.map(l => `  ${l}`).join('\n') : '';
    }

    // ═══════════════════════════════════════════════════════════════════
    // Tier 3 Context Builders
    // ═══════════════════════════════════════════════════════════════════

    /**
     * T3-1: Layout Chain — detect parent layouts wrapping the current page.
     * Walks the project file index to find layout files at each route segment level.
     * e.g. root layout → (dashboard) layout → clients layout → page
     */
    async buildLayoutChain() {
      try {
        const cleanRoute = (window.location.pathname || '/').replace(/[?#].*$/, '') || '/';
        const normalizedRoute = cleanRoute.replace(/^\/+/, '').replace(/\/+$/, '');

        const currentProject = await Storage.getProjectForUrl(window.location.href);
        const projectPath = currentProject?.path || '';
        const projectAlias = this.getProjectAlias(currentProject || { path: projectPath, name: this.pendingProjectAlias });

        const projectIndexed = projectPath ? await Storage.getProjectFileIndex(projectPath) : { files: [], folders: [] };
        const lastPicked = await Storage.getLastPickedProjectIndex();

        let files = Array.isArray(projectIndexed.files) ? projectIndexed.files.slice() : [];
        if (!files.length && Array.isArray(this.pendingProjectIndex?.files)) files = this.pendingProjectIndex.files.slice();
        if (!files.length && Array.isArray(lastPicked?.files)) files = lastPicked.files.slice();
        if (!files.length) return '';

        const alias = projectAlias || this.getProjectAlias({ name: lastPicked?.alias, path: lastPicked?.sourcePath || '' });

        // Find all layout files in the index
        const layoutFiles = files
          .map(f => String(f || '').replace(/^\/+/, '').replace(/\\/g, '/'))
          .filter(f => /(^|\/)layout\.(tsx|jsx|ts|js)$/i.test(f));

        if (!layoutFiles.length) return '';

        // Strip framework prefixes and route groups to get the "route depth" of each layout
        const stripPrefix = (p) => p.replace(/^(src\/)?(app|pages)\//, '');
        const stripGroups = (p) => p.replace(/\([^)]+\)\/?/g, '');

        const routeSegments = normalizedRoute ? normalizedRoute.split('/').filter(Boolean) : [];

        // For each layout, compute its effective route depth (after stripping groups)
        const layouts = layoutFiles.map(f => {
          const stripped = stripGroups(stripPrefix(f));
          const dir = stripped.replace(/\/layout\.(tsx|jsx|ts|js)$/i, '');
          const depth = dir ? dir.split('/').filter(Boolean).length : 0;
          const segments = dir ? dir.split('/').filter(Boolean) : [];
          return { file: f, depth, segments, shortPath: `${alias}/${f}` };
        });

        // Filter layouts that are ancestors of (or equal to) the current route
        const matchingLayouts = layouts.filter(l => {
          if (l.depth === 0) return true; // root layout always applies
          if (l.depth > routeSegments.length) return false;
          // Each segment of the layout path must match the corresponding route segment
          for (let i = 0; i < l.segments.length; i++) {
            const lSeg = l.segments[i].toLowerCase();
            const rSeg = (routeSegments[i] || '').toLowerCase();
            if (lSeg === rSeg) continue;
            if (/^\[.*\]$/.test(lSeg)) continue; // dynamic param
            return false;
          }
          return true;
        });

        // Sort by depth (root → most specific)
        matchingLayouts.sort((a, b) => a.depth - b.depth);

        if (!matchingLayouts.length) return '';

        // Build the chain: root layout → group layout → route layout → page
        const chain = matchingLayouts.map((l, i) => {
          const indent = '  '.repeat(i);
          const label = l.depth === 0 ? 'root layout' : l.segments.join('/') + ' layout';
          return `${indent}${label}\n${indent}  └─ ${l.shortPath}`;
        });

        // Add the page at the end
        const pageFile = await this.resolveCurrentRouteFile();
        if (pageFile) {
          const indent = '  '.repeat(matchingLayouts.length);
          chain.push(`${indent}page\n${indent}  └─ ${pageFile.shortPath}`);
        }

        return chain.join('\n');
      } catch (e) {
        return '';
      }
    }

    /**
     * T3-2: Viewport & Responsive Info — screen size, breakpoint, device type,
     * pixel ratio, orientation, and detected CSS breakpoint.
     */
    buildViewportInfo() {
      const lines = [];

      const w = window.innerWidth;
      const h = window.innerHeight;
      lines.push(`Viewport: ${w}x${h}`);

      // Device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== 1) lines.push(`Pixel ratio: ${dpr}x`);

      // Orientation
      lines.push(`Orientation: ${w > h ? 'landscape' : 'portrait'}`);

      // Detect common Tailwind/Bootstrap breakpoint
      let breakpoint = 'xs';
      if (w >= 1536) breakpoint = '2xl';
      else if (w >= 1280) breakpoint = 'xl';
      else if (w >= 1024) breakpoint = 'lg';
      else if (w >= 768) breakpoint = 'md';
      else if (w >= 640) breakpoint = 'sm';
      lines.push(`Breakpoint: ${breakpoint} (${w}px)`);

      // Device type heuristic
      const isMobile = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent);
      const isTablet = /iPad|Tablet/i.test(navigator.userAgent) || (w >= 600 && w <= 1024 && 'ontouchstart' in window);
      lines.push(`Device: ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`);

      // Touch support
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        lines.push(`Touch: supported (${navigator.maxTouchPoints} points)`);
      }

      // Scrollbar position
      const scrollY = Math.round(window.scrollY);
      const scrollMax = Math.round(document.documentElement.scrollHeight - h);
      if (scrollMax > 0) {
        const scrollPercent = Math.round((scrollY / scrollMax) * 100);
        lines.push(`Scroll: ${scrollPercent}% (${scrollY}px / ${scrollMax}px)`);
      }

      // Color scheme preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        lines.push('Prefers: dark mode');
      }

      // Reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        lines.push('Prefers: reduced motion');
      }

      return lines.map(l => `  ${l}`).join('\n');
    }

    /**
     * T3-3: Performance Hints — Core Web Vitals, resource counts, slow requests,
     * memory usage, DOM size.
     */
    buildPerformanceHints(networkEntries = []) {
      const lines = [];

      // Core Web Vitals via PerformanceObserver entries (if available)
      try {
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(e => e.name === 'first-contentful-paint');
        if (fcp) lines.push(`FCP: ${Math.round(fcp.startTime)}ms`);

        // Navigation timing
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          const ttfb = Math.round(nav.responseStart - nav.requestStart);
          const domReady = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
          const load = Math.round(nav.loadEventEnd - nav.startTime);
          if (ttfb > 0) lines.push(`TTFB: ${ttfb}ms`);
          if (domReady > 0) lines.push(`DOM ready: ${domReady}ms`);
          if (load > 0) lines.push(`Page load: ${load}ms`);
          // Transfer size
          if (nav.transferSize) lines.push(`Page size: ${(nav.transferSize / 1024).toFixed(1)}KB`);
        }
      } catch (_) { }

      // LCP via PerformanceObserver buffered entries
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length) {
          const lcp = lcpEntries[lcpEntries.length - 1];
          lines.push(`LCP: ${Math.round(lcp.startTime)}ms (${lcp.element?.tagName || 'unknown'})`);
        }
      } catch (_) { }

      // Resource summary
      try {
        const resources = performance.getEntriesByType('resource');
        if (resources.length) {
          const byType = {};
          let totalSize = 0;
          resources.forEach(r => {
            const ext = (r.name.split('?')[0].split('.').pop() || 'other').toLowerCase();
            let type = 'other';
            if (/^(js|mjs)$/.test(ext)) type = 'JS';
            else if (ext === 'css') type = 'CSS';
            else if (/^(png|jpg|jpeg|gif|svg|webp|ico)$/.test(ext)) type = 'images';
            else if (/^(woff2?|ttf|otf|eot)$/.test(ext)) type = 'fonts';
            byType[type] = (byType[type] || 0) + 1;
            totalSize += r.transferSize || 0;
          });
          const summary = Object.entries(byType).map(([t, c]) => `${c} ${t}`).join(', ');
          lines.push(`Resources: ${resources.length} total (${summary})`);
          if (totalSize > 0) lines.push(`Total transfer: ${(totalSize / 1024).toFixed(0)}KB`);
        }
      } catch (_) { }

      // Slow network requests (> 1s)
      const entries = Array.isArray(networkEntries) ? networkEntries : [];
      const slow = entries.filter(r => Number(r?.duration || 0) > 1000).slice(0, 3);
      if (slow.length) {
        lines.push('Slow requests (>1s):');
        slow.forEach(r => {
          let path = r.url || 'unknown';
          try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
          lines.push(`  ${path} → ${r.duration}ms`);
        });
      }

      // DOM complexity
      const domNodes = document.querySelectorAll('*').length;
      lines.push(`DOM nodes: ${domNodes.toLocaleString()}`);
      if (domNodes > 1500) lines.push(`  ⚠ Large DOM — may impact performance`);

      // Memory (if available — Chrome only)
      try {
        if (performance.memory) {
          const used = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
          const total = (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(1);
          lines.push(`Memory: ${used}MB / ${total}MB`);
        }
      } catch (_) { }

      return lines.length ? lines.map(l => `  ${l}`).join('\n') : '';
    }

    async copyBugReport() {
      const prompt = this.root.querySelector('#ai-prompt').value;
      const toggles = this.getContextToggles();
      const debug = await this.getLatestDebugInfo();

      const browser = navigator.userAgent;
      const now = new Date().toISOString();
      const url = window.location.href;
      const route = window.location.pathname;
      const selection = window.getSelection().toString();

      const parts = [];
      parts.push('Bug Report');
      parts.push(`Timestamp: ${now}`);
      parts.push(`URL: ${url}`);
      if (toggles.route) parts.push(`Route: ${route}`);
      parts.push(`Browser: ${browser}`);

      if (toggles.network) {
        parts.push('');
        parts.push('Recent Failed Network Requests (max 5):');
        parts.push(this.buildNetworkSummary(debug.network || []));
      }

      if (toggles.console) {
        parts.push('');
        parts.push('Recent Console Errors (max 5):');
        parts.push(this.buildConsoleSummary(debug.errors || []));
      }

      if (toggles.selection && selection) {
        parts.push('');
        parts.push('Selected Text:');
        parts.push(selection);
      }

      if (toggles.dom) {
        const domSnapshot = this.buildCompactDomSnapshot();
        if (domSnapshot) {
          parts.push('');
          parts.push('DOM Snapshot:');
          parts.push(domSnapshot);
        }
      }

      if (toggles.prompt && prompt) {
        parts.push('');
        parts.push('User Notes / Prompt:');
        parts.push(prompt);
      }

      await navigator.clipboard.writeText(parts.join('\n'));
      this.showToast('Report copied');
    }

    async resolveCurrentRouteFile() {
      try {
        const cleanRoute = (window.location.pathname || '/').replace(/[?#].*$/, '') || '/';
        const normalizedRoute = cleanRoute.replace(/^\/+/, '').replace(/\/+$/, '');
        const routeParts = normalizedRoute ? normalizedRoute.split('/').filter(Boolean) : [];
        const leaf = (routeParts[routeParts.length - 1] || 'page').toLowerCase();

        const extensions = ['tsx', 'jsx', 'ts', 'js'];
        const prefixes = ['', 'src/', 'app/', 'pages/', 'src/app/', 'src/pages/'];

        const routeCandidates = new Set();

        if (!normalizedRoute) {
          extensions.forEach(ext => {
            routeCandidates.add(`page.${ext}`);
            routeCandidates.add(`index.${ext}`);
            routeCandidates.add(`app/page.${ext}`);
            routeCandidates.add(`pages/index.${ext}`);
            routeCandidates.add(`src/app/page.${ext}`);
            routeCandidates.add(`src/pages/index.${ext}`);
          });
        } else {
          extensions.forEach(ext => {
            prefixes.forEach(prefix => {
              routeCandidates.add(`${prefix}${normalizedRoute}.${ext}`);
              routeCandidates.add(`${prefix}${normalizedRoute}/page.${ext}`);
              routeCandidates.add(`${prefix}${normalizedRoute}/index.${ext}`);
            });
          });
        }

        const currentProject = await Storage.getProjectForUrl(window.location.href);
        const projectPath = currentProject?.path || '';
        const projectAlias = this.getProjectAlias(currentProject || { path: projectPath, name: this.pendingProjectAlias });

        const projectIndexed = projectPath ? await Storage.getProjectFileIndex(projectPath) : { files: [], folders: [] };
        const lastPicked = await Storage.getLastPickedProjectIndex();

        let files = Array.isArray(projectIndexed.files) ? projectIndexed.files.slice() : [];
        if (!files.length && Array.isArray(this.pendingProjectIndex?.files) && this.pendingProjectIndex.files.length) {
          files = this.pendingProjectIndex.files.slice();
        }
        if (!files.length && Array.isArray(lastPicked?.files) && lastPicked.files.length) {
          files = lastPicked.files.slice();
        }

        if (!files.length) return null;

        const normalizedFiles = files
          .map(f => String(f || '').replace(/^\/+/, '').replace(/\\/g, '/'))
          .filter(Boolean);

        const routeSearchFiles = normalizedFiles.filter(file => !this.isExcludedGeneratedPath(file));

        if (!routeSearchFiles.length) return null;

        const byLower = new Map(routeSearchFiles.map(f => [f.toLowerCase(), f]));

        for (const candidate of routeCandidates) {
          const hit = byLower.get(candidate.toLowerCase());
          if (!hit) continue;
          const alias = projectAlias || this.getProjectAlias({ name: lastPicked?.alias, path: lastPicked?.sourcePath || '' });
          return {
            shortPath: `${alias}/${hit}`,
            fullPath: projectPath ? `${projectPath.replace(/\/$/, '')}/${hit}` : ''
          };
        }

        // Fallback fuzzy match: closest basename to route leaf, prefer shallower path depth
        const fuzzy = routeSearchFiles
          .map(file => {
            const lower = file.toLowerCase();
            const base = lower.split('/').pop() || lower;
            let score = 0;
            if (base.startsWith(leaf)) score += 80;
            else if (base.includes(leaf)) score += 55;
            if (normalizedRoute && lower.includes(normalizedRoute.toLowerCase())) score += 45;
            if (/\b(page|index)\./.test(base)) score += 8;
            if (/(^|\/)(app|pages)\//.test(lower) || /(^|\/)src\/(app|pages)\//.test(lower)) score += 35;
            if (/\/(page|layout|index|route)\.(tsx|jsx|ts|js)$/.test(lower)) score += 28;
            if (/\.(tsx|jsx|ts|js)$/.test(lower)) score += 10;
            if (/\.js$/.test(lower)) score -= 5;
            score -= (file.split('/').length - 1); // prefer less nested on tie
            return { file, score };
          })
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)[0];

        if (!fuzzy) return null;

        const alias = projectAlias || this.getProjectAlias({ name: lastPicked?.alias, path: lastPicked?.sourcePath || '' });
        return {
          shortPath: `${alias}/${fuzzy.file}`,
          fullPath: projectPath ? `${projectPath.replace(/\/$/, '')}/${fuzzy.file}` : ''
        };
      } catch (e) {
        return null;
      }
    }

    /**
     * Detect all project files related to the current route.
     * Returns an array of { shortPath, fullPath, role } objects (max 8).
     * Handles Next.js route groups like (dashboard), dynamic segments [id], etc.
     */
    async resolveRouteRelatedFiles() {
      try {
        const cleanRoute = (window.location.pathname || '/').replace(/[?#].*$/, '') || '/';
        const normalizedRoute = cleanRoute.replace(/^\/+/, '').replace(/\/+$/, '');
        const routeSegments = normalizedRoute ? normalizedRoute.split('/').filter(Boolean) : [];

        const currentProject = await Storage.getProjectForUrl(window.location.href);
        const projectPath = currentProject?.path || '';
        const projectAlias = this.getProjectAlias(currentProject || { path: projectPath, name: this.pendingProjectAlias });

        const projectIndexed = projectPath ? await Storage.getProjectFileIndex(projectPath) : { files: [], folders: [] };
        const lastPicked = await Storage.getLastPickedProjectIndex();

        let files = Array.isArray(projectIndexed.files) ? projectIndexed.files.slice() : [];
        if (!files.length && Array.isArray(this.pendingProjectIndex?.files) && this.pendingProjectIndex.files.length) {
          files = this.pendingProjectIndex.files.slice();
        }
        if (!files.length && Array.isArray(lastPicked?.files) && lastPicked.files.length) {
          files = lastPicked.files.slice();
        }
        if (!files.length) return [];

        const normalizedFiles = files
          .map(f => String(f || '').replace(/^\/+/, '').replace(/\\/g, '/'))
          .filter(Boolean)
          .filter(f => !this.isExcludedGeneratedPath(f));

        if (!normalizedFiles.length) return [];

        const alias = projectAlias || this.getProjectAlias({ name: lastPicked?.alias, path: lastPicked?.sourcePath || '' });

        // Helpers to clean file paths for comparison
        const stripFrameworkPrefixes = (path) => path.replace(/^(src\/)?(app|pages)\//, '');

        // Extract "meaningful" folder segments from a file path, skipping route groups (...)
        // e.g. "src/app/(auth)/login/page.tsx" → ["login"]
        // e.g. "src/app/(dashboard)/client/[id]/page.tsx" → ["client", "[id]"]
        const getRouteSegments = (filePath) => {
          const stripped = stripFrameworkPrefixes(filePath);
          const parts = stripped.split('/').filter(Boolean);
          parts.pop(); // remove filename (page.tsx, layout.tsx, etc.)
          // Remove route groups like (auth), (dashboard)
          return parts.filter(p => !/^\(.*\)$/.test(p));
        };

        // Strict match: the file's route segments must exactly match the URL's route segments.
        // Dynamic params [id] in the file path only match if the URL segment looks like a
        // dynamic value (numeric, uuid-ish), NOT a named route like "login" or "dashboard".
        const isDynamicValue = (seg) => /^\d+$/.test(seg) || /^[0-9a-f-]{8,}$/i.test(seg);

        const fileMatchesRoute = (filePath) => {
          const fileSegs = getRouteSegments(filePath);

          // Exact length must match (file folders == route segments)
          if (fileSegs.length !== routeSegments.length) return false;

          for (let i = 0; i < routeSegments.length; i++) {
            const routeSeg = routeSegments[i].toLowerCase();
            const fileSeg = fileSegs[i].toLowerCase();

            if (fileSeg === routeSeg) continue; // exact match

            // Dynamic file segment [id] only matches dynamic-looking URL values
            if (/^\[.*\]$/.test(fileSeg) && isDynamicValue(routeSeg)) continue;

            return false; // mismatch
          }
          return true;
        };

        // Role detection from filename
        const rolePatterns = [
          { role: 'page', pattern: /(^|\/)page\.(tsx|jsx|ts|js)$/i },
          { role: 'page', pattern: /(^|\/)index\.(tsx|jsx|ts|js)$/i },
          { role: 'layout', pattern: /(^|\/)layout\.(tsx|jsx|ts|js)$/i },
          { role: 'loading', pattern: /(^|\/)loading\.(tsx|jsx|ts|js)$/i },
          { role: 'error', pattern: /(^|\/)error\.(tsx|jsx|ts|js)$/i },
          { role: 'not-found', pattern: /(^|\/)not-found\.(tsx|jsx|ts|js)$/i },
          { role: 'template', pattern: /(^|\/)template\.(tsx|jsx|ts|js)$/i },
          { role: 'api', pattern: /(^|\/)route\.(tsx|jsx|ts|js)$/i },
          { role: 'style', pattern: /\.(css|scss|module\.css|module\.scss)$/i },
          { role: 'test', pattern: /\.(test|spec)\.(tsx|jsx|ts|js)$/i },
        ];

        const detectRole = (filePath) => {
          for (const { role, pattern } of rolePatterns) {
            if (pattern.test(filePath)) return role;
          }
          return 'component';
        };

        // Also check direct file matches (e.g. login.tsx for /login route)
        const extensions = ['tsx', 'jsx', 'ts', 'js'];
        const prefixes = ['', 'src/', 'app/', 'pages/', 'src/app/', 'src/pages/'];
        const directCandidates = new Set();
        if (normalizedRoute) {
          extensions.forEach(ext => {
            prefixes.forEach(prefix => {
              directCandidates.add(`${prefix}${normalizedRoute}.${ext}`.toLowerCase());
            });
          });
        }

        const results = [];
        const seen = new Set();

        for (const file of normalizedFiles) {
          const lower = file.toLowerCase();
          if (seen.has(lower)) continue;

          // Check: direct candidate OR folder-matched route file/component
          let isRelated = directCandidates.has(lower);

          if (!isRelated) {
            // For files in a matching route folder: include page/layout/loading/error/template
            // and shallow components (_components/, _content, etc.)
            const fileSegs = getRouteSegments(file);
            if (fileSegs.length === routeSegments.length && fileMatchesRoute(file)) {
              // Exact route folder — include page, layout, and direct components
              isRelated = true;
            } else if (fileSegs.length === routeSegments.length + 1) {
              // One level deeper (e.g. _components subfolder) — only if parent matches
              const parentPath = file.split('/').slice(0, -1).join('/');
              // Check the parent segments match
              const parentSegs = getRouteSegments(parentPath + '/dummy.tsx');
              if (parentSegs.length === routeSegments.length) {
                const parentFile = parentPath + '/dummy.tsx';
                if (fileMatchesRoute(parentFile)) {
                  isRelated = true;
                }
              }
            }
          }

          if (isRelated) {
            seen.add(lower);
            results.push({
              shortPath: `${alias}/${file}`,
              fullPath: projectPath ? `${projectPath.replace(/\/$/, '')}/${file}` : file,
              role: detectRole(file)
            });
          }
        }

        // Sort: page first, then layout, then others
        const roleOrder = { page: 0, layout: 1, template: 2, loading: 3, error: 4, 'not-found': 5, api: 6, component: 7, style: 8, test: 9, util: 10 };
        results.sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99));

        // Cap at 8 to keep context focused
        return results.slice(0, 8);
      } catch (e) {
        return [];
      }
    }

    async openSettings() {
      // Deselect tabs
      this.root.querySelectorAll('.nx-tab').forEach(t => t.setAttribute('data-active', 'false'));
      // Hide active panel
      this.root.querySelectorAll('.nx-panel').forEach(p => p.setAttribute('data-active', 'false'));
      // Show settings
      this.root.querySelector('#panel-settings').setAttribute('data-active', 'true');

      // Load value
      const path = await this.getProjectPath();
      this.root.querySelector('#setting-project-path').value = path || '';
      await this.loadIndexPreferences();
      await this.loadEditorPreference();
      await this.refreshIndexStatus();
    }

    async loadEditorPreference() {
      const prefs = await Storage.getEditorPreference();
      const editorSelect = this.root.querySelector('#setting-default-editor');
      const autoCopyCb = this.root.querySelector('#setting-auto-copy-context');
      if (editorSelect) editorSelect.value = prefs.editor || 'cursor';
      if (autoCopyCb) autoCopyCb.checked = prefs.autoCopyContext !== false;
    }

    async saveEditorPreference() {
      const editor = this.root.querySelector('#setting-default-editor')?.value || 'cursor';
      const autoCopyContext = !!this.root.querySelector('#setting-auto-copy-context')?.checked;
      await Storage.setEditorPreference({ editor, autoCopyContext });
      this.updateEditorLabels(editor);
    }

    updateEditorLabels(editorKey) {
      const name = this._editorNames[editorKey] || editorKey;

      // Update the action label on the capture panel
      this.root.querySelectorAll('.nx-editor-label').forEach(el => {
        el.textContent = name;
      });

      // Update tooltips on mini bar button
      this.root.querySelectorAll('.nx-editor-btn').forEach(btn => {
        btn.setAttribute('title', `Open ${name}`);
        btn.setAttribute('data-tooltip', `Open ${name}`);
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Auth & API Docs
    // ═══════════════════════════════════════════════════════════════════════

    _currentUser = null;
    _apiDocs = [];

    async checkAuthState() {
      try {
        if (!this.isExtensionContextValid()) return;
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-auth-status' }, resolve);
        });
        if (response?.user) {
          this._currentUser = response.user;
          this.updateAuthUI(true);
          this.updateApiDocsAuthUI(true);
        } else {
          this._currentUser = null;
          this.updateAuthUI(false);
          this.updateApiDocsAuthUI(false);
        }
      } catch (e) {
        this._currentUser = null;
        this.updateAuthUI(false);
        this.updateApiDocsAuthUI(false);
      }
    }

    async handleGoogleSignIn() {
      const loginBtn = this.root.querySelector('#auth-google-btn');
      const regBtn = this.root.querySelector('#auth-google-btn-reg');
      const origLogin = loginBtn?.innerHTML;
      const origReg = regBtn?.innerHTML;
      if (loginBtn) loginBtn.textContent = 'Opening Google...';
      if (regBtn) regBtn.textContent = 'Opening Google...';

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-auth-google' }, resolve);
        });

        if (response?.ok) {
          this._currentUser = response.user;
          this.updateAuthUI(true);
          this.updateApiDocsAuthUI(true);
          this.showToast(`Signed in as ${response.user.email}`);
        } else {
          const msg = this.formatAuthError(response?.error || 'Google sign in failed');
          const errorEl = this.root.querySelector('#auth-error');
          const regErrorEl = this.root.querySelector('#auth-reg-error');
          if (errorEl && this.root.querySelector('#auth-login-form')?.style.display !== 'none') {
            errorEl.textContent = msg; errorEl.style.display = 'block';
          } else if (regErrorEl) {
            regErrorEl.textContent = msg; regErrorEl.style.display = 'block';
          }
        }
      } catch (e) {
        this.showToast('Google sign in failed');
      }

      if (loginBtn && origLogin) loginBtn.innerHTML = origLogin;
      if (regBtn && origReg) regBtn.innerHTML = origReg;
    }

    async handleSignIn() {
      const email = this.root.querySelector('#auth-email')?.value?.trim();
      const password = this.root.querySelector('#auth-password')?.value;
      const errorEl = this.root.querySelector('#auth-error');

      if (!email || !password) {
        if (errorEl) { errorEl.textContent = 'Please enter email and password'; errorEl.style.display = 'block'; }
        return;
      }

      const btn = this.root.querySelector('#auth-signin-btn');
      if (btn) btn.textContent = 'Signing in...';

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-auth-signin', email, password }, resolve);
        });

        if (response?.ok) {
          this._currentUser = response.user;
          this.updateAuthUI(true);
          this.updateApiDocsAuthUI(true);
          this.showToast(`Signed in as ${response.user.email}`);
          if (errorEl) errorEl.style.display = 'none';
          // Clear form
          if (this.root.querySelector('#auth-email')) this.root.querySelector('#auth-email').value = '';
          if (this.root.querySelector('#auth-password')) this.root.querySelector('#auth-password').value = '';
        } else {
          const msg = this.formatAuthError(response?.error || 'Sign in failed');
          if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
        }
      } catch (e) {
        if (errorEl) { errorEl.textContent = 'Sign in failed'; errorEl.style.display = 'block'; }
      }

      if (btn) btn.textContent = 'Sign In';
    }

    async handleRegister() {
      const email = this.root.querySelector('#auth-reg-email')?.value?.trim();
      const password = this.root.querySelector('#auth-reg-password')?.value;
      const confirm = this.root.querySelector('#auth-reg-confirm')?.value;
      const errorEl = this.root.querySelector('#auth-reg-error');

      if (!email || !password) {
        if (errorEl) { errorEl.textContent = 'Please fill in all fields'; errorEl.style.display = 'block'; }
        return;
      }
      if (password.length < 6) {
        if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters'; errorEl.style.display = 'block'; }
        return;
      }
      if (password !== confirm) {
        if (errorEl) { errorEl.textContent = 'Passwords do not match'; errorEl.style.display = 'block'; }
        return;
      }

      const btn = this.root.querySelector('#auth-register-btn');
      if (btn) btn.textContent = 'Creating account...';

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-auth-signup', email, password }, resolve);
        });

        if (response?.ok) {
          this._currentUser = response.user;
          this.updateAuthUI(true);
          this.updateApiDocsAuthUI(true);
          this.showToast(`Account created! Welcome ${response.user.email}`);
          if (errorEl) errorEl.style.display = 'none';
          // Clear form
          if (this.root.querySelector('#auth-reg-email')) this.root.querySelector('#auth-reg-email').value = '';
          if (this.root.querySelector('#auth-reg-password')) this.root.querySelector('#auth-reg-password').value = '';
          if (this.root.querySelector('#auth-reg-confirm')) this.root.querySelector('#auth-reg-confirm').value = '';
        } else {
          const msg = this.formatAuthError(response?.error || 'Registration failed');
          if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
        }
      } catch (e) {
        if (errorEl) { errorEl.textContent = 'Registration failed'; errorEl.style.display = 'block'; }
      }

      if (btn) btn.textContent = 'Create Account';
    }

    async handleSignOut() {
      try {
        await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-auth-signout' }, resolve);
        });
        this._currentUser = null;
        this._apiDocs = [];
        this.updateAuthUI(false);
        this.updateApiDocsAuthUI(false);
        this.showToast('Signed out');
      } catch (e) {
        this.showToast('Sign out failed');
      }
    }

    formatAuthError(raw) {
      // Firebase REST errors come as e.g. "EMAIL_NOT_FOUND", "INVALID_PASSWORD"
      const map = {
        'EMAIL_NOT_FOUND': 'No account found with this email',
        'INVALID_PASSWORD': 'Incorrect password',
        'INVALID_LOGIN_CREDENTIALS': 'Invalid email or password',
        'EMAIL_EXISTS': 'An account with this email already exists',
        'WEAK_PASSWORD': 'Password must be at least 6 characters',
        'INVALID_EMAIL': 'Invalid email address',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts. Try again later',
        'USER_DISABLED': 'This account has been disabled',
      };
      for (const [key, msg] of Object.entries(map)) {
        if (raw.includes(key)) return msg;
      }
      return raw.length > 80 ? raw.slice(0, 80) + '...' : raw;
    }

    updateAuthUI(isLoggedIn) {
      const loggedOut = this.root.querySelector('#auth-logged-out');
      const loggedIn = this.root.querySelector('#auth-logged-in');
      if (!loggedOut || !loggedIn) return;

      if (isLoggedIn && this._currentUser) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
        const emailEl = this.root.querySelector('#auth-user-email');
        const uidEl = this.root.querySelector('#auth-user-uid');
        const avatarEl = this.root.querySelector('#auth-avatar');
        if (emailEl) emailEl.textContent = this._currentUser.email || 'Unknown';
        if (uidEl) uidEl.textContent = `UID: ${this._currentUser.uid}`;
        if (avatarEl) avatarEl.textContent = (this._currentUser.email || 'U')[0].toUpperCase();
      } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
      }

      // ── Header user button & dropdown ──────────────────────────────
      this.updateHeaderUserMenu(isLoggedIn);
    }

    updateHeaderUserMenu(isLoggedIn) {
      const btn = this.root.querySelector('#header-user-btn');
      const dropdown = this.root.querySelector('#header-user-dropdown');
      if (!btn || !dropdown) return;

      dropdown.classList.remove('open');

      if (isLoggedIn && this._currentUser) {
        const initial = (this._currentUser.email || 'U')[0].toUpperCase();
        btn.className = 'nx-user-btn signed-in';
        btn.innerHTML = initial;
        btn.title = this._currentUser.email || 'Account';

        dropdown.innerHTML = `
          <div class="nx-user-dropdown-header">
            <div class="nx-user-dropdown-email">${this.escHtml(this._currentUser.email || 'Unknown')}</div>
            <div class="nx-user-dropdown-uid">UID: ${this.escHtml(this._currentUser.uid || '')}</div>
          </div>
          <button class="nx-user-dropdown-item" data-action="api-docs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            My API Docs
          </button>
          <button class="nx-user-dropdown-item" data-action="manage-docs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Manage Docs
          </button>
          <button class="nx-user-dropdown-item" data-action="settings">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Account Settings
          </button>
          <div class="nx-user-dropdown-sep"></div>
          <button class="nx-user-dropdown-item danger" data-action="signout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        `;

        // Wire dropdown item clicks
        dropdown.querySelectorAll('.nx-user-dropdown-item').forEach(item => {
          item.addEventListener('click', () => {
            dropdown.classList.remove('open');
            const action = item.dataset.action;
            if (action === 'api-docs') {
              // Switch to API Docs tab
              this.root.querySelectorAll('.nx-tab').forEach(t => t.setAttribute('data-active', 'false'));
              this.root.querySelectorAll('.nx-panel').forEach(p => p.setAttribute('data-active', 'false'));
              this.root.querySelector('[data-tab="api-docs"]')?.setAttribute('data-active', 'true');
              this.root.querySelector('#panel-api-docs')?.setAttribute('data-active', 'true');
              this.loadApiDocs();
            } else if (action === 'manage-docs') {
              window.open('https://nexusdocer.web.app/', '_blank');
            } else if (action === 'settings') {
              this.openSettings();
            } else if (action === 'signout') {
              this.handleSignOut();
            }
          });
        });
      } else {
        btn.className = 'nx-user-btn signed-out';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
        btn.title = 'Sign in';
        dropdown.innerHTML = '';
      }
    }

    updateApiDocsAuthUI(isLoggedIn) {
      const authPrompt = this.root.querySelector('#api-docs-auth-prompt');
      const content = this.root.querySelector('#api-docs-content');
      const detail = this.root.querySelector('#api-docs-detail');

      if (isLoggedIn) {
        if (authPrompt) authPrompt.style.display = 'none';
        if (content) content.style.display = 'block';
        if (detail) detail.style.display = 'none';
        this.loadApiDocs();
      } else {
        if (authPrompt) authPrompt.style.display = 'block';
        if (content) content.style.display = 'none';
        if (detail) detail.style.display = 'none';
      }
    }

    async loadApiDocs() {
      if (!this._currentUser) return;
      const listEl = this.root.querySelector('#api-docs-list');
      if (listEl) listEl.innerHTML = '<div style="text-align:center; padding:20px; color:hsl(var(--nx-muted-fg)); font-size:11px;">Loading...</div>';

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-docs-list', userId: this._currentUser.uid }, resolve);
        });

        if (response?.ok && response.docs) {
          this._apiDocs = response.docs;
          await this.renderApiDocsList(response.docs);
        } else {
          if (listEl) listEl.innerHTML = `<div class="nx-api-empty">Failed to load docs.<br><span style="font-size:9px; opacity:0.7;">${response?.error || 'Unknown error'}</span></div>`;
        }
      } catch (e) {
        if (listEl) listEl.innerHTML = '<div class="nx-api-empty">Failed to load docs.<br><span style="font-size:9px; opacity:0.7;">Extension error</span></div>';
      }
    }

    async renderApiDocsList(docs) {
      const listEl = this.root.querySelector('#api-docs-list');
      if (!listEl) return;

      if (!docs.length) {
        listEl.innerHTML = '<div class="nx-api-empty">No API collections published yet.<br><span style="font-size:9px;">Publish docs from the Nexus Docs platform.</span></div>';
        return;
      }

      const projectPath = await this.getProjectPath();
      const pinnedIds = projectPath ? await Storage.getProjectApiDocs(projectPath) : [];
      const projectName = projectPath ? projectPath.split('/').pop() : '';

      let html = '';
      if (projectPath) {
        const pinnedCount = pinnedIds.length;
        html += `<div class="nx-project-docs-hint">Project: <strong>${this.escHtml(projectName)}</strong> — ${pinnedCount ? pinnedCount + ' API doc' + (pinnedCount > 1 ? 's' : '') + ' pinned' : 'pin docs to link them to this project'}</div>`;
      }

      html += docs.map(doc => {
        const isPinned = pinnedIds.includes(doc.id);
        return `
        <div class="nx-api-doc-card" data-doc-id="${doc.id}">
          <div class="nx-api-doc-card-header">
            <div class="nx-api-doc-card-body">
              <div class="nx-api-doc-name">${this.escHtml(doc.name || 'Untitled')}</div>
              ${doc.description ? `<div class="nx-api-doc-description">${this.escHtml(doc.description)}</div>` : ''}
              <div class="nx-api-doc-stats">
                <span class="nx-api-doc-stat"><span class="dot"></span> ${doc.endpointCount || 0} endpoints</span>
                <span class="nx-api-doc-stat"><span class="dot"></span> ${doc.folderCount || 0} folders</span>
                <span class="nx-api-doc-stat">${doc.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
              </div>
            </div>
            ${projectPath ? `<button class="nx-api-pin-btn ${isPinned ? 'pinned' : ''}" data-doc-id="${doc.id}" title="${isPinned ? 'Unpin from project' : 'Pin to project'}">
              <svg viewBox="0 0 24 24" fill="${isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 2C9.24 2 7 4.24 7 7c0 1.38.56 2.63 1.46 3.54L12 22l3.54-11.46A4.98 4.98 0 0 0 17 7c0-2.76-2.24-5-5-5z"/></svg>
              ${isPinned ? 'Pinned' : 'Pin'}
            </button>` : ''}
          </div>
        </div>`;
      }).join('');

      listEl.innerHTML = html;

      // Click handlers — pin button vs card
      listEl.querySelectorAll('.nx-api-pin-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const docId = btn.dataset.docId;
          const isPinned = btn.classList.contains('pinned');
          if (isPinned) {
            await Storage.unpinApiDocFromProject(projectPath, docId);
          } else {
            await Storage.pinApiDocToProject(projectPath, docId);
          }
          // Re-render to update state
          await this.renderApiDocsList(this._apiDocs);
        });
      });
      listEl.querySelectorAll('.nx-api-doc-card').forEach(card => {
        card.addEventListener('click', () => this.openApiDoc(card.dataset.docId));
      });
    }

    escHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async openApiDoc(docId) {
      const content = this.root.querySelector('#api-docs-content');
      const detail = this.root.querySelector('#api-docs-detail');
      const endpointsEl = this.root.querySelector('#api-docs-endpoints');

      if (content) content.style.display = 'none';
      if (detail) detail.style.display = 'block';
      if (endpointsEl) endpointsEl.innerHTML = '<div style="text-align:center; padding:20px; color:hsl(var(--nx-muted-fg)); font-size:11px;">Loading collection...</div>';

      // Set header from cached meta
      const meta = this._apiDocs.find(d => d.id === docId);
      if (meta) {
        const titleEl = this.root.querySelector('#api-doc-title');
        const descEl = this.root.querySelector('#api-doc-desc');
        const metaEl = this.root.querySelector('#api-doc-meta');
        if (titleEl) titleEl.textContent = meta.name || 'Untitled';
        if (descEl) descEl.textContent = meta.description || '';
        if (metaEl) metaEl.innerHTML = `
          <span class="nx-badge outline" style="font-size:9px;">${meta.endpointCount || 0} endpoints</span>
          <span class="nx-badge outline" style="font-size:9px;">${meta.folderCount || 0} folders</span>
          <span class="nx-badge outline" style="font-size:9px;">${meta.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
        `;
      }

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-docs-get', docId }, resolve);
        });

        if (response?.ok && response.doc?.collectionJson) {
          const json = response.doc.collectionJson;
          const collection = typeof json === 'object' ? json : JSON.parse(json);
          this.renderApiEndpoints(collection);
        } else {
          if (endpointsEl) endpointsEl.innerHTML = `<div class="nx-api-empty">Failed to load.<br><span style="font-size:9px; opacity:0.7;">${response?.error || 'No data'}</span></div>`;
        }
      } catch (e) {
        if (endpointsEl) endpointsEl.innerHTML = `<div class="nx-api-empty">Failed to parse collection.<br><span style="font-size:9px; opacity:0.7;">${this.escHtml(String(e.message || e).slice(0, 120))}</span></div>`;
      }
    }

    renderApiEndpoints(collection) {
      const endpointsEl = this.root.querySelector('#api-docs-endpoints');
      if (!endpointsEl) return;

      // Postman collection format: { info, item: [...] }
      // item can be folders (with nested item array) or requests
      const html = [];

      const processItems = (items, depth = 0) => {
        if (!Array.isArray(items)) return;
        for (const item of items) {
          if (item.item && Array.isArray(item.item)) {
            // Folder
            html.push(`<div class="nx-folder-header" style="padding-left:${depth * 8}px;">📁 ${this.escHtml(item.name || 'Folder')}</div>`);
            processItems(item.item, depth + 1);
          } else if (item.request) {
            // Request
            const method = (item.request.method || 'GET').toUpperCase();
            const url = typeof item.request.url === 'string'
              ? item.request.url
              : (item.request.url?.raw || item.request.url?.path?.join('/') || '');
            const methodClass = method.toLowerCase();
            html.push(`
              <div class="nx-endpoint-item" style="padding-left:${depth * 8 + 5}px;" data-method="${method}" data-url="${this.escHtml(url)}" data-name="${this.escHtml(item.name || '')}">
                <span class="nx-method-badge ${methodClass}">${method}</span>
                <span class="nx-endpoint-path" title="${this.escHtml(url)}">${this.escHtml(item.name || url)}</span>
              </div>
            `);
          }
        }
      };

      processItems(collection.item);

      if (html.length === 0) {
        endpointsEl.innerHTML = '<div class="nx-api-empty">No endpoints found in this collection.</div>';
        return;
      }

      endpointsEl.innerHTML = html.join('');

      // Click to copy endpoint info to context
      endpointsEl.querySelectorAll('.nx-endpoint-item').forEach(el => {
        el.addEventListener('click', () => {
          const method = el.dataset.method;
          const url = el.dataset.url;
          const name = el.dataset.name;
          const text = `${method} ${url}${name ? ` (${name})` : ''}`;
          navigator.clipboard.writeText(text);
          this.showToast(`Copied: ${method} ${name || url}`);
        });
      });
    }

    showApiDocsList() {
      const content = this.root.querySelector('#api-docs-content');
      const detail = this.root.querySelector('#api-docs-detail');
      if (content) content.style.display = 'block';
      if (detail) detail.style.display = 'none';
    }

    // ═══════════════════════════════════════════════════════════════════
    //  API Docs Attach — search & include doc links in AI context
    // ═══════════════════════════════════════════════════════════════════

    _attachedApiItems = [];      // { type: 'doc'|'folder'|'endpoint', docId, docName, label, path, method?, url? }
    _apiAttachCache = {};        // docId → parsed collection JSON

    toggleApiAttachPanel() {
      const panel = this.root.querySelector('#api-attach-panel');
      if (!panel) return;
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
      } else {
        panel.classList.add('open');
        this.loadApiAttachPanel();
        setTimeout(() => this.root.querySelector('#api-attach-search')?.focus(), 80);
      }
    }

    // Returns the docs relevant to the current project (pinned), or all docs if none pinned
    async _getProjectFilteredDocs(allDocs) {
      if (!allDocs || !allDocs.length) return { docs: allDocs || [], projectPath: null, pinnedIds: [], isFiltered: false };
      const projectPath = await this.getProjectPath();
      if (!projectPath) return { docs: allDocs, projectPath: null, pinnedIds: [], isFiltered: false };
      const pinnedIds = await Storage.getProjectApiDocs(projectPath);
      if (!pinnedIds.length) return { docs: allDocs, projectPath, pinnedIds: [], isFiltered: false };
      const filtered = allDocs.filter(d => pinnedIds.includes(d.id));
      return { docs: filtered, projectPath, pinnedIds, isFiltered: true };
    }

    async loadApiAttachPanel() {
      const body = this.root.querySelector('#api-attach-body');
      if (!body) return;

      if (!this._currentUser) {
        body.innerHTML = '<div class="nx-api-attach-empty">Sign in to attach API docs</div>';
        return;
      }

      // If we already have cached docs list, render immediately
      if (this._apiDocs && this._apiDocs.length) {
        const { docs } = await this._getProjectFilteredDocs(this._apiDocs);
        this.renderApiAttachDocs(docs);
        return;
      }

      body.innerHTML = '<div class="nx-api-attach-loading">Loading collections...</div>';

      try {
        const response = await new Promise(resolve => {
          chrome.runtime.sendMessage({ action: 'nexus-docs-list', userId: this._currentUser.uid }, resolve);
        });
        if (response?.ok && response.docs) {
          this._apiDocs = response.docs;
          const { docs } = await this._getProjectFilteredDocs(response.docs);
          this.renderApiAttachDocs(docs);
        } else {
          body.innerHTML = '<div class="nx-api-attach-empty">Failed to load docs</div>';
        }
      } catch {
        body.innerHTML = '<div class="nx-api-attach-empty">Error loading docs</div>';
      }
    }

    renderApiAttachDocs(docs, filter = '') {
      const body = this.root.querySelector('#api-attach-body');
      if (!body) return;

      if (!docs.length) {
        body.innerHTML = '<div class="nx-api-attach-empty">No API collections yet</div>';
        return;
      }

      const lowerFilter = filter.toLowerCase().trim();

      const html = docs.map(doc => {
        const docLabel = doc.name || 'Untitled';
        const isDocAttached = this._attachedApiItems.some(a => a.type === 'doc' && a.docId === doc.id);
        return `
          <div class="nx-api-attach-doc" data-doc-id="${doc.id}">
            <div class="nx-api-attach-doc-header" data-doc-id="${doc.id}">
              <svg class="chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this.escHtml(docLabel)}</span>
              <div class="nx-api-attach-doc-actions">
                <button class="nx-api-attach-link-btn ${isDocAttached ? 'attached' : ''}" data-attach-type="doc" data-doc-id="${doc.id}" data-doc-name="${this.escHtml(docLabel)}" title="Attach entire collection">
                  ${isDocAttached ? '✓' : '+'} Doc
                </button>
              </div>
            </div>
            <div class="nx-api-attach-children" data-children-for="${doc.id}">
              <div class="nx-api-attach-loading" style="font-size:10px; padding:8px;">Loading...</div>
            </div>
          </div>
        `;
      }).join('');

      body.innerHTML = html;

      // Wire doc header toggle (expand/collapse)
      body.querySelectorAll('.nx-api-attach-doc-header').forEach(header => {
        header.addEventListener('click', async (e) => {
          // Don't toggle if clicking the attach button
          if (e.target.closest('.nx-api-attach-link-btn')) return;
          const docId = header.dataset.docId;
          const children = body.querySelector(`[data-children-for="${docId}"]`);
          const isExpanded = header.classList.contains('expanded');
          if (isExpanded) {
            header.classList.remove('expanded');
            children?.classList.remove('open');
          } else {
            header.classList.add('expanded');
            children?.classList.add('open');
            await this.loadApiAttachDocChildren(docId, children, lowerFilter);
          }
        });
      });

      // Wire "Attach Doc" buttons
      body.querySelectorAll('.nx-api-attach-link-btn[data-attach-type="doc"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const docId = btn.dataset.docId;
          const docName = btn.dataset.docName;
          this.toggleApiAttach({ type: 'doc', docId, docName, label: docName });
          // Refresh UI
          const isNow = this._attachedApiItems.some(a => a.type === 'doc' && a.docId === docId);
          btn.classList.toggle('attached', isNow);
          btn.innerHTML = isNow ? '✓ Doc' : '+ Doc';
        });
      });
    }

    async loadApiAttachDocChildren(docId, container, filter = '') {
      if (!container) return;

      // Check cache
      if (this._apiAttachCache[docId]) {
        this.renderApiAttachItems(docId, this._apiAttachCache[docId], container, filter);
        return;
      }

      // Check extension context
      if (!this.isExtensionContextValid()) {
        container.innerHTML = '<div class="nx-api-attach-empty" style="padding:6px; font-size:10px;">Extension reloaded — please refresh page</div>';
        return;
      }

      try {
        const response = await new Promise((resolve, reject) => {
          try {
            chrome.runtime.sendMessage({ action: 'nexus-docs-get', docId }, (resp) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(resp);
              }
            });
          } catch (err) {
            reject(err);
          }
        });

        if (response?.ok && response.doc) {
          let collection;
          const json = response.doc.collectionJson;
          if (typeof json === 'string') {
            collection = JSON.parse(json);
          } else if (typeof json === 'object' && json !== null) {
            collection = json;
          }

          if (collection?.item) {
            this._apiAttachCache[docId] = collection;
            this.renderApiAttachItems(docId, collection, container, filter);
          } else {
            container.innerHTML = '<div class="nx-api-attach-empty" style="padding:6px; font-size:10px;">No endpoints in this collection</div>';
          }
        } else {
          const errMsg = response?.error || 'Unknown error';
          container.innerHTML = `<div class="nx-api-attach-empty" style="padding:6px; font-size:10px;">Failed: ${this.escHtml(errMsg)}</div>`;
        }
      } catch (err) {
        console.error('[Nexus] loadApiAttachDocChildren error:', err);
        container.innerHTML = `<div class="nx-api-attach-empty" style="padding:6px; font-size:10px;">Error: ${this.escHtml(String(err.message || err))}</div>`;
      }
    }

    renderApiAttachItems(docId, collection, container, filter = '') {
      const docMeta = this._apiDocs.find(d => d.id === docId);
      const docName = docMeta?.name || 'Untitled';
      const html = [];

      const processItems = (items, parentPath = '', depth = 0) => {
        if (!Array.isArray(items)) return;
        for (const item of items) {
          if (item.item && Array.isArray(item.item)) {
            // Folder
            const folderPath = parentPath ? `${parentPath} / ${item.name}` : item.name;
            const isFolderAttached = this._attachedApiItems.some(a => a.type === 'folder' && a.docId === docId && a.path === folderPath);

            // Check if folder or any child matches filter
            const folderMatch = !filter || (item.name || '').toLowerCase().includes(filter);
            const childrenMatch = !filter || this.apiAttachHasMatch(item.item, filter);
            if (!folderMatch && !childrenMatch) continue;

            html.push(`
              <div class="nx-api-attach-folder" style="padding-left:${depth * 10}px;">
                <div class="nx-api-attach-folder-header" data-folder-path="${this.escHtml(folderPath)}" data-doc-id="${docId}">
                  <svg class="chevron" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📁 ${this.escHtml(item.name || 'Folder')}</span>
                  <button class="nx-api-attach-link-btn ${isFolderAttached ? 'attached' : ''}" data-attach-type="folder" data-doc-id="${docId}" data-doc-name="${this.escHtml(docName)}" data-folder-path="${this.escHtml(folderPath)}" data-label="${this.escHtml(item.name || 'Folder')}" style="font-size:8px;" title="Attach folder">
                    ${isFolderAttached ? '✓' : '+'}
                  </button>
                </div>
                <div class="nx-api-attach-children" data-folder-children="${this.escHtml(folderPath)}">
            `);
            processItems(item.item, folderPath, depth + 1);
            html.push('</div></div>');
          } else if (item.request) {
            // Endpoint
            const method = (item.request.method || 'GET').toUpperCase();
            const url = typeof item.request.url === 'string'
              ? item.request.url
              : (item.request.url?.raw || item.request.url?.path?.join('/') || '');
            const name = item.name || url;
            const endpointPath = parentPath ? `${parentPath} / ${name}` : name;
            const isEndpointAttached = this._attachedApiItems.some(a => a.type === 'endpoint' && a.docId === docId && a.path === endpointPath);

            // Filter
            if (filter && !(name.toLowerCase().includes(filter) || url.toLowerCase().includes(filter) || method.toLowerCase().includes(filter))) continue;

            html.push(`
              <div class="nx-api-attach-endpoint ${isEndpointAttached ? 'attached' : ''}" style="padding-left:${depth * 10 + 12}px;" data-attach-type="endpoint" data-doc-id="${docId}" data-doc-name="${this.escHtml(docName)}" data-method="${method}" data-url="${this.escHtml(url)}" data-label="${this.escHtml(name)}" data-path="${this.escHtml(endpointPath)}">
                <span class="nx-attach-method ${method.toLowerCase()}">${method}</span>
                <span class="nx-attach-name" title="${this.escHtml(url)}">${this.escHtml(name)}</span>
              </div>
            `);
          }
        }
      };

      processItems(collection.item);

      if (html.length === 0) {
        container.innerHTML = '<div class="nx-api-attach-empty" style="padding:6px; font-size:10px;">No matches found</div>';
        return;
      }

      container.innerHTML = html.join('');

      // Wire folder toggles
      container.querySelectorAll('.nx-api-attach-folder-header').forEach(fh => {
        fh.addEventListener('click', (e) => {
          if (e.target.closest('.nx-api-attach-link-btn')) return;
          const folderPath = fh.dataset.folderPath;
          const children = container.querySelector(`[data-folder-children="${CSS.escape(folderPath)}"]`);
          if (!children) return;
          const isExpanded = fh.classList.contains('expanded');
          fh.classList.toggle('expanded', !isExpanded);
          children.classList.toggle('open', !isExpanded);
        });

        // If filter is active, auto-expand
        if (filter) {
          fh.classList.add('expanded');
          const folderPath = fh.dataset.folderPath;
          const children = container.querySelector(`[data-folder-children="${CSS.escape(folderPath)}"]`);
          children?.classList.add('open');
        }
      });

      // Wire folder attach buttons
      container.querySelectorAll('.nx-api-attach-link-btn[data-attach-type="folder"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const docId = btn.dataset.docId;
          const docName = btn.dataset.docName;
          const folderPath = btn.dataset.folderPath;
          const label = btn.dataset.label;
          this.toggleApiAttach({ type: 'folder', docId, docName, path: folderPath, label });
          const isNow = this._attachedApiItems.some(a => a.type === 'folder' && a.docId === docId && a.path === folderPath);
          btn.classList.toggle('attached', isNow);
          btn.innerHTML = isNow ? '✓' : '+';
        });
      });

      // Wire endpoint clicks
      container.querySelectorAll('.nx-api-attach-endpoint').forEach(ep => {
        ep.addEventListener('click', () => {
          const docId = ep.dataset.docId;
          const docName = ep.dataset.docName;
          const method = ep.dataset.method;
          const url = ep.dataset.url;
          const label = ep.dataset.label;
          const path = ep.dataset.path;
          this.toggleApiAttach({ type: 'endpoint', docId, docName, method, url, label, path });
          const isNow = this._attachedApiItems.some(a => a.type === 'endpoint' && a.docId === docId && a.path === path);
          ep.classList.toggle('attached', isNow);
        });
      });
    }

    apiAttachHasMatch(items, filter) {
      if (!Array.isArray(items)) return false;
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          if ((item.name || '').toLowerCase().includes(filter)) return true;
          if (this.apiAttachHasMatch(item.item, filter)) return true;
        } else if (item.request) {
          const method = (item.request.method || 'GET').toLowerCase();
          const url = typeof item.request.url === 'string'
            ? item.request.url
            : (item.request.url?.raw || item.request.url?.path?.join('/') || '');
          const name = (item.name || '').toLowerCase();
          if (name.includes(filter) || url.toLowerCase().includes(filter) || method.includes(filter)) return true;
        }
      }
      return false;
    }

    toggleApiAttach(item) {
      const idx = this._attachedApiItems.findIndex(a =>
        a.type === item.type && a.docId === item.docId && a.path === item.path
      );
      if (idx >= 0) {
        this._attachedApiItems.splice(idx, 1);
      } else {
        this._attachedApiItems.push(item);
      }
      this.renderAttachedChips();
    }

    async removeApiAttach(index) {
      this._attachedApiItems.splice(index, 1);
      this.renderAttachedChips();
      // If panel is open, refresh it
      const panel = this.root.querySelector('#api-attach-panel');
      if (panel?.classList.contains('open')) {
        const { docs } = await this._getProjectFilteredDocs(this._apiDocs || []);
        this.renderApiAttachDocs(docs, this.root.querySelector('#api-attach-search')?.value || '');
      }
    }

    renderAttachedChips() {
      const chipsEl = this.root.querySelector('#api-attached-chips');
      if (!chipsEl) return;

      if (!this._attachedApiItems.length) {
        chipsEl.classList.remove('has-items');
        chipsEl.innerHTML = '';
        this.updateClearBtnVisibility();
        return;
      }

      chipsEl.classList.add('has-items');
      chipsEl.innerHTML = this._attachedApiItems.map((item, i) => {
        let icon = '';
        if (item.type === 'doc') icon = '📄';
        else if (item.type === 'folder') icon = '📁';
        else if (item.type === 'endpoint') icon = `<span class="nx-attach-method ${(item.method || 'get').toLowerCase()}" style="font-size:7px; padding:0 3px; border-radius:2px;">${item.method || 'GET'}</span>`;
        return `<span class="nx-attached-chip" title="${this.escHtml(item.path || item.label)}">${icon} ${this.escHtml(item.label || item.path || 'Item')}<span class="remove" data-idx="${i}">✕</span></span>`;
      }).join('');

      chipsEl.querySelectorAll('.remove').forEach(rm => {
        rm.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeApiAttach(parseInt(rm.dataset.idx, 10));
        });
      });

      this.updateClearBtnVisibility();
    }

    async filterApiAttachPanel(query) {
      if (!this._apiDocs?.length) return;
      const lowerFilter = query.toLowerCase().trim();

      // Re-render docs list with filter, respecting project pinning
      const { docs } = await this._getProjectFilteredDocs(this._apiDocs);
      this.renderApiAttachDocs(docs, lowerFilter);

      // Auto-expand docs whose children are already cached and match filter
      if (lowerFilter) {
        const body = this.root.querySelector('#api-attach-body');
        if (!body) return;
        body.querySelectorAll('.nx-api-attach-doc-header').forEach(async (header) => {
          const docId = header.dataset.docId;
          if (this._apiAttachCache[docId]) {
            const children = body.querySelector(`[data-children-for="${docId}"]`);
            if (children) {
              header.classList.add('expanded');
              children.classList.add('open');
              this.renderApiAttachItems(docId, this._apiAttachCache[docId], children, lowerFilter);
            }
          }
        });
      }
    }

    buildApiReferenceContext() {
      if (!this._attachedApiItems.length) return '';
      const sections = [];

      for (const item of this._attachedApiItems) {
        const collection = this._apiAttachCache[item.docId];
        if (!collection) {
          // Fallback: no cached data — include basic info
          if (item.type === 'endpoint') {
            sections.push(`## ${item.method || 'GET'} ${item.url || item.label}\nCollection: ${item.docName}`);
          } else {
            sections.push(`## ${item.type === 'doc' ? 'Collection' : 'Folder'}: ${item.label}\nFrom: ${item.docName}`);
          }
          continue;
        }

        if (item.type === 'doc') {
          // Whole collection — extract all endpoints
          sections.push(`## Collection: ${item.docName}`);
          if (collection.info?.description) sections.push(String(collection.info.description).slice(0, 300));
          const endpoints = this._extractEndpointsFlat(collection.item);
          sections.push(this._formatEndpointsDocs(endpoints));
        } else if (item.type === 'folder') {
          // Find folder by path and extract its endpoints
          const folder = this._findFolderByPath(collection.item, item.path);
          if (folder) {
            sections.push(`## Folder: ${item.path}\nCollection: ${item.docName}`);
            if (folder.description) sections.push(String(folder.description).slice(0, 200));
            const endpoints = this._extractEndpointsFlat(folder.item);
            sections.push(this._formatEndpointsDocs(endpoints));
          }
        } else if (item.type === 'endpoint') {
          // Find the specific endpoint
          const ep = this._findEndpointByPath(collection.item, item.path);
          if (ep) {
            sections.push(this._formatSingleEndpoint(ep, item.docName));
          } else {
            sections.push(`## ${item.method || 'GET'} ${item.url || item.label}\nCollection: ${item.docName}`);
          }
        }
      }

      return sections.filter(Boolean).join('\n\n---\n\n');
    }

    /** Recursively collect all request items from a Postman item tree */
    _extractEndpointsFlat(items, parentPath = '') {
      const endpoints = [];
      if (!Array.isArray(items)) return endpoints;
      for (const item of items) {
        const itemPath = parentPath ? `${parentPath} / ${item.name}` : item.name;
        if (item.item && Array.isArray(item.item)) {
          endpoints.push(...this._extractEndpointsFlat(item.item, itemPath));
        } else if (item.request) {
          endpoints.push({ ...item, _path: itemPath });
        }
      }
      return endpoints;
    }

    /** Find a folder node by its display path (e.g. "Auth / Login") */
    _findFolderByPath(items, targetPath, parentPath = '') {
      if (!Array.isArray(items)) return null;
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          const folderPath = parentPath ? `${parentPath} / ${item.name}` : item.name;
          if (folderPath === targetPath) return item;
          const found = this._findFolderByPath(item.item, targetPath, folderPath);
          if (found) return found;
        }
      }
      return null;
    }

    /** Find an endpoint item by its display path */
    _findEndpointByPath(items, targetPath, parentPath = '') {
      if (!Array.isArray(items)) return null;
      for (const item of items) {
        const itemPath = parentPath ? `${parentPath} / ${item.name}` : item.name;
        if (item.item && Array.isArray(item.item)) {
          const found = this._findEndpointByPath(item.item, targetPath, itemPath);
          if (found) return found;
        } else if (item.request && itemPath === targetPath) {
          return item;
        }
      }
      return null;
    }

    /** Format a list of endpoints into concise doc text */
    _formatEndpointsDocs(endpoints) {
      if (!endpoints.length) return 'No endpoints.';
      return endpoints.map(ep => {
        const req = ep.request;
        const method = (req.method || 'GET').toUpperCase();
        const url = this._extractPostmanUrl(req.url);
        let line = `### ${method} ${url}`;
        if (ep.name && ep.name !== url) line += `\nName: ${ep.name}`;
        if (req.description) line += `\n${String(req.description).trim().slice(0, 200)}`;
        line += this._formatRequestDetails(req);
        line += this._formatResponseExamples(ep.response);
        return line;
      }).join('\n\n');
    }

    /** Format a single endpoint with full detail */
    _formatSingleEndpoint(item, docName) {
      const req = item.request;
      const method = (req.method || 'GET').toUpperCase();
      const url = this._extractPostmanUrl(req.url);
      let out = `## ${method} ${url}`;
      if (item.name && item.name !== url) out += `\nName: ${item.name}`;
      out += `\nCollection: ${docName}`;
      if (req.description) out += `\n\n${String(req.description).trim().slice(0, 400)}`;
      out += this._formatRequestDetails(req);
      out += this._formatResponseExamples(item.response);
      return out;
    }

    /** Extract URL string from Postman's url object or string */
    _extractPostmanUrl(url) {
      if (typeof url === 'string') return url;
      if (url?.raw) return url.raw;
      if (url?.path) return '/' + (Array.isArray(url.path) ? url.path.join('/') : url.path);
      return 'unknown';
    }

    /** Format headers, query params, and body from a Postman request */
    _formatRequestDetails(req) {
      let out = '';

      // Headers (skip common ones)
      const skipHeaders = new Set(['content-type', 'accept', 'user-agent', 'cache-control', 'connection', 'host']);
      const headers = (req.header || []).filter(h => !h.disabled && !skipHeaders.has((h.key || '').toLowerCase()));
      if (headers.length) {
        out += '\nHeaders:';
        for (const h of headers.slice(0, 8)) {
          out += `\n  ${h.key}: ${h.value || ''}`;
        }
      }

      // Query params
      const query = req.url?.query || [];
      const activeQuery = query.filter(q => !q.disabled);
      if (activeQuery.length) {
        out += '\nQuery params:';
        for (const q of activeQuery.slice(0, 10)) {
          out += `\n  ${q.key}${q.description ? ` — ${String(q.description).slice(0, 60)}` : ''}${q.value ? ` (example: ${q.value})` : ''}`;
        }
      }

      // Path variables
      const pathVars = req.url?.variable || [];
      if (pathVars.length) {
        out += '\nPath variables:';
        for (const v of pathVars) {
          out += `\n  :${v.key}${v.description ? ` — ${String(v.description).slice(0, 60)}` : ''}${v.value ? ` (example: ${v.value})` : ''}`;
        }
      }

      // Body
      if (req.body) {
        const mode = req.body.mode;
        if (mode === 'raw' && req.body.raw) {
          const raw = String(req.body.raw).trim();
          if (raw.length > 0) {
            out += `\nBody (${req.body.options?.raw?.language || 'raw'}):`;
            out += `\n${raw.slice(0, 500)}`;
          }
        } else if (mode === 'urlencoded' && req.body.urlencoded?.length) {
          out += '\nBody (form-urlencoded):';
          for (const f of req.body.urlencoded.filter(f => !f.disabled).slice(0, 10)) {
            out += `\n  ${f.key}${f.description ? ` — ${String(f.description).slice(0, 60)}` : ''}`;
          }
        } else if (mode === 'formdata' && req.body.formdata?.length) {
          out += '\nBody (form-data):';
          for (const f of req.body.formdata.filter(f => !f.disabled).slice(0, 10)) {
            out += `\n  ${f.key} (${f.type || 'text'})${f.description ? ` — ${String(f.description).slice(0, 60)}` : ''}`;
          }
        }
      }

      // Auth
      if (req.auth) {
        const authType = req.auth.type || 'unknown';
        out += `\nAuth: ${authType}`;
      }

      return out;
    }

    /** Format response examples from Postman's response array */
    _formatResponseExamples(responses) {
      if (!Array.isArray(responses) || !responses.length) return '';
      let out = '\nResponse examples:';
      for (const resp of responses.slice(0, 3)) {
        const status = resp.code || resp.status || '?';
        const name = resp.name || '';
        out += `\n  [${status}]${name ? ' ' + name : ''}`;
        if (resp.body) {
          const body = String(resp.body).trim();
          if (body.length > 0) {
            // Try to show shape rather than full body
            try {
              const parsed = JSON.parse(body);
              out += `\n  ${this._describeResponseShape(parsed)}`;
            } catch {
              out += `\n  ${body.slice(0, 300)}`;
            }
          }
        }
      }
      return out;
    }

    /** Describe JSON response shape for AI readability */
    _describeResponseShape(obj, depth = 0, maxDepth = 2) {
      if (depth > maxDepth) return '...';
      if (obj === null) return 'null';
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return `[${this._describeResponseShape(obj[0], depth + 1, maxDepth)}, ... (${obj.length} items)]`;
      }
      if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        const fields = keys.slice(0, 8).map(k => {
          const val = obj[k];
          if (val === null) return `${k}: null`;
          if (Array.isArray(val)) return `${k}: [${val.length > 0 ? typeof val[0] + '...' : ''}] (${val.length})`;
          if (typeof val === 'object') return `${k}: {${Object.keys(val).slice(0, 3).join(', ')}${Object.keys(val).length > 3 ? ', ...' : ''}}`;
          return `${k}: ${typeof val}`;
        });
        return `{ ${fields.join(', ')}${keys.length > 8 ? `, ... +${keys.length - 8} more` : ''} }`;
      }
      return typeof obj;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  API Auto-Suggest — detect "implement/integrate" and search docs
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Called on every prompt input. Detects implementation-related keywords,
     * extracts the search term, and shows matching API doc suggestions.
     */
    checkApiSuggest() {
      const text = this.root.querySelector('#ai-prompt')?.value || '';

      // If dismissed, re-enable when text meaningfully changes
      if (this._apiSuggestDismissed) {
        if (text === this._apiSuggestDismissedText) return;
        this._apiSuggestDismissed = false;
        this._apiSuggestDismissedText = '';
      }

      // Must be logged in and have docs
      if (!this._currentUser) {
        this.root.querySelector('#api-suggest-bar')?.classList.remove('visible');
        return;
      }

      // Check if any implementation pattern matches
      const hasImplement = this._implementPatterns.some(p => p.test(text));
      if (!hasImplement || text.trim().length < 4) {
        this.root.querySelector('#api-suggest-bar')?.classList.remove('visible');
        return;
      }

      // Extract the search query — strip the trigger keywords to get the "what"
      const searchQuery = this._extractApiSearchQuery(text);
      if (!searchQuery || searchQuery.length < 2) {
        this.root.querySelector('#api-suggest-bar')?.classList.remove('visible');
        return;
      }

      // Debounce to avoid hammering on every keystroke
      clearTimeout(this._apiSuggestDebounce);
      this._apiSuggestDebounce = setTimeout(() => {
        this._runApiSuggest(searchQuery);
      }, 250);
    }

    /**
     * Extract the meaningful search query from the prompt.
     * E.g. "implement login endpoint" → "login endpoint"
     *      "create user registration" → "user registration"
     *      "integrate payment api" → "payment api"
     */
    _extractApiSearchQuery(text) {
      // Strip common trigger words to get the subject
      const stripped = text
        .replace(/\b(implement(ation|ing|ed|s)?)\b/gi, '')
        .replace(/\b(integrat(e|ion|ing|ed|s)?)\b/gi, '')
        .replace(/\b(build(ing|s)?)\b/gi, '')
        .replace(/\b(creat(e|ing|ion|ed|s)?)\b/gi, '')
        .replace(/\b(add(ing|ed|s)?)\b/gi, '')
        .replace(/\b(connect(ing|ed|s)?)\b/gi, '')
        .replace(/\b(consum(e|ing|ed|s)?)\b/gi, '')
        .replace(/\b(call(ing|ed|s)?)\b/gi, '')
        .replace(/\b(hook\s*up|wire\s*up|set\s*up)\b/gi, '')
        .replace(/\b(fetch(ing|ed|es)?)\b/gi, '')
        .replace(/\b(use|using)\b/gi, '')
        .replace(/\b(the|a|an|to|for|from|with|this|that|our|my)\b/gi, '')
        .replace(/\b(api|endpoint|route|function|method|service)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return stripped;
    }

    /**
     * Ensure all API doc collections are fetched and cached for searching.
     * Only fetches each doc once. Returns when all are ready.
     */
    async _ensureApiDocsCached() {
      if (!this._currentUser || !this.isExtensionContextValid()) return;

      // Load doc list if missing
      if (!this._apiDocs?.length) {
        try {
          const response = await new Promise((resolve, reject) => {
            try {
              chrome.runtime.sendMessage({ action: 'nexus-docs-list', userId: this._currentUser.uid }, (r) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(r);
              });
            } catch (e) { reject(e); }
          });
          if (response?.ok && response.docs) this._apiDocs = response.docs;
        } catch { /* ignore */ }
      }

      if (!this._apiDocs?.length) return;

      // Only cache docs relevant to the current project (or all if none pinned)
      const { docs: relevantDocs } = await this._getProjectFilteredDocs(this._apiDocs);

      // Fetch collection data for any doc not yet cached (in parallel)
      const uncached = relevantDocs.filter(d => !this._apiAttachCache[d.id]);
      if (!uncached.length) return;

      // Flag to avoid re-fetching while in progress
      if (this._apiCacheFetching) return;
      this._apiCacheFetching = true;

      try {
        await Promise.all(uncached.map(async (doc) => {
          try {
            const response = await new Promise((resolve, reject) => {
              try {
                chrome.runtime.sendMessage({ action: 'nexus-docs-get', docId: doc.id }, (r) => {
                  if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                  else resolve(r);
                });
              } catch (e) { reject(e); }
            });
            if (response?.ok && response.doc?.collectionJson) {
              const json = response.doc.collectionJson;
              const collection = typeof json === 'object' ? json : JSON.parse(json);
              if (collection?.item) {
                this._apiAttachCache[doc.id] = collection;
              }
            }
          } catch { /* skip this doc */ }
        }));
      } finally {
        this._apiCacheFetching = false;
      }
    }

    /**
     * Search all cached API doc collections for matches and render suggestions.
     */
    async _runApiSuggest(query) {
      const bar = this.root.querySelector('#api-suggest-bar');
      const itemsEl = this.root.querySelector('#api-suggest-items');
      if (!bar || !itemsEl) return;

      // Show loading state while fetching docs
      const needsFetch = !this._apiDocs?.length || (this._apiDocs || []).some(d => !this._apiAttachCache[d.id]);
      if (needsFetch) {
        bar.classList.add('visible');
        itemsEl.innerHTML = '<span class="nx-suggest-no-match" style="display:inline-flex;align-items:center;gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Loading API docs...</span>';
      }

      // Ensure all docs are fetched and cached
      await this._ensureApiDocsCached();

      const lowerQ = query.toLowerCase();
      const results = []; // { type, docId, docName, label, path, method?, url? }

      // Filter to project-pinned docs if applicable
      const { docs: searchDocs } = await this._getProjectFilteredDocs(this._apiDocs || []);

      // Search across relevant docs
      for (const doc of searchDocs) {
        const docName = doc.name || 'Untitled';

        // Match on collection name
        if (docName.toLowerCase().includes(lowerQ)) {
          results.push({ type: 'doc', docId: doc.id, docName, label: docName, path: docName });
        }

        // Search within the collection's endpoints and folders
        const cached = this._apiAttachCache[doc.id];
        if (cached?.item) {
          this._searchItems(cached.item, lowerQ, doc.id, docName, '', results);
        }
      }

      // Deduplicate and cap at 8
      const unique = [];
      const seen = new Set();
      for (const r of results) {
        const key = `${r.type}:${r.docId}:${r.path}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(r);
        }
        if (unique.length >= 8) break;
      }

      if (unique.length === 0) {
        bar.classList.remove('visible');
        return;
      }

      bar.classList.add('visible');
      itemsEl.innerHTML = unique.map((item, i) => {
        const isAttached = this._attachedApiItems.some(a => a.type === item.type && a.docId === item.docId && a.path === item.path);
        if (item.type === 'endpoint') {
          return `<button class="nx-api-suggest-item ${isAttached ? 'attached' : ''}" data-idx="${i}">
            <span class="nx-suggest-method ${(item.method || 'get').toLowerCase()}">${item.method || 'GET'}</span>
            ${this.escHtml(item.label)}
          </button>`;
        } else if (item.type === 'folder') {
          return `<button class="nx-api-suggest-item ${isAttached ? 'attached' : ''}" data-idx="${i}">📁 ${this.escHtml(item.label)}</button>`;
        } else {
          return `<button class="nx-api-suggest-item ${isAttached ? 'attached' : ''}" data-idx="${i}">📄 ${this.escHtml(item.label)}</button>`;
        }
      }).join('');

      // Wire click to attach
      itemsEl.querySelectorAll('.nx-api-suggest-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.idx, 10);
          const item = unique[idx];
          if (!item) return;
          this.toggleApiAttach(item);
          const isNow = this._attachedApiItems.some(a => a.type === item.type && a.docId === item.docId && a.path === item.path);
          el.classList.toggle('attached', isNow);
        });
      });
    }

    /**
     * Recursively search Postman collection items for matches.
     */
    _searchItems(items, query, docId, docName, parentPath, results) {
      if (!Array.isArray(items) || results.length >= 12) return;
      for (const item of items) {
        if (results.length >= 12) break;
        const itemPath = parentPath ? `${parentPath} / ${item.name}` : item.name;
        if (item.item && Array.isArray(item.item)) {
          // Folder
          if ((item.name || '').toLowerCase().includes(query)) {
            results.push({ type: 'folder', docId, docName, label: item.name, path: itemPath });
          }
          this._searchItems(item.item, query, docId, docName, itemPath, results);
        } else if (item.request) {
          // Endpoint
          const method = (item.request.method || 'GET').toUpperCase();
          const url = typeof item.request.url === 'string'
            ? item.request.url
            : (item.request.url?.raw || item.request.url?.path?.join('/') || '');
          const name = item.name || url;
          if (name.toLowerCase().includes(query) || url.toLowerCase().includes(query)) {
            results.push({ type: 'endpoint', docId, docName, method, url, label: name, path: itemPath });
          }
        }
      }
    }

    async saveSettings() {
      const path = this.root.querySelector('#setting-project-path').value.trim();
      const activeExtensions = this.getActiveIndexExtensions();
      await Storage.setIndexPreferences({ extensions: activeExtensions });
      this.indexExtensions = activeExtensions;
      await this.saveEditorPreference();

      if (path) {
        const host = window.location.host || 'localhost';
        const hostname = window.location.hostname || 'localhost';
        const mapping = {
          path: path,
          name: path.split('/').pop()
        };
        await Storage.addProjectMapping(host, mapping);
        if (hostname !== host) {
          await Storage.addProjectMapping(hostname, mapping);
        }

        if (this.pendingProjectIndex) {
          await Storage.setProjectFileIndex(path, this.pendingProjectIndex);
        }

        this.showToast('Settings saved');
        await this.refreshIndexStatus();
      }
    }

    async exportSettings() {
      try {
        const data = await chrome.storage.local.get(null);
        // Remove transient data that shouldn't be exported
        delete data.widgetState;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-helper-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Settings exported!');
      } catch (e) {
        console.error('[Nexus Helper] Export failed:', e);
        this.showToast('Export failed');
      }
    }

    async importSettings(event) {
      try {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        if (typeof data !== 'object' || data === null) {
          this.showToast('Invalid backup file');
          return;
        }

        // Merge into storage (don't overwrite widgetState)
        delete data.widgetState;
        await chrome.storage.local.set(data);
        this.showToast('Settings imported! Refresh pages to apply.');

        // Reset file input so re-importing the same file works
        event.target.value = '';
      } catch (e) {
        console.error('[Nexus Helper] Import failed:', e);
        this.showToast('Import failed — invalid JSON');
      }
    }

    isExtensionContextValid() {
      return !!(chrome?.runtime?.id) && !this.contextInvalidated;
    }

    handleContextInvalidated(error) {
      if (this.contextInvalidated) return true;
      const message = String(error?.message || error || '');
      if (!message.includes('Extension context invalidated')) return false;
      this.contextInvalidated = true;
      if (this.debugPollTimer) {
        clearInterval(this.debugPollTimer);
        this.debugPollTimer = null;
      }
      if (this.storageChangeListener) {
        try {
          chrome.storage.onChanged.removeListener(this.storageChangeListener);
        } catch (_) { }
        this.storageChangeListener = null;
      }
      return true;
    }

    showToast(msg) {
      // Remove existing toast
      const existing = this.root.querySelector('.nx-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'nx-toast';
      toast.textContent = msg;
      toast.style.cssText = `
         position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%) translateY(8px);
         background: hsl(var(--nx-fg)); color: hsl(var(--nx-bg));
         padding: 7px 14px; border-radius: 8px; font-size: 11px; font-weight: 500;
         opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none;
         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
         letter-spacing: -0.01em;
         z-index: 100;
       `;
      this.root.appendChild(toast);
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(8px)';
        setTimeout(() => toast.remove(), 200);
      }, 2000);
    }

    attachSelection() {
      const selection = window.getSelection().toString();
      if (!selection) {
        this.showToast('No text selected');
        return;
      }
      const prompt = this.root.querySelector('#ai-prompt');
      prompt.value += (prompt.value ? '\n\n' : '') + 'Selected Context:\n```\n' + selection + '\n```';
      this.showToast('Selection attached');
    }

    togglePicker() {
      this.isPicking = !this.isPicking;
      const btn = this.root.querySelector('#pick-text-btn');

      if (this.isPicking) {
        btn.classList.add('active');

        // Save cursor position in textarea before minimizing
        const prompt = this.root.querySelector('#ai-prompt');
        if (prompt) {
          this._pickerCursorPos = prompt.selectionStart ?? prompt.value.length;
        } else {
          this._pickerCursorPos = 0;
        }

        // Remember widget state before minimizing so we can restore it
        this._prePickerState = this.state !== 'collapsed' ? this.state : (this.lastExpandedState || 'expanded');

        // Auto-minimize so user can see the page
        if (this.state !== 'collapsed') {
          this.setState('collapsed');
        }

        this.enablePicker();
        this.showToast('Picker ON — click any element');
      } else {
        btn.classList.remove('active');
        this.disablePicker();
        this.showToast('Picker OFF');
      }
    }

    enablePicker() {
      this.pickerHandler = (e) => {
        if (this.container.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();

        const text = e.target.innerText || '';
        if (text.trim()) {
          const prompt = this.root.querySelector('#ai-prompt');
          const cursorPos = this._pickerCursorPos ?? prompt.value.length;
          const before = prompt.value.slice(0, cursorPos);
          const after = prompt.value.slice(cursorPos);
          const pickedText = text.trim();

          // Insert at the saved cursor position
          prompt.value = before + pickedText + after;

          // Auto-restore widget (maximize back)
          const restoreState = this._prePickerState || this.lastExpandedState || 'expanded';
          if (this.state === 'collapsed') {
            this.setState(restoreState);
          }

          // Auto-focus textarea and place cursor right after the inserted text
          const newCursorPos = cursorPos + pickedText.length;
          requestAnimationFrame(() => {
            prompt.focus();
            prompt.setSelectionRange(newCursorPos, newCursorPos);
            prompt.dispatchEvent(new Event('input', { bubbles: true }));
          });

          this.showToast('Text inserted');
        }

        this.togglePicker(); // Auto-off after pick
      };

      this.hoverHandler = (e) => {
        if (this.container.contains(e.target)) return;
        if (this.lastHovered) this.lastHovered.style.outline = '';
        this.lastHovered = e.target;
        e.target.style.outline = '2px dashed #3b82f6';
      };

      document.addEventListener('click', this.pickerHandler, true);
      document.addEventListener('mouseover', this.hoverHandler, true);
    }

    disablePicker() {
      if (this.lastHovered) {
        this.lastHovered.style.outline = '';
        this.lastHovered = null;
      }
      document.removeEventListener('click', this.pickerHandler, true);
      document.removeEventListener('mouseover', this.hoverHandler, true);

      // Restore widget if it was minimized by the picker and user cancelled
      if (this.state === 'collapsed' && this._prePickerState) {
        this.setState(this._prePickerState);
        const prompt = this.root.querySelector('#ai-prompt');
        if (prompt) {
          requestAnimationFrame(() => {
            prompt.focus();
            const pos = this._pickerCursorPos ?? prompt.value.length;
            prompt.setSelectionRange(pos, pos);
          });
        }
      }
      this._prePickerState = null;
      this._pickerCursorPos = null;
    }

    async saveState() {
      await chrome.storage.local.set({
        widgetState: {
          mode: this.state,
          lastExpandedState: this.lastExpandedState || 'expanded',
          position: this.lastPosition,
          customSize: this._customSize || null
        }
      });
    }

    async loadState() {
      const res = await chrome.storage.local.get(['widgetState', 'theme']);
      if (res.widgetState) {
        const { mode, position, lastExpandedState, customSize } = res.widgetState;
        if (lastExpandedState) this.lastExpandedState = lastExpandedState;
        if (mode) {
          if (mode === 'collapsed' && this.lastExpandedState) {
            this.state = mode;
            this.root.setAttribute('data-state', mode);
          } else {
            this.setState(mode);
          }
        }
        if (position) {
          this.lastPosition = position;
          this.root.style.left = position.x + 'px';
          this.root.style.top = position.y + 'px';
          this.root.style.right = 'auto';
        }
        if (customSize && customSize.w && customSize.h && mode !== 'collapsed') {
          this._customSize = customSize;
          this.root.style.width = customSize.w + 'px';
          this.root.style.height = customSize.h + 'px';
        }
      }
      if (res.theme) {
        this.root.setAttribute('data-mode', res.theme);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // Autocomplete Engine — ghost text with Tab to accept
    // ═══════════════════════════════════════════════════════════════════
    setupAutocomplete() {
      const textarea = this.root.querySelector('#ai-prompt');
      const overlay = this.root.querySelector('#ghost-overlay');
      const tabHint = this.root.querySelector('#tab-hint');
      if (!textarea || !overlay) return;

      this._acSuggestion = null; // current suggestion text

      // Completions dictionary: prefix → completion
      // Matched against the last line of text up to cursor
      this._acCompletions = [
        // Prompt starters
        { prefix: 'fix ', completion: 'the bug where ' },
        { prefix: 'fix the ', completion: 'issue with ' },
        { prefix: 'add ', completion: 'a feature that ' },
        { prefix: 'add a ', completion: 'new component for ' },
        { prefix: 'create ', completion: 'a new ' },
        { prefix: 'create a ', completion: 'component that ' },
        { prefix: 'update ', completion: 'the existing ' },
        { prefix: 'update the ', completion: 'component to ' },
        { prefix: 'refactor ', completion: 'the code to ' },
        { prefix: 'refactor the ', completion: 'function to improve ' },
        { prefix: 'remove ', completion: 'the unused ' },
        { prefix: 'delete ', completion: 'the ' },
        { prefix: 'rename ', completion: 'the variable ' },
        { prefix: 'move ', completion: 'the component to ' },
        { prefix: 'change ', completion: 'the behavior of ' },
        { prefix: 'replace ', completion: 'the current ' },
        { prefix: 'implement ', completion: 'the logic for ' },
        { prefix: 'style ', completion: 'the component with ' },
        { prefix: 'optimize ', completion: 'the performance of ' },
        { prefix: 'debug ', completion: 'the issue with ' },
        { prefix: 'test ', completion: 'the function ' },
        { prefix: 'write ', completion: 'a test for ' },
        { prefix: 'explain ', completion: 'how the ' },
        { prefix: 'document ', completion: 'the function ' },

        // Technical phrases
        { prefix: 'the component ', completion: 'is not rendering correctly' },
        { prefix: 'the api ', completion: 'endpoint returns ' },
        { prefix: 'the button ', completion: 'does not work when ' },
        { prefix: 'the form ', completion: 'validation is not ' },
        { prefix: 'the page ', completion: 'is loading slowly because ' },
        { prefix: 'the state ', completion: 'is not updating when ' },
        { prefix: 'the data ', completion: 'is not being fetched correctly' },
        { prefix: 'the error ', completion: 'occurs when ' },
        { prefix: 'the style ', completion: 'is not applied correctly' },
        { prefix: 'the layout ', completion: 'breaks on ' },
        { prefix: 'the modal ', completion: 'is not closing when ' },
        { prefix: 'the input ', completion: 'field does not ' },
        { prefix: 'the table ', completion: 'is not displaying ' },
        { prefix: 'the request ', completion: 'fails with status ' },
        { prefix: 'the response ', completion: 'does not contain ' },

        // Common continuations
        { prefix: 'i want to ', completion: 'add a feature that ' },
        { prefix: 'i need to ', completion: 'fix the issue where ' },
        { prefix: 'can you ', completion: 'help me with ' },
        { prefix: 'how do i ', completion: 'implement ' },
        { prefix: 'how to ', completion: 'handle the case when ' },
        { prefix: 'why is ', completion: 'the component ' },
        { prefix: 'why does ', completion: 'the function ' },
        { prefix: 'what is ', completion: 'the best way to ' },
        { prefix: 'there is ', completion: 'an error when ' },
        { prefix: 'it should ', completion: 'display the ' },
        { prefix: 'it does not ', completion: 'work when ' },
        { prefix: 'when i click ', completion: 'the button ' },
        { prefix: 'when the user ', completion: 'submits the form ' },
        { prefix: 'after ', completion: 'the page loads ' },
        { prefix: 'before ', completion: 'submitting the form ' },
        { prefix: 'instead of ', completion: 'the current behavior ' },

        // Code/technical
        { prefix: 'import ', completion: 'the component from ' },
        { prefix: 'export ', completion: 'the function ' },
        { prefix: 'return ', completion: 'the result of ' },
        { prefix: 'async ', completion: 'function that fetches ' },
        { prefix: 'fetch ', completion: 'data from the API endpoint ' },
        { prefix: 'map ', completion: 'over the array and ' },
        { prefix: 'filter ', completion: 'the items where ' },
        { prefix: 'sort ', completion: 'the list by ' },
        { prefix: 'convert ', completion: 'the data to ' },
        { prefix: 'validate ', completion: 'the input before ' },
        { prefix: 'handle ', completion: 'the error case where ' },
        { prefix: 'navigate ', completion: 'to the page ' },
        { prefix: 'redirect ', completion: 'the user to ' },
        { prefix: 'display ', completion: 'a message when ' },
        { prefix: 'show ', completion: 'the loading state while ' },
        { prefix: 'hide ', completion: 'the element when ' },
        { prefix: 'toggle ', completion: 'the visibility of ' },
        { prefix: 'render ', completion: 'the component with ' },
        { prefix: 'pass ', completion: 'the props to ' },
        { prefix: 'use ', completion: 'the hook to ' },

        // Nexus-specific context
        { prefix: '/route', completion: ' — attach current route' },
        { prefix: '@', completion: 'filename — attach project file' },
      ];

      // Sort longest prefix first for greedy matching
      this._acCompletions.sort((a, b) => b.prefix.length - a.prefix.length);

      // Recently accepted completions get boosted
      this._acHistory = [];

      // Input handler — compute suggestion
      textarea.addEventListener('input', () => this._updateGhostText());
      textarea.addEventListener('scroll', () => {
        overlay.scrollTop = textarea.scrollTop;
      });

      // Keydown — Tab to accept, Escape to dismiss
      // Use capture phase so we run before the /@ suggestion handler
      textarea.addEventListener('keydown', (e) => {
        // Don't interfere with the /@ suggestion menu
        const menu = this.root.querySelector('#prompt-suggest-menu');
        const menuOpen = menu && menu.classList.contains('active');
        if (menuOpen) {
          this._clearGhostText();
          return;
        }

        if (e.key === 'Tab' && this._acSuggestion && !e.shiftKey) {
          e.preventDefault();
          this._acceptSuggestion();
        } else if (e.key === 'Escape' && this._acSuggestion) {
          this._clearGhostText();
        } else if (e.key === 'ArrowRight' && this._acSuggestion) {
          // Accept with Right arrow when cursor is at end
          const atEnd = textarea.selectionStart === textarea.value.length;
          if (atEnd) {
            e.preventDefault();
            this._acceptSuggestion();
          }
        }
      });

      // Clear on blur
      textarea.addEventListener('blur', () => this._clearGhostText());
    }

    _updateGhostText() {
      const textarea = this.root.querySelector('#ai-prompt');
      const overlay = this.root.querySelector('#ghost-overlay');
      const tabHint = this.root.querySelector('#tab-hint');
      if (!textarea || !overlay) return;

      const text = textarea.value;
      const cursor = textarea.selectionStart;

      // Only suggest when cursor is at end of text (no mid-text suggestions)
      if (cursor !== text.length) {
        this._clearGhostText();
        return;
      }

      // Get the last line up to cursor for matching
      const lastNewline = text.lastIndexOf('\n', cursor - 1);
      const lastLine = text.slice(lastNewline + 1, cursor).toLowerCase();

      if (lastLine.length < 2) {
        this._clearGhostText();
        return;
      }

      // Find best matching completion
      let suggestion = null;

      // First check history (recent completions)
      for (const h of this._acHistory) {
        if (lastLine.endsWith(h.prefix)) {
          suggestion = h.completion;
          break;
        }
      }

      // Then check dictionary
      if (!suggestion) {
        for (const c of this._acCompletions) {
          if (lastLine.endsWith(c.prefix)) {
            suggestion = c.completion;
            break;
          }
        }
      }

      // Partial word completion — match the start of any prefix
      if (!suggestion) {
        const words = lastLine.split(/\s+/);
        const lastWord = words[words.length - 1];
        if (lastWord.length >= 3) {
          for (const c of this._acCompletions) {
            const prefixFirstWord = c.prefix.split(/\s+/)[0];
            if (prefixFirstWord.startsWith(lastWord) && prefixFirstWord !== lastWord) {
              suggestion = prefixFirstWord.slice(lastWord.length) + ' ' + c.completion;
              break;
            }
          }
        }
      }

      if (!suggestion) {
        this._clearGhostText();
        return;
      }

      this._acSuggestion = suggestion;

      // Build ghost overlay: invisible text + visible ghost suggestion
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      overlay.innerHTML = `<span>${esc(text)}</span><span class="nx-ghost-text">${esc(suggestion)}</span>`;

      // Sync scroll
      overlay.scrollTop = textarea.scrollTop;

      // Show tab hint
      if (tabHint) tabHint.classList.add('visible');
    }

    _acceptSuggestion() {
      const textarea = this.root.querySelector('#ai-prompt');
      if (!textarea || !this._acSuggestion) return;

      const suggestion = this._acSuggestion;
      const cursor = textarea.selectionStart;
      const before = textarea.value.slice(0, cursor);
      const after = textarea.value.slice(cursor);

      textarea.value = before + suggestion + after;
      const newPos = cursor + suggestion.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();

      // Save to history for boosting
      const lastLine = before.slice(before.lastIndexOf('\n') + 1).toLowerCase();
      // Find which prefix matched
      for (const c of this._acCompletions) {
        if (lastLine.endsWith(c.prefix)) {
          // Boost this pair
          this._acHistory = this._acHistory.filter(h => h.prefix !== c.prefix);
          this._acHistory.unshift({ prefix: c.prefix, completion: c.completion });
          if (this._acHistory.length > 20) this._acHistory.pop();
          break;
        }
      }

      this._clearGhostText();

      // Trigger another suggestion pass after accepting
      requestAnimationFrame(() => this._updateGhostText());
    }

    _clearGhostText() {
      const overlay = this.root.querySelector('#ghost-overlay');
      const tabHint = this.root.querySelector('#tab-hint');
      if (overlay) overlay.innerHTML = '';
      if (tabHint) tabHint.classList.remove('visible');
      this._acSuggestion = null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // Speech Recognition + Auto Text Correction
    // ═══════════════════════════════════════════════════════════════════
    setupSpeechRecognition() {
      const micBtn = this.root.querySelector('#mic-btn');
      if (!micBtn) return;

      this._isRecording = false;
      this._speechFinal = '';
      this._speechTextBefore = '';
      this._speechTextAfter = '';
      this._speechNeedsSpace = false;

      // Auto-correction dictionary
      this._corrections = new Map([
        ['componant', 'component'], ['compnent', 'component'],
        ['fonction', 'function'], ['funtion', 'function'], ['funciton', 'function'],
        ['refacor', 'refactor'],
        ['varaiable', 'variable'], ['varable', 'variable'], ['variabel', 'variable'],
        ['paraemter', 'parameter'], ['paramater', 'parameter'], ['perameter', 'parameter'],
        ['adn', 'and'], ['teh', 'the'], ['taht', 'that'], ['wiht', 'with'],
        ['hte', 'the'], ['nto', 'not'],
        ['recieve', 'receive'], ['recive', 'receive'],
        ['occured', 'occurred'],
        ['seperate', 'separate'], ['seprate', 'separate'],
        ['definately', 'definitely'], ['definatly', 'definitely'],
        ['enviroment', 'environment'], ['enviorment', 'environment'],
        ['dependancy', 'dependency'], ['dependecy', 'dependency'],
        ['repositry', 'repository'], ['repostiory', 'repository'],
        ['authetication', 'authentication'], ['authentcation', 'authentication'],
        ['authorizaton', 'authorization'],
        ['asyncronous', 'asynchronous'], ['asynchrnous', 'asynchronous'],
        ['middlewear', 'middleware'], ['midleware', 'middleware'],
        ['endpont', 'endpoint'], ['enpoint', 'endpoint'],
        ['databse', 'database'], ['dataase', 'database'],
        ['templete', 'template'], ['templat', 'template'],
        ['interfce', 'interface'], ['interace', 'interface'],
        ['inheritence', 'inheritance'], ['inheretance', 'inheritance'],
        ['improt', 'import'], ['exoprt', 'export'],
        ['reutrn', 'return'], ['retrun', 'return'],
        ['consol', 'console'], ['consle', 'console'],
        ['defalut', 'default'], ['defualt', 'default'],
        ['lenght', 'length'], ['lengh', 'length'],
        ['widht', 'width'], ['heigth', 'height'],
        ['margni', 'margin'], ['padidng', 'padding'],
        ['disply', 'display'], ['dispaly', 'display'],
        ['positon', 'position'], ['postion', 'position'],
        ['overlfow', 'overflow'], ['backgroud', 'background'],
        ['bordr', 'border'], ['colro', 'color'], ['colour', 'color'],
        ['rendeer', 'render'], ['rendr', 'render'],
        ['stlye', 'style'], ['sytle', 'style'],
        ['buton', 'button'], ['buttn', 'button'],
        ['submti', 'submit'], ['sbumit', 'submit'],
        ['naviaget', 'navigate'], ['naviagte', 'navigate'],
        ['reuqest', 'request'], ['reqeust', 'request'],
        ['reponse', 'response'], ['respnose', 'response'],
        ['qurey', 'query'], ['qeury', 'query'],
        ['shoud', 'should'], ['shoudl', 'should'],
        ['dosent', "doesn't"], ['doesnt', "doesn't"],
        ['dont', "don't"], ['cant', "can't"], ['wont', "won't"],
        ['isnt', "isn't"], ['wasnt', "wasn't"], ['hasnt', "hasn't"],
        ['im', "I'm"], ['ive', "I've"],
        ['youre', "you're"], ['theyre', "they're"], ['thier', 'their'],
        ['becuase', 'because'], ['becasue', 'because'],
        ['beacuse', 'because'], ['becouse', 'because'],
      ]);

      // Inject the speech bridge into the main world (avoids extension network restrictions)
      this._injectSpeechBridge();

      // Listen for speech events from the main-world bridge
      window.addEventListener('message', (e) => {
        if (!e.data || e.data.type !== 'NEXUS_SPEECH') return;
        this._handleSpeechEvent(e.data);
      });

      micBtn.addEventListener('click', () => this._toggleSpeech());
    }

    _injectSpeechBridge() {
      if (window.__nexusSpeechBridge) return;
      try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('scripts/speech-bridge.js');
        script.onload = () => script.remove();
        (document.head || document.documentElement).appendChild(script);
      } catch (e) {
        // Extension context may be invalidated
      }
    }

    _toggleSpeech() {
      if (this._isRecording) {
        this._stopSpeech();
      } else {
        this._startSpeech();
      }
    }

    _startSpeech() {
      const textarea = this.root.querySelector('#ai-prompt');
      if (!textarea) return;

      // Snapshot cursor position before we start
      const cursor = textarea.selectionStart;
      this._speechTextBefore = textarea.value.slice(0, cursor);
      this._speechTextAfter = textarea.value.slice(cursor);
      this._speechNeedsSpace = this._speechTextBefore.length > 0
        && !this._speechTextBefore.endsWith(' ')
        && !this._speechTextBefore.endsWith('\n');
      this._speechFinal = '';

      // Send start command to the main-world bridge
      window.postMessage({ type: 'NEXUS_SPEECH_CMD', command: 'start', lang: 'en-US' }, '*');
    }

    _stopSpeech() {
      window.postMessage({ type: 'NEXUS_SPEECH_CMD', command: 'stop' }, '*');
      const micBtn = this.root.querySelector('#mic-btn');
      if (micBtn) micBtn.classList.remove('recording');
      this._isRecording = false;
    }

    _handleSpeechEvent(data) {
      const micBtn = this.root.querySelector('#mic-btn');
      const textarea = this.root.querySelector('#ai-prompt');

      switch (data.event) {
        case 'start':
          this._isRecording = true;
          if (micBtn) micBtn.classList.add('recording');
          this.showToast('Listening...');
          break;

        case 'result': {
          if (!textarea) break;
          const finalPart = data.final || '';
          const interimPart = data.interim || '';
          this._speechFinal += finalPart;

          const correctedFinal = this._autoCorrect(this._speechFinal);
          const display = correctedFinal + interimPart;
          const prefix = this._speechNeedsSpace ? ' ' : '';
          textarea.value = this._speechTextBefore + prefix + display + this._speechTextAfter;

          const newPos = this._speechTextBefore.length + prefix.length + display.length;
          textarea.setSelectionRange(newPos, newPos);
          break;
        }

        case 'end': {
          // Final correction pass
          if (textarea && this._speechFinal) {
            const corrected = this._autoCorrect(this._speechFinal);
            const prefix = this._speechNeedsSpace ? ' ' : '';
            textarea.value = this._speechTextBefore + prefix + corrected + this._speechTextAfter;
            const newPos = this._speechTextBefore.length + prefix.length + corrected.length;
            textarea.setSelectionRange(newPos, newPos);
          }

          this._isRecording = false;
          if (micBtn) micBtn.classList.remove('recording');
          this._speechFinal = '';

          // Trigger autocomplete
          if (typeof this._updateGhostText === 'function') {
            requestAnimationFrame(() => this._updateGhostText());
          }
          break;
        }

        case 'error': {
          this._isRecording = false;
          if (micBtn) micBtn.classList.remove('recording');
          this._speechFinal = '';

          const errMap = {
            'not-supported': 'Speech recognition not supported',
            'not-allowed': 'Microphone access denied',
            'no-speech': 'No speech detected — try again',
            'start-failed': 'Failed to start recognition',
            'network': 'Network error — check connection',
          };
          this.showToast(errMap[data.error] || `Speech error: ${data.error}`);
          break;
        }
      }
    }

    _autoCorrect(text) {
      if (!text) return text;

      // Capitalize first letter of sentences
      let result = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

      // Capitalize "I" when standalone
      result = result.replace(/\bi\b/g, 'I');

      // Fix common speech artifacts
      result = result.replace(/\s{2,}/g, ' '); // double spaces
      result = result.replace(/\s([.,!?;:])/g, '$1'); // space before punctuation

      // Apply corrections dictionary word by word
      result = result.replace(/\b\w+\b/g, (word) => {
        const lower = word.toLowerCase();
        const correction = this._corrections.get(lower);
        if (correction) {
          // Preserve original casing pattern
          if (word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
            return correction.charAt(0).toUpperCase() + correction.slice(1);
          }
          if (word === word.toUpperCase()) {
            return correction.toUpperCase();
          }
          return correction;
        }
        return word;
      });

      return result.trim();
    }

    setupObservables() {
      // Pull debug info from the content script on demand
      this.pullDebugInfo = () => {
        try {
          if (!this.isExtensionContextValid()) return;
          chrome.runtime.sendMessage({ action: 'getDebugInfo' }, async (res) => {
            if (chrome.runtime.lastError) {
              if (this.handleContextInvalidated(chrome.runtime.lastError)) return;
              return;
            }
            if (!res || !res.ok) return;

            // Track console errors for health indicator
            const errors = Array.isArray(res.errors) ? res.errors : [];
            this._lastConsoleErrorCount = errors.filter(e => (e?.type || 'error') === 'error').length;
            this._lastConsoleWarningCount = errors.filter(e => (e?.type || 'error') === 'warning').length;

            const reqs = Array.isArray(res.network) ? res.network : [];
            if (this.lastReqCount !== reqs.length) {
              this.lastReqCount = reqs.length;
              this.networkEntries = reqs;
              this.updateNetworkList(this.networkEntries, this.networkSearchText);
              try {
                await Storage.mergeRecentNetworkRequests(reqs);
              } catch (e) {
                this.handleContextInvalidated(e);
              }
            } else {
              // Still update health even if network count didn't change (console errors may have)
              this.updateHealthIndicator(reqs);
            }
          });
        } catch (e) {
          this.handleContextInvalidated(e);
        }
      };

      // Initial pull
      this.pullDebugInfo();

      // Event-driven: listen for networkDataUpdated from the content script
      // instead of aggressive polling. Falls back to a slow poll (10s) as safety net.
      this.networkUpdateListener = (msg) => {
        if (msg.action === 'networkDataUpdated') {
          this.pullDebugInfo();
        }
      };
      chrome.runtime.onMessage.addListener(this.networkUpdateListener);

      // Safety-net poll at a relaxed interval (every 10s) in case events are missed
      this.debugPollTimer = setInterval(() => this.pullDebugInfo(), 10000);

      // Load saved history immediately (useful before new requests arrive)
      Storage.getRecentNetworkRequests()
        .then((history) => {
          if (Array.isArray(history) && history.length) {
            this.networkEntries = history;
            this.updateNetworkList(this.networkEntries, this.networkSearchText);
          }
        })
        .catch((e) => {
          this.handleContextInvalidated(e);
        });

      // Listen for storage changes (Recent Routes)
      this.storageChangeListener = (changes, area) => {
        if (area === 'local' && changes.recentRoutes) {
          this.updateRecentList();
        }
      };
      chrome.storage.onChanged.addListener(this.storageChangeListener);

      // Initial load
      this.updateRecentList();
    }

    async updateRecentList(filterText = '') {
      const lists = Array.from(this.root.querySelectorAll('#recent-list'));
      if (!lists.length) return;

      let routes = [];
      try {
        routes = await Storage.getRecentRoutes();
      } catch (e) {
        this.handleContextInvalidated(e);
        return;
      }

      if (filterText) {
        const lower = filterText.toLowerCase();
        routes = routes.filter(r => r.route.toLowerCase().includes(lower) || r.title.toLowerCase().includes(lower));
      }

      if (routes.length === 0) {
        lists.forEach(list => {
          list.innerHTML = `<div class="nx-list-item" style="justify-content:center; opacity:0.5;">${filterText ? 'No matches' : 'No recent routes'}</div>`;
        });
        return;
      }

      const html = routes.map(r => `
        <div class="nx-list-item" style="cursor:default;">
           <div style="flex:1; overflow:hidden;">
              <div style="font-weight:500; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.title}">${r.title || 'Untitled'}</div>
              <div style="font-size:10px; color:hsl(var(--nx-muted-fg)); font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${r.route}">${r.route}</div>
           </div>
           <button class="nx-btn-icon" data-action="copy-recent-route" data-route="${r.route}" title="Copy Path" style="width:24px; height:24px; margin-left:8px;">
              ${this.icons.copy}
           </button>
        </div>
      `).join('');

      lists.forEach(list => {
        list.innerHTML = html;

        // Attach listeners
        list.querySelectorAll('[data-action="copy-recent-route"]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(btn.dataset.route);
            this.showToast('Route copied');
          });
        });
      });
    }

    getPromptTokenInfo() {
      const prompt = this.root.querySelector('#ai-prompt');
      if (!prompt) return null;
      const cursor = prompt.selectionStart ?? prompt.value.length;
      const head = prompt.value.slice(0, cursor);
      const match = head.match(/([/@])([^\s]*)$/);
      if (!match) return null;
      return {
        trigger: match[1],
        query: (match[2] || '').toLowerCase(),
        start: match.index,
        end: cursor
      };
    }

    async handlePromptInput() {
      const token = this.getPromptTokenInfo();
      if (!token) {
        this.hidePromptSuggestions();
        return;
      }

      try {
        const suggestions = await this.getPromptSuggestions(token.trigger, token.query);
        if (!suggestions.length) {
          this.hidePromptSuggestions();
          return;
        }

        this.promptTokenInfo = token;
        this.promptSuggestions = suggestions;
        this.promptSuggestionIndex = 0;
        this.renderPromptSuggestions();
      } catch (e) {
        this.hidePromptSuggestions();
      }
    }

    async getPromptSuggestions(trigger, query) {
      if (trigger === '/') {
        const routes = await Storage.getRecentRoutes();
        const currentRoute = window.location.pathname + window.location.search;
        const routeSuggestions = routes
          .filter(r => !query || r.route.toLowerCase().includes(query) || (r.title || '').toLowerCase().includes(query))
          .slice(0, 8)
          .map(r => ({
            type: 'route',
            tag: 'route',
            title: r.title || r.route,
            sub: r.route,
            insertText: `[Route: ${r.route}] `
          }));
        const shouldAddCurrent = currentRoute
          && (!query || currentRoute.toLowerCase().includes(query));
        const hasCurrent = routeSuggestions.some(s => s.sub === currentRoute);
        if (shouldAddCurrent && !hasCurrent) {
          routeSuggestions.unshift({
            type: 'route',
            tag: 'route',
            title: 'Current route',
            sub: currentRoute,
            insertText: `[Route: ${currentRoute}] `
          });
        }
        return routeSuggestions;
      }

      if (trigger === '@') {
        const mappings = await Storage.getProjectMappings();
        const mapEntries = Object.entries(mappings);
        const projectSuggestions = mapEntries.map(([key, p]) => {
          const alias = this.getProjectAlias(p);
          return {
            type: 'project',
            tag: 'project',
            title: p.name || alias || key,
            sub: `${alias}/  •  ${p.path}`,
            insertText: `[Folder: ${alias}/] `
          };
        });

        const currentProject = await Storage.getProjectForUrl(window.location.href);
        const routes = await Storage.getRecentRoutes();
        const allIndexes = await Storage.getProjectFileIndexes();
        const lastPicked = await Storage.getLastPickedProjectIndex();
        const currentRouteFile = await this.resolveCurrentRouteFile();

        const indexedFolderSuggestions = [];
        const indexedFileSuggestions = [];

        Object.entries(allIndexes || {}).forEach(([projectPath, data]) => {
          const alias = this.getProjectAlias({ path: projectPath, name: projectPath.split('/').filter(Boolean).pop() });
          const isCurrentProject = !!(currentProject?.path && currentProject.path === projectPath);

          (data?.folders || []).forEach(folder => {
            const shortPath = `${alias}/${folder}`;
            indexedFolderSuggestions.push({
              type: 'folder',
              tag: 'folder',
              title: shortPath,
              sub: `${shortPath}  •  ${projectPath}`,
              insertText: `[Folder: ${shortPath}] `,
              isCurrentProject
            });
          });

          (data?.files || []).forEach(file => {
            const shortPath = `${alias}/${file}`;
            indexedFileSuggestions.push({
              type: 'file',
              tag: 'file',
              title: shortPath,
              sub: `${shortPath}  •  ${projectPath}`,
              insertText: `[File: ${shortPath}] `,
              isCurrentProject
            });
          });
        });

        const pendingAlias = this.pendingProjectAlias || 'selected-project';
        if (this.pendingProjectIndex?.files?.length || this.pendingProjectIndex?.folders?.length) {
          (this.pendingProjectIndex.folders || []).forEach(folder => {
            const shortPath = `${pendingAlias}/${folder}`;
            indexedFolderSuggestions.push({
              type: 'folder',
              tag: 'folder',
              title: shortPath,
              sub: `${shortPath}  •  selected now`,
              insertText: `[Folder: ${shortPath}] `,
              isCurrentProject: true
            });
          });

          (this.pendingProjectIndex.files || []).forEach(file => {
            const shortPath = `${pendingAlias}/${file}`;
            indexedFileSuggestions.push({
              type: 'file',
              tag: 'file',
              title: shortPath,
              sub: `${shortPath}  •  selected now`,
              insertText: `[File: ${shortPath}] `,
              isCurrentProject: true
            });
          });
        } else if (lastPicked?.files?.length || lastPicked?.folders?.length) {
          const lastAlias = this.getProjectAlias({ name: lastPicked.alias, path: lastPicked.sourcePath || '' });
          (lastPicked.folders || []).forEach(folder => {
            const shortPath = `${lastAlias}/${folder}`;
            indexedFolderSuggestions.push({
              type: 'folder',
              tag: 'folder',
              title: shortPath,
              sub: `${shortPath}  •  last picked`,
              insertText: `[Folder: ${shortPath}] `,
              isCurrentProject: true
            });
          });

          (lastPicked.files || []).forEach(file => {
            const shortPath = `${lastAlias}/${file}`;
            indexedFileSuggestions.push({
              type: 'file',
              tag: 'file',
              title: shortPath,
              sub: `${shortPath}  •  last picked`,
              insertText: `[File: ${shortPath}] `,
              isCurrentProject: true
            });
          });
        }

        const projectAlias = this.getProjectAlias(currentProject);

        const fileSuggestions = currentProject?.path
          ? routes.slice(0, 12).map(r => {
            const cleanRoute = (r.route || '/').replace(/[?#].*$/, '');
            const normalized = cleanRoute === '/' ? 'page' : cleanRoute.replace(/^\/+/, '');
            const fileRelative = /\.[a-z0-9]+$/i.test(normalized) ? normalized : `${normalized}.tsx`;
            const shortPath = `${projectAlias}/${fileRelative}`;
            const fullPath = `${currentProject.path.replace(/\/$/, '')}/${fileRelative}`;
            return {
              type: 'file',
              tag: 'file',
              title: shortPath,
              sub: `${shortPath}  •  ${fullPath}`,
              insertText: `[File: ${shortPath}] `,
              isCurrentProject: true
            };
          })
          : [];

        const specialSuggestions = [];
        if (currentProject?.path) {
          const alias = this.getProjectAlias(currentProject);
          specialSuggestions.push({
            type: 'folder',
            tag: 'folder',
            title: `${alias}/`,
            sub: `${alias}/  •  ${currentProject.path}`,
            insertText: `[Folder: ${alias}/] `,
            isCurrentProject: true
          });
        }
        if (currentRouteFile?.shortPath) {
          specialSuggestions.push({
            type: 'file',
            tag: 'file',
            title: currentRouteFile.shortPath,
            sub: currentRouteFile.fullPath || 'current route file',
            insertText: `[File: ${currentRouteFile.shortPath}] `,
            isCurrentProject: true
          });
        }

        const combined = [
          ...specialSuggestions,
          ...indexedFolderSuggestions,
          ...indexedFileSuggestions,
          ...projectSuggestions,
          ...fileSuggestions
        ];

        const unique = [];
        const seen = new Set();
        for (const item of combined) {
          const key = `${item.tag}|${item.title}`;
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(item);
        }

        const ranked = unique
          .map(s => ({
            item: s,
            score: this.getSuggestionScore(s, query)
          }))
          .filter(entry => !query || entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(entry => entry.item);

        return ranked.slice(0, 8);
      }

      return [];
    }

    getProjectAlias(project) {
      if (!project) return 'project';
      const p = project.path || '';
      const fromPath = p.split('/').filter(Boolean).pop() || '';
      const raw = fromPath || (project.name && typeof project.name === 'string' ? project.name : 'project');
      return raw
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9._-]/g, '') || 'project';
    }

    getSuggestionScore(suggestion, query) {
      if (!query) {
        if (suggestion.tag === 'file') return 30;
        if (suggestion.tag === 'folder') return 20;
        return 10;
      }

      const q = query.toLowerCase();
      const title = String(suggestion.title || '').toLowerCase();
      const sub = String(suggestion.sub || '').toLowerCase();
      const full = `${title} ${sub}`;

      let score = 0;

      if (title.includes(q)) score = Math.max(score, 40);
      if (sub.includes(q)) score = Math.max(score, 30);

      const basename = title.split('/').pop() || title;
      if (basename.startsWith(q)) score = Math.max(score, 80);
      else if (basename.includes(q)) score = Math.max(score, 60);

      const compact = full.replace(/[^a-z0-9]/g, '');
      const compactQ = q.replace(/[^a-z0-9]/g, '');
      if (compactQ && compact.includes(compactQ)) score = Math.max(score, 25);

      if (score > 0) {
        if (suggestion.tag === 'file') score += 10;
        else if (suggestion.tag === 'folder') score += 5;
        if (suggestion.isCurrentProject) score += 12;
      }

      return score;
    }

    renderPromptSuggestions() {
      const menu = this.root.querySelector('#prompt-suggest-menu');
      if (!menu || !this.promptSuggestions.length) {
        this.hidePromptSuggestions();
        return;
      }

      menu.innerHTML = this.promptSuggestions.map((s, idx) => `
        <div class="nx-suggest-item ${idx === this.promptSuggestionIndex ? 'active' : ''}" data-index="${idx}">
          <div class="nx-suggest-main">
            <div class="nx-suggest-title">${this.escapeHtml(s.title)}</div>
            <div class="nx-suggest-sub">${this.escapeHtml(s.sub)}</div>
          </div>
          <span class="nx-suggest-tag">${this.escapeHtml(s.tag)}</span>
        </div>
      `).join('');

      menu.classList.add('active');
      menu.querySelectorAll('.nx-suggest-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = Number(item.dataset.index || 0);
          this.selectPromptSuggestion(idx);
        });
      });
    }

    handlePromptKeydown(e) {
      const menu = this.root.querySelector('#prompt-suggest-menu');
      const isOpen = !!menu && menu.classList.contains('active');
      if (!isOpen || !this.promptSuggestions.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.promptSuggestionIndex = (this.promptSuggestionIndex + 1) % this.promptSuggestions.length;
        this.renderPromptSuggestions();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.promptSuggestionIndex = (this.promptSuggestionIndex - 1 + this.promptSuggestions.length) % this.promptSuggestions.length;
        this.renderPromptSuggestions();
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        this.selectPromptSuggestion(this.promptSuggestionIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hidePromptSuggestions();
      }
    }

    selectPromptSuggestion(index) {
      const item = this.promptSuggestions[index];
      const token = this.promptTokenInfo;
      const prompt = this.root.querySelector('#ai-prompt');
      if (!item || !token || !prompt) return;

      const before = prompt.value.slice(0, token.start);
      const after = prompt.value.slice(token.end);
      prompt.value = `${before}${item.insertText}${after}`;

      const newCursor = before.length + item.insertText.length;
      prompt.focus();
      prompt.setSelectionRange(newCursor, newCursor);
      this.hidePromptSuggestions();
    }

    hidePromptSuggestions() {
      const menu = this.root.querySelector('#prompt-suggest-menu');
      if (!menu) return;
      menu.classList.remove('active');
      menu.innerHTML = '';
      this.promptSuggestions = [];
      this.promptSuggestionIndex = 0;
      this.promptTokenInfo = null;
    }

    escapeHtml(text) {
      if (typeof text !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    updateNetworkList(reqs, filterText = '') {
      const list = this.root.querySelector('#network-list');
      if (!list) return;

      const items = Array.isArray(reqs) ? reqs : [];
      const filtered = !filterText
        ? items
        : items.filter(r => {
          const method = String(r.method || '').toLowerCase();
          const status = String(r.status || '').toLowerCase();
          const url = String(r.url || '').toLowerCase();
          const path = String(r.path || '').toLowerCase();
          return method.includes(filterText) || status.includes(filterText) || url.includes(filterText) || path.includes(filterText);
        });

      // Update count badge
      const badge = this.root.querySelector('#network-count-badge');
      if (badge) badge.textContent = String(items.length);

      // Update health indicator
      this.updateHealthIndicator(items);

      if (filtered.length === 0) {
        list.innerHTML = `
          <div class="nx-net-empty">
            <div class="nx-net-empty-icon">${filterText ? '🔍' : '📡'}</div>
            <div class="nx-net-empty-text">${filterText ? 'No matching requests' : 'Listening for requests...'}</div>
          </div>`;
        return;
      }

      const escHtml = (s) => {
        if (typeof s !== 'string') return '';
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      };

      const html = filtered.slice(0, 50).map((r, idx) => {
        const isError = r.status >= 400 || r.error || r.status === 0;
        const statusClass = isError ? 'err' : 'ok';
        const errorBorder = isError ? ' error' : '';
        let path = r.path || r.url || '';
        try { path = new URL(r.url, window.location.origin).pathname; } catch (_) { }
        const methodLower = String(r.method || 'get').toLowerCase();
        const duration = r.duration ? `${r.duration}ms` : '';
        const statusLabel = r.error ? 'ERR' : (r.status || '—');

        return `
          <div class="nx-net-item${errorBorder}" data-idx="${idx}">
            <div class="nx-net-summary">
              <span class="nx-net-method ${methodLower}">${escHtml(r.method || 'GET')}</span>
              <span class="nx-net-path" title="${escHtml(r.url)}">${escHtml(path)}</span>
              <div class="nx-net-meta">
                ${duration ? `<span class="nx-net-duration">${duration}</span>` : ''}
                <span class="nx-net-status ${statusClass}">${statusLabel}</span>
              </div>
            </div>
            <div class="nx-net-detail">
              <div class="nx-net-detail-row"><span class="label">URL</span><span class="value">${escHtml(r.url)}</span></div>
              <div class="nx-net-detail-row"><span class="label">Method</span><span class="value">${escHtml(r.method || 'GET')}</span></div>
              <div class="nx-net-detail-row"><span class="label">Status</span><span class="value">${r.status || 'N/A'} ${escHtml(r.statusText || '')}</span></div>
              ${r.duration ? `<div class="nx-net-detail-row"><span class="label">Duration</span><span class="value">${r.duration}ms</span></div>` : ''}
              ${r.error ? `<div class="nx-net-detail-row"><span class="label">Error</span><span class="value" style="color:hsl(0 84% 60%);">${escHtml(r.error)}</span></div>` : ''}
              <div class="nx-net-actions">
                <button class="nx-net-copy-btn" data-copy="request" data-idx="${idx}">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Request
                </button>
                <button class="nx-net-copy-btn" data-copy="response" data-idx="${idx}">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Response
                </button>
                <button class="nx-net-copy-btn" data-copy="both" data-idx="${idx}">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Full
                </button>
                <button class="nx-net-copy-btn" data-copy="curl" data-idx="${idx}">⌘ cURL</button>
              </div>
            </div>
          </div>`;
      }).join('');

      list.innerHTML = html;

      // Wire up expand/collapse on summary click
      list.querySelectorAll('.nx-net-summary').forEach(el => {
        el.addEventListener('click', () => {
          const item = el.closest('.nx-net-item');
          item.classList.toggle('expanded');
        });
      });

      // Wire up copy buttons
      list.querySelectorAll('.nx-net-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx);
          const req = filtered[idx];
          if (!req) return;
          const copyType = btn.dataset.copy;
          this.copyNetworkItem(req, copyType);
        });
      });
    }

    copyNetworkItem(req, type) {
      const method = (req.method || 'GET').toUpperCase();
      const url = req.url || 'unknown';
      let text = '';

      if (type === 'request') {
        text = [
          `${method} ${url}`,
          `Type: ${req.type || 'fetch'}`,
          req.requestHeaders ? `Headers: ${JSON.stringify(req.requestHeaders, null, 2)}` : '',
          req.requestBody ? `Body: ${req.requestBody}` : '',
        ].filter(Boolean).join('\n');
      } else if (type === 'response') {
        text = [
          `Status: ${req.status || 'N/A'} ${req.statusText || ''}`,
          `Duration: ${req.duration || '?'}ms`,
          req.error ? `Error: ${req.error}` : '',
          req.responseHeaders ? `Headers: ${typeof req.responseHeaders === 'string' ? req.responseHeaders : JSON.stringify(req.responseHeaders, null, 2)}` : '',
          req.responseBody ? `Body:\n${req.responseBody}` : '',
        ].filter(Boolean).join('\n');
      } else if (type === 'both') {
        text = [
          `── Request ──`,
          `${method} ${url}`,
          `Type: ${req.type || 'fetch'}`,
          req.requestHeaders ? `Request Headers: ${JSON.stringify(req.requestHeaders, null, 2)}` : '',
          req.requestBody ? `Request Body: ${req.requestBody}` : '',
          '',
          `── Response ──`,
          `Status: ${req.status || 'N/A'} ${req.statusText || ''}`,
          `Duration: ${req.duration || '?'}ms`,
          req.error ? `Error: ${req.error}` : '',
          req.responseHeaders ? `Response Headers: ${typeof req.responseHeaders === 'string' ? req.responseHeaders : JSON.stringify(req.responseHeaders, null, 2)}` : '',
          req.responseBody ? `Response Body:\n${req.responseBody}` : '',
        ].filter(Boolean).join('\n');
      } else if (type === 'curl') {
        text = `curl -X ${method} "${url}"`;
        if (req.requestHeaders) {
          const headers = Array.isArray(req.requestHeaders) ? req.requestHeaders : Object.entries(req.requestHeaders || {});
          headers.forEach(([k, v]) => { text += ` \\\n  -H "${k}: ${v}"`; });
        }
        if (req.requestBody) {
          text += ` \\\n  -d '${String(req.requestBody).replace(/'/g, "\\'")}'`;
        }
      }

      navigator.clipboard.writeText(text).then(() => {
        const labels = { request: 'Request', response: 'Response', both: 'Full details', curl: 'cURL' };
        this.showToast(`${labels[type] || 'Copied'} copied`);
      }).catch(() => this.showToast('Copy failed'));
    }

    updateHealthIndicator(networkReqs) {
      const indicator = this.root.querySelector('#health-indicator');
      const label = this.root.querySelector('#health-label');
      const errorsEl = this.root.querySelector('#health-errors');
      const warningsEl = this.root.querySelector('#health-warnings');
      const requestsEl = this.root.querySelector('#health-requests');
      if (!indicator) return;

      // Count metrics
      const reqs = Array.isArray(networkReqs) ? networkReqs : this.networkEntries || [];
      const totalReqs = reqs.length;
      const failedReqs = reqs.filter(r => r.status >= 400 || r.error || r.status === 0).length;
      const warningReqs = reqs.filter(r => r.status >= 300 && r.status < 400).length;

      // Console errors/warnings from debug info (captured via pullDebugInfo)
      const consoleErrors = this._lastConsoleErrorCount || 0;
      const consoleWarnings = this._lastConsoleWarningCount || 0;

      const errorCount = failedReqs + consoleErrors;
      const warningCount = warningReqs + consoleWarnings;

      // Update stat numbers
      if (errorsEl) errorsEl.textContent = String(errorCount);
      if (warningsEl) warningsEl.textContent = String(warningCount);
      if (requestsEl) requestsEl.textContent = String(totalReqs);

      // Determine health status
      let status = 'healthy';
      let statusLabel = 'Healthy';

      if (errorCount >= 5 || failedReqs >= 3) {
        status = 'critical';
        statusLabel = `${errorCount} issues`;
      } else if (errorCount > 0 || warningCount > 0) {
        status = 'warning';
        statusLabel = errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : `${warningCount} warn`;
      }

      indicator.setAttribute('data-status', status);
      indicator.title = `Page health: ${statusLabel}\n${failedReqs} failed requests, ${consoleErrors} console errors`;
      if (label) label.textContent = statusLabel;

      // Update minimized & peek health dots
      const miniDot = this.root.querySelector('#mini-health-dot');
      const peekDot = this.root.querySelector('#peek-health-dot');
      [miniDot, peekDot].forEach(dot => {
        if (!dot) return;
        const dotColors = { healthy: 'hsl(142 76% 36%)', warning: 'hsl(38 92% 50%)', critical: 'hsl(0 84% 60%)' };
        dot.style.background = dotColors[status] || dotColors.healthy;
        if (status === 'critical') {
          dot.style.animation = 'pulse-dot 1.5s ease-in-out infinite';
        } else {
          dot.style.animation = 'none';
        }
      });
    }

    runMagicDetect() {
      this.showToast('Scanning React tree...');

      // Listen for response
      const listener = (event) => {
        if (event.data && event.data.type === 'NEXUS_DETECT_PATH_RESULT') {
          window.removeEventListener('message', listener);
          if (event.data.path) {
            this.root.querySelector('#setting-project-path').value = event.data.path;
            this.showToast('Path detected! ✨');
          } else if (event.data.error === 'PROD_MODE') {
            this.showToast('Failed: Production Build? (Dev required)');
          } else {
            this.showToast('Could not detect path. Check Console.');
          }
        }
      };
      window.addEventListener('message', listener);

      // Inject script to run in main world via src (CSP compliant)
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('scripts/detect-path.js');
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    }
  }

  // Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NexusWidget());
  } else {
    new NexusWidget();
  }

  // Global Key & Message Listeners — use the widget instance's toggle() method
  // to keep internal state consistent and play animations.
  let _widgetInstance = null;

  // Capture the widget instance when it's created
  const _origInit = NexusWidget.prototype.init;
  NexusWidget.prototype.init = async function () {
    _widgetInstance = this;
    return _origInit.call(this);
  };

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      if (_widgetInstance) {
        const isVisible = _widgetInstance.container.style.display !== 'none';
        _widgetInstance.toggle(!isVisible);
      }
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'toggleWidget') {
      if (_widgetInstance) {
        const isVisible = _widgetInstance.container.style.display !== 'none';
        _widgetInstance.toggle(!isVisible);
        sendResponse({ ok: true, visible: !isVisible });
      }
    }
  });

})();
