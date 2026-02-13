# Nexus Helper

> AI-powered context capture for Cursor, Antigravity, VS Code, Windsurf & Zed. Routes, screenshots, debug info, smart prompts, API docs integration, and rich contextual awareness -- all from a floating widget in your browser.

![Version](https://img.shields.io/badge/version-3.3.0-blueviolet)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green)
![Manifest](https://img.shields.io/badge/manifest-v3-blue)

---

## What is Nexus Helper?

Nexus Helper is a Chrome extension built for developers who use AI-assisted code editors. It lives as a floating, draggable widget on any web page and captures rich, structured context about the page you're working on -- then copies it to your clipboard in a format optimized for AI models.

Instead of manually describing what you see, what's broken, or what route you're on, Nexus Helper does it in one click.

---

## Key Features

### Floating Widget
- **Draggable & resizable** -- position it anywhere on the page
- **3 states** -- collapsed (logo capsule), expanded, and maximized
- **Minimized capsule** -- Nexus logo + breathing health dot, expands to a sleek action bar on hover with screenshot, copy route, copy context, open editor, expand, and close buttons
- **Peek mode** -- compact when idle, expands on hover/interaction
- **Remembers position** -- restores exactly where you left it
- **Keyboard toggle** -- `Alt+N` to show/hide

### Header Bar
- **User avatar** -- shows initials when signed in, click for dropdown menu
- **User dropdown** -- My API Docs, Manage Docs (opens NexusDocer), Account Settings, Sign Out
- **Info button** -- opens the Nexus Helper landing page (nexushelper.web.app)
- **Settings, theme toggle, minimize, maximize, close** controls

### AI Context Engine
The core feature. Nexus Helper generates structured, XML-tagged context optimized for AI consumption:

| Context Section | Description |
|---|---|
| **Task** | Your prompt / what you want the AI to do |
| **Framework Info** | Auto-detected stack (Next.js, Nuxt, Vite), React/Vue version, TypeScript, environment |
| **Page Location** | Current route, title, query params, hash |
| **Route Params** | Parsed URL segments, dynamic params, query strings |
| **Related Files** | Auto-detected source files for the current route (page, layout, components) |
| **Layout Chain** | Root layout -> nested layouts -> page hierarchy |
| **Component Tree** | React/Vue component hierarchy with prop keys |
| **UI State** | Active forms, modals, tabs, loading spinners, disabled elements |
| **Errors** | Structured console errors with stack traces and component boundaries |
| **Data Fetching** | Pending, completed, and failed API requests with timing |
| **API Response Shapes** | JSON structure descriptions of successful API responses |
| **API Reference** | Attached API documentation (endpoints, folders, collections) with full request/response details |
| **Accessibility Tree** | ARIA landmarks, semantic elements, interactive states, live regions |
| **Viewport Info** | Device type, dimensions, orientation, dark mode, reduced motion |
| **Performance Hints** | Core Web Vitals, slow requests, DOM complexity, memory usage |
| **DOM Snapshot** | Compact visible UI structure |

### Context Presets
One-click profiles to toggle groups of context sections:

- **Auto** -- detects intent from your prompt and picks the right context
- **Bug Fix** -- errors, network, API shapes, data fetching, components
- **UI** -- DOM, viewport, components, layout chain, UI state
- **Full** -- everything enabled
- **Minimal** -- just route, prompt, files, and framework

### Intent Auto-Detection
As you type your prompt, Nexus Helper analyzes keywords and:
1. Highlights the matching preset (Bug Fix, UI, etc.) in the toolbar
2. Shows a floating **intent badge** inside the editor (color-coded)
3. Pressing the **dismiss button** (X) reverts to Minimal; re-type and it re-detects

Supported intents: Bug Fix, UI/Style, Performance, Data/API, Accessibility, Routing, Form/UI, Implement.

### API Docs Integration
Nexus Helper integrates with **NexusDocer** (Firebase-powered API documentation platform):

- **Firebase Auth** -- sign in with email/password or Google
- **API Docs browser** -- view your published API collections, folders, and endpoints
- **Attach API docs to context** -- search and attach endpoints, folders, or whole collections from the editor toolbar
- **Smart API auto-suggest** -- type "implement login" or "integrate payment" and matching API endpoints appear automatically as suggestions
- **Full API content in context** -- attached docs include method, URL, headers, body schema, query params, path variables, auth type, and response examples with shape analysis
- **Manage Docs** -- quick link to NexusDocer web app from the user dropdown

### Default Editor & Auto-Copy
- **Settings panel** lets you choose your default editor: Cursor, Antigravity, VS Code, Windsurf, or Zed
- **Auto-copy context** -- when you click "Open Editor", context is automatically copied to your clipboard before the editor opens, ready to paste

### Context Token Counter
Real-time estimated token count of the generated context, with visual warnings:
- Green: normal
- Yellow: >2,000 tokens
- Red: >4,000 tokens

### Quick Capture
- **Copy Route** -- current pathname
- **Copy Screenshot** -- visible tab as PNG
- **Copy Context** -- full AI-optimized context
- **Open Editor** -- opens your configured editor with the project
- **Clear button** -- clears prompt text, all attached API items, and resets everything

### Debug Panel
- Real-time error and network monitoring
- Network request search and filtering
- Health indicator (green = no errors, red = errors detected)

### Project Indexing
- **Auto-detect project path** from React fiber `_debugSource`
- **Manual project path** configuration
- **File index** with extension filtering
- Route-to-file resolution for the current page

### Additional Features
- **Clipboard history** -- last 10 copied items
- **Recent routes** -- tracked automatically
- **Speech-to-text** -- voice input for prompts
- **Autocomplete** -- `/` for routes, `@` for project files
- **Ghost text** -- inline suggestions while typing
- **Export/Import settings** -- backup and restore configuration

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nexus-Helper.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `Nexus-Helper` folder
6. The widget appears automatically on any web page

---

## Quick Start

1. Open any web page (localhost, staging, production)
2. The floating widget appears as a **Nexus logo capsule** with a breathing health dot
3. **Hover** to expand the quick-action bar, or press `Alt+N` to toggle the full widget
4. Type your prompt in the editor
5. Click **Copy Context** -- structured AI context is on your clipboard
6. Paste into your AI editor (Cursor, Antigravity, etc.)

### Setting Up Your Project

1. Click the **Settings** tab (gear icon)
2. Set your **project path** (e.g., `/Users/you/projects/my-app`)
3. Choose your **default editor** from the dropdown
4. Enable/disable **auto-copy context** when opening the editor
5. Click **Save Configuration**

### Using Context Presets

1. Open the **context options** panel (gear icon in the editor toolbar)
2. Click a preset: Auto, Bug Fix, UI, Full, or Minimal
3. Or just type -- **Auto** mode detects your intent from keywords

### Attaching API Docs

1. **Sign in** via the user avatar in the header (or Settings > Account)
2. Click the **book icon** in the editor toolbar to open the API docs panel
3. **Search** for endpoints, folders, or collections
4. **Click** to attach -- items appear as chips below the prompt
5. Or just type "implement login" and matching endpoints auto-suggest
6. Attached API docs are included as full documentation in the AI context

---

## Project Structure

```
Nexus-Helper/
├── manifest.json                  # Chrome Extension manifest (MV3)
├── icons/                         # Extension icons (PNG + SVG source)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                         # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── scripts/
│   ├── background.js              # Service worker (screenshots, editor, Firebase auth & Firestore)
│   ├── content.js                 # Page monitoring (errors, network, performance)
│   ├── floating-widget.js         # Main widget (UI, context engine, API docs, all features)
│   ├── firebase-config.js         # Firebase project configuration
│   ├── storage.js                 # Chrome storage utilities
│   ├── detect-path.js             # React fiber project path detection
│   ├── main-world-network.js      # Main-world fetch/XHR interceptor
│   └── speech-bridge.js           # Main-world speech recognition bridge
├── DOCS.md                        # Full technical documentation
└── README.md                      # This file
```

---

## Permissions

| Permission | Purpose |
|---|---|
| `activeTab` | Access current tab URL and capture screenshots |
| `clipboardWrite` | Copy text and images to clipboard |
| `storage` | Persist settings, routes, clipboard history |
| `tabs` | Query tab information |
| `scripting` | Inject content scripts |
| `webNavigation` | Track SPA navigation for route history |
| `identity` | Google Sign-in for Firebase authentication |
| `<all_urls>` | Monitor pages for debugging on any URL |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+N` | Toggle widget visibility |
| `Tab` | Accept ghost text autocomplete |
| `/` | Trigger route autocomplete |
| `@` | Trigger file autocomplete |
| `Esc` | Close suggestion menu / minimize widget |

---

## Development

### Loading Changes
1. Edit any file in the project
2. Go to `chrome://extensions/`
3. Click the refresh icon on Nexus Helper
4. Reload the target web page

### Debugging
- **Widget**: Right-click page -> Inspect -> look for the shadow DOM under `#nexus-widget-root`
- **Background**: Extension details page -> "service worker" link
- **Content script**: Standard DevTools Console (look for `[Nexus Helper]` prefix)

---

## Changelog

### v3.3.0 -- API Docs Integration & Minimized Redesign
- Firebase Auth integration (email/password + Google Sign-in)
- API Docs browser -- view published collections from NexusDocer
- API Docs attach panel -- search and attach endpoints, folders, or whole collections to AI context
- Smart API auto-suggest -- "implement login" auto-finds matching API endpoints
- Full API documentation content in context (headers, body, params, response shapes)
- Header user avatar with dropdown menu (API Docs, Manage Docs, Settings, Sign Out)
- Info button linking to nexushelper.web.app
- Manage Docs link to NexusDocer web app
- Redesigned minimized state -- glassmorphic capsule with logo + health dot + action bar
- Clear button to reset prompt, attachments, and intent state
- Chunked Firestore document support with pagination
- Bug fixes for dropdown z-index and transparency

### v3.1.0 -- AI Context Engine & Smart Editor
- Rich 15-section AI context with XML-tagged structure
- Context presets (Auto, Bug Fix, UI, Full, Minimal)
- Intent auto-detection from prompt keywords with floating badge
- Default editor setting (Cursor, Antigravity, VS Code, Windsurf, Zed)
- Auto-copy context when opening editor
- Token counter with visual warnings
- Peek mode (compact-on-idle, expand-on-hover)
- Widget position memory across state changes
- Project file indexing and route-to-file resolution
- Speech-to-text input
- Autocomplete for routes (`/`) and files (`@`)

### v2.0.0 -- Major Redesign
- Tabbed popup interface
- Content script for console/network monitoring
- Clipboard history, recent routes, pinned routes
- Environment switching (local/staging/prod)
- Debug essentials panel
- Cursor-ready prompt templates
- Floating draggable widget

### v1.0.0 -- Initial Release
- Copy current route
- Copy page screenshot

---

## License

MIT License -- free to use, modify, and distribute.

---

Built for developers who move fast with AI-assisted editors.
