// Nexus Helper - Storage Utilities
// Handles clipboard history, recent routes, pinned routes, and notes

const Storage = {
  // Clipboard history (max 10 items)
  async getClipboardHistory() {
    const result = await chrome.storage.local.get(['clipboardHistory']);
    return result.clipboardHistory || [];
  },

  async addToClipboardHistory(item) {
    const history = await this.getClipboardHistory();
    const newItem = {
      id: Date.now(),
      type: item.type, // 'text', 'route', 'url', 'screenshot', 'bundle'
      content: item.content,
      preview: item.preview || item.content.slice(0, 50),
      timestamp: Date.now(),
      url: item.url || ''
    };
    
    // Remove duplicates
    const filtered = history.filter(h => h.content !== item.content);
    filtered.unshift(newItem);
    
    // Keep only last 10
    const trimmed = filtered.slice(0, 10);
    await chrome.storage.local.set({ clipboardHistory: trimmed });
    return trimmed;
  },

  async clearClipboardHistory() {
    await chrome.storage.local.remove(['clipboardHistory']);
  },

  // Recent routes (max 10)
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

  // Pinned routes
  async getPinnedRoutes() {
    const result = await chrome.storage.local.get(['pinnedRoutes']);
    return result.pinnedRoutes || [];
  },

  async pinRoute(route, title = '', note = '') {
    const pinned = await this.getPinnedRoutes();
    if (pinned.some(p => p.route === route)) {
      return pinned; // Already pinned
    }
    
    const newPin = {
      route,
      title: title || route,
      note,
      pinnedAt: Date.now()
    };
    
    pinned.unshift(newPin);
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

  // Route notes (separate from pins for quick notes)
  async getRouteNote(route) {
    const result = await chrome.storage.local.get(['routeNotes']);
    const notes = result.routeNotes || {};
    return notes[route] || '';
  },

  async setRouteNote(route, note) {
    const result = await chrome.storage.local.get(['routeNotes']);
    const notes = result.routeNotes || {};
    if (note) {
      notes[route] = note;
    } else {
      delete notes[route];
    }
    await chrome.storage.local.set({ routeNotes: notes });
  },

  // Environment URLs (for quick navigation)
  async getEnvironments() {
    const result = await chrome.storage.local.get(['environments']);
    return result.environments || {
      local: 'http://localhost:3000',
      staging: '',
      prod: ''
    };
  },

  async setEnvironments(envs) {
    await chrome.storage.local.set({ environments: envs });
  },

  // Console errors (captured by content script)
  async getConsoleErrors(tabId) {
    const result = await chrome.storage.session?.get([`errors_${tabId}`]);
    return result?.[`errors_${tabId}`] || [];
  },

  async addConsoleError(tabId, error) {
    if (!chrome.storage.session) return; // Fallback for older Chrome
    const key = `errors_${tabId}`;
    const result = await chrome.storage.session.get([key]);
    const errors = result[key] || [];
    errors.push({
      ...error,
      timestamp: Date.now()
    });
    // Keep last 20 errors
    const trimmed = errors.slice(-20);
    await chrome.storage.session.set({ [key]: trimmed });
  },

  async clearConsoleErrors(tabId) {
    if (!chrome.storage.session) return;
    await chrome.storage.session.remove([`errors_${tabId}`]);
  }
};

// Project mappings (domain/path → local folder)
const ProjectStorage = {
  async getProjectMappings() {
    const result = await chrome.storage.local.get(['projectMappings']);
    return result.projectMappings || {};
  },

  async addProjectMapping(key, project) {
    const mappings = await this.getProjectMappings();
    mappings[key] = {
      name: project.name,
      path: project.path,
      editor: project.editor || 'cursor', // cursor, vscode, antigravity
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

  // Detect project type from path
  detectProjectType(path) {
    // This would need native messaging or file system access to actually detect
    // For now, return common project indicators
    return {
      isReact: path.includes('react') || path.includes('next'),
      isVue: path.includes('vue') || path.includes('nuxt'),
      isNode: path.includes('node') || path.includes('express'),
    };
  }
};

// Project ↔ API Docs pinning (maps project path → array of pinned doc IDs)
const ProjectApiDocsStorage = {
  async getProjectApiDocs(projectPath) {
    if (!projectPath) return [];
    const result = await chrome.storage.local.get(['projectApiDocs']);
    const map = result.projectApiDocs || {};
    return map[projectPath] || [];
  },

  async setProjectApiDocs(projectPath, docIds) {
    if (!projectPath) return;
    const result = await chrome.storage.local.get(['projectApiDocs']);
    const map = result.projectApiDocs || {};
    map[projectPath] = docIds;
    await chrome.storage.local.set({ projectApiDocs: map });
  },

  async pinApiDocToProject(projectPath, docId) {
    if (!projectPath || !docId) return;
    const docs = await this.getProjectApiDocs(projectPath);
    if (!docs.includes(docId)) {
      docs.push(docId);
      await this.setProjectApiDocs(projectPath, docs);
    }
    return docs;
  },

  async unpinApiDocFromProject(projectPath, docId) {
    if (!projectPath || !docId) return;
    const docs = await this.getProjectApiDocs(projectPath);
    const filtered = docs.filter(id => id !== docId);
    await this.setProjectApiDocs(projectPath, filtered);
    return filtered;
  },

  async isApiDocPinned(projectPath, docId) {
    if (!projectPath || !docId) return false;
    const docs = await this.getProjectApiDocs(projectPath);
    return docs.includes(docId);
  }
};

// Merge into Storage
Object.assign(Storage, ProjectStorage, ProjectApiDocsStorage);

// Export for use in popup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
