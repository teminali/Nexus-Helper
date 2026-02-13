# Nexus Helper -- Technical Documentation

Comprehensive technical reference for the Nexus Helper Chrome extension.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [File Reference](#file-reference)
- [Floating Widget](#floating-widget)
  - [Widget States](#widget-states)
  - [Position Memory](#position-memory)
  - [Peek Mode](#peek-mode)
  - [Drag & Resize](#drag--resize)
- [AI Context Engine](#ai-context-engine)
  - [Context Sections](#context-sections)
  - [Context Output Format](#context-output-format)
  - [Context Presets](#context-presets)
  - [Intent Auto-Detection](#intent-auto-detection)
  - [Intent Badge](#intent-badge)
  - [Token Estimation](#token-estimation)
- [Editor Integration](#editor-integration)
  - [Supported Editors](#supported-editors)
  - [URL Schemes](#url-schemes)
  - [Auto-Copy on Open](#auto-copy-on-open)
- [Project Indexing](#project-indexing)
  - [Path Detection](#path-detection)
  - [File Indexing](#file-indexing)
  - [Route-to-File Resolution](#route-to-file-resolution)
- [Content Script](#content-script)
  - [Error Capture](#error-capture)
  - [Network Interception](#network-interception)
  - [Performance Metrics](#performance-metrics)
- [Storage Schema](#storage-schema)
- [Message Passing](#message-passing)
- [Autocomplete System](#autocomplete-system)
- [Speech Recognition](#speech-recognition)
- [CSS Architecture](#css-architecture)
- [Security Considerations](#security-considerations)

---

## Architecture Overview

Nexus Helper uses Chrome Extension Manifest V3 with the following execution contexts:

```
┌─────────────────────────────────────────────────────────┐
│  Browser Page (any website)                             │
│                                                         │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │  Content Script   │  │  Main World Scripts         │  │
│  │  (content.js)     │  │  (main-world-network.js)    │  │
│  │  - Error capture  │  │  - fetch/XHR interception   │  │
│  │  - Network relay  │  │  (speech-bridge.js)         │  │
│  │  - Perf metrics   │  │  - SpeechRecognition API    │  │
│  └──────┬───────────┘  │  (detect-path.js)           │  │
│         │               │  - React fiber path scan    │  │
│         │               └──────────┬──────────────────┘  │
│         │                          │ postMessage          │
│  ┌──────┴──────────────────────────┴──────────────────┐  │
│  │  Floating Widget (floating-widget.js)              │  │
│  │  - Shadow DOM (isolated styles)                    │  │
│  │  - Full UI: editor, tabs, settings, debug          │  │
│  │  - AI context engine (11 context builders)         │  │
│  │  - Autocomplete, speech, presets, intent detect    │  │
│  └──────┬─────────────────────────────────────────────┘  │
│         │ chrome.runtime.sendMessage                     │
└─────────┼────────────────────────────────────────────────┘
          │
┌─────────┴────────────────────────────────────────────────┐
│  Background Service Worker (background.js)               │
│  - Screenshot capture (chrome.tabs.captureVisibleTab)    │
│  - Editor URL scheme generation                          │
│  - Route tracking (webNavigation API)                    │
│  - Message routing between contexts                      │
│  - Tab error caching (session storage)                   │
└──────────────────────────────────────────────────────────┘
```

**Communication flow:**
1. Main-world scripts use `postMessage` to send data to the content script / widget
2. Content script and widget use `chrome.runtime.sendMessage` to talk to the background worker
3. Background worker uses `chrome.tabs.sendMessage` to relay data back to tabs

---

## File Reference

### `manifest.json`
Chrome Extension manifest (v3). Declares permissions, content scripts, background worker, keyboard commands, and web-accessible resources.

### `scripts/floating-widget.js`
The main widget -- a self-contained IIFE (~5700 lines) that:
- Creates a custom element with Shadow DOM for style isolation
- Renders all UI (CSS + HTML) inside the shadow root
- Implements the full AI context engine
- Manages widget state, drag/resize, autocomplete, speech, presets

### `scripts/content.js`
Injected at `document_start` into every page. Captures:
- `console.error` calls (monkey-patched)
- Uncaught errors (`window.onerror`)
- Unhandled promise rejections
- Network requests (via main-world bridge)

### `scripts/background.js`
Service worker that handles:
- Screenshot capture via `chrome.tabs.captureVisibleTab`
- Editor URL scheme generation (cursor://, vscode://, etc.)
- Route tracking via `webNavigation` API
- Message routing between content scripts and popup

### `scripts/main-world-network.js`
Runs in the page's main world (not isolated). Intercepts:
- `window.fetch` -- wraps with timing, status, and error capture
- `XMLHttpRequest` -- wraps `open` and `send` with timing

Sends results via `postMessage` with type `NEXUS_NETWORK_LOG`.

### `scripts/detect-path.js`
Injected into the main world on demand. Scans React fiber tree for `_debugSource.fileName` to auto-detect the project's filesystem path. Works only in development mode.

### `scripts/speech-bridge.js`
Runs in the main world. Bridges the `SpeechRecognition` API (which requires main-world access) to the widget via `postMessage`. Supports start/stop commands and returns interim/final transcripts.

### `scripts/storage.js`
Shared storage utility used by both the background worker and popup. Wraps `chrome.storage.local` for:
- Clipboard history
- Recent routes
- Pinned routes
- Project mappings
- File indexes
- Index preferences
- Editor preferences

### `popup/`
The extension's popup UI (opened from toolbar icon). Provides:
- Quick capture actions (route, URL, title, selection, screenshot)
- Navigation between environments (local/staging/prod)
- Debug panel (errors, network, performance)
- Cursor AI context templates
- Project mapping management

---

## Floating Widget

### Widget States

The widget has three visual states managed by `data-state` attribute:

| State | Description |
|---|---|
| `collapsed` | Minimized -- small circular breathing health dot. Expands on hover to show quick action buttons |
| `expanded` | Standard size -- full editor, tabs, debug panel |
| `bigger` | Maximized -- takes more screen space for detailed work |

State transitions: `collapsed <-> expanded <-> bigger`

### Position Memory

The widget tracks its position through state changes:

- `this.lastPosition` -- continuously updated during drag operations
- `this._positionWhenExpanded` -- saved when leaving expanded state to bigger
- When returning to expanded from bigger: restores `_positionWhenExpanded`
- When returning to expanded from collapsed: restores `lastPosition`
- Position is persisted to `chrome.storage.local` and restored on page load

### Peek Mode

Both expanded and bigger states support "peek mode":

1. Widget shows only a breathing health dot (`.nx-peek-trigger`) when idle
2. On hover (`mouseenter`) or interaction (`focusin`), the full widget body is revealed
3. A `data-pinned` attribute prevents auto-collapse during active interaction
4. `setupPeekPin()` manages the pin state via event listeners

### Drag & Resize

- **Drag**: Initiated on `mousedown` on the header bar or peek trigger
- **Resize**: 8 edge handles (top, bottom, left, right, and 4 corners)
- Both use `mousemove`/`mouseup` on `document` for smooth tracking
- Constrained to viewport bounds

---

## AI Context Engine

### Context Sections

Each section has a dedicated builder method. All return `null`/empty string if no meaningful data is available, and are omitted from output.

| Section | Method | Toggle ID | Description |
|---|---|---|---|
| Task | _(direct)_ | `ctx-include-prompt` | User's prompt text |
| Framework | `buildFrameworkInfo()` | `ctx-include-framework` | Next.js/Nuxt/Vite version, React/Vue version, TypeScript, environment, viewport |
| Page | _(direct)_ | `ctx-include-route` | Route path and title as self-closing XML tag |
| Route Params | `buildRouteParams()` | `ctx-include-route-params` | URL query params, hash, dynamic route segments |
| Selection | _(direct)_ | `ctx-include-selection` | Currently selected text on the page |
| Related Files | `resolveRouteRelatedFiles()` | `ctx-include-files` | Source files matching the current route |
| Layout Chain | `buildLayoutChain()` | `ctx-include-layout-chain` | Nested layout hierarchy for the route |
| Component Tree | `buildComponentTree()` | `ctx-include-components` | React/Vue component hierarchy with props |
| UI State | `buildUIState()` | `ctx-include-ui-state` | Forms, modals, tabs, loading states, disabled elements |
| Errors | `buildStructuredErrors()` | `ctx-include-structured-errors` | Stack traces with source mapping and component boundaries |
| Data Fetching | `buildDataFetchingSummary()` | `ctx-include-data-fetching` | Pending/completed/failed requests with timing |
| API Shapes | `buildAPIShapes()` | `ctx-include-api-shapes` | JSON shape descriptions of successful API responses |
| Accessibility | `buildAccessibilityTree()` | `ctx-include-a11y` | ARIA landmarks, semantic tree, live regions |
| Viewport | `buildViewportInfo()` | `ctx-include-viewport` | Device type, dimensions, media queries, user prefs |
| Performance | `buildPerformanceHints()` | `ctx-include-perf` | Core Web Vitals, slow requests, DOM stats, memory |
| DOM Snapshot | `buildCompactDomSnapshot()` | `ctx-include-dom` | Compact visible UI structure |

### Context Output Format

The output uses XML-like tags for clear structure:

```xml
<task>
Fix the login form validation -- email field accepts invalid formats
</task>

<framework>
Next.js 14.1.0 (App Router)
React 18.2.0
TypeScript: Yes
Environment: development
Viewport: 1440x900
</framework>

<page route="/login" title="Login - MyApp" />

<route_params>
query: ?redirect=/dashboard
</route_params>

<related_files>
  src/app/(auth)/login/page.tsx  (page)
  src/app/(auth)/layout.tsx  (layout)
</related_files>

<errors>
[console.error] TypeError: Cannot read property 'validate' of undefined
  at LoginForm (src/app/(auth)/login/page.tsx:42:15)
  at processChild (react-dom.development.js:1234:5)
  Component: LoginForm > AuthLayout > RootLayout
</errors>

<ui_state>
Forms: 1 (login-form: email[empty], password[empty])
Active modal: none
Loading: false
</ui_state>
```

### Context Presets

Defined in `_contextPresets` object. Each preset maps toggle names to boolean values:

```javascript
_contextPresets = {
  auto: null,  // handled by intent detection
  bug:  { route: true, network: true, console: true, structuredErrors: true, ... },
  ui:   { route: true, dom: true, components: true, viewport: true, ... },
  full: { /* everything true */ },
  minimal: { route: true, prompt: true, files: true, framework: true, /* rest false */ }
}
```

Managed by `applyPreset(name)` which updates checkbox states and button indicators.

### Intent Auto-Detection

Defined in `_intentDefinitions` array. Each intent has:

```javascript
{
  name: 'bug',           // unique identifier
  preset: 'bug',         // linked preset button (or null)
  patterns: [/bug/, /fix/, /error/, ...],  // regex patterns
  enable: ['structuredErrors', 'console', 'network', ...]  // toggles to activate
}
```

**Detection flow:**
1. `detectIntent(promptText)` scores each intent by counting pattern matches
2. Returns `{ intent: 'bug', preset: 'bug' }` or `{ intent: null, preset: 'auto' }`
3. `updateLivePreset()` is called on every keystroke in the prompt
4. Visual feedback: preset button highlighting + intent badge

**Supported intents:** `bug`, `ui`, `performance`, `data`, `a11y`, `routing`, `form`

### Intent Badge

A floating badge inside the editor area showing the detected intent:

- Positioned top-right of the textarea
- Color-coded per intent (red for bug, blue for UI, amber for performance, etc.)
- Shows intent name (e.g., "Bug Fix") with a dismiss button (X)
- **Dismiss behavior**: Switches to Minimal preset, hides badge, stops detection
- **Re-enable**: Any text change after dismissal re-enables auto-detection

### Token Estimation

Uses a simple heuristic: `Math.ceil(text.length / 3.8)` characters per token.

Visual indicators in `#ctx-token-counter`:
- Normal: default color
- `nx-tokens-high` (>2,000 tokens): yellow warning
- `nx-tokens-danger` (>4,000 tokens): red warning

---

## Editor Integration

### Supported Editors

Configured in Settings panel via `#setting-default-editor` dropdown:

| Editor | Value | URL Scheme |
|---|---|---|
| Cursor | `cursor` | `cursor://file/{path}` |
| Antigravity | `antigravity` | `antigravity://open?path={path}` |
| VS Code | `vscode` | `vscode://file/{path}` |
| Windsurf | `windsurf` | `windsurf://file/{path}` |
| Zed | `zed` | `zed://file/{path}` |

### URL Schemes

The background worker generates URL schemes in response to `openInEditor` messages. The scheme is returned to the content script, which creates a hidden iframe with the scheme URL to trigger the OS protocol handler.

### Auto-Copy on Open

When `setting-auto-copy-context` is enabled (default: on):
1. User clicks "Open Editor" button
2. `copyContext({ silent: true })` is called first -- context copied to clipboard
3. Editor URL scheme is triggered
4. Toast shows: `Opening {project} in {editor}... (context copied)`

The user can then immediately paste the context in the editor's AI chat.

---

## Project Indexing

### Path Detection

`detect-path.js` runs in the page's main world and:
1. Scans known root elements (`#__next`, `#root`, `#app`)
2. Looks for React fiber keys (`__reactFiber$`, `__reactInternalInstance$`)
3. Traverses fiber tree upward looking for `_debugSource.fileName`
4. Strips common markers (`/src/`, `/app/`, `/pages/`) to find project root
5. Returns path via `postMessage` (`NEXUS_DETECT_PATH_RESULT`)

Only works in **development mode** (production builds strip `_debugSource`).

### File Indexing

When a project path is set:
1. User can manually enter extensions to index (default: `tsx,ts,jsx,js,json,md`)
2. The widget reads the index from `chrome.storage.local`
3. Files are available for `@` autocomplete and route resolution

### Route-to-File Resolution

`resolveRouteRelatedFiles()` matches the current URL path to indexed project files:

1. Strips framework prefixes (`src/`, `app/`, `pages/`) and route groups (`(auth)`, `(dashboard)`)
2. Compares URL segments against file path segments
3. Dynamic segments (`[id]`, `[slug]`) only match "dynamic-looking" URL values (numbers, UUIDs)
4. Requires exact segment count match
5. Results capped at 8 files
6. Each result includes `shortPath` (relative) and `role` (page, layout, component, etc.)

---

## Content Script

### Error Capture

`content.js` intercepts three error sources:

1. **`console.error`** -- monkey-patched to capture arguments, stack traces, and timestamps
2. **`window.onerror`** -- captures uncaught exceptions with filename, line, and column
3. **`unhandledrejection`** -- captures unhandled promise rejections

Errors are stored in an array (max 20) and forwarded to the background worker.

### Network Interception

Network capture uses a two-script architecture:

1. **`main-world-network.js`** (main world) -- wraps `window.fetch` and `XMLHttpRequest`
2. **`content.js`** (isolated world) -- receives data via `postMessage` bridge

Captured data per request:
- Type (fetch/xhr), URL, method, status, statusText
- Duration (milliseconds)
- Response body (first 1000 chars, for failed requests only)
- Timestamp

Stored in array (max 50), with debounced broadcast notifications.

### Performance Metrics

Available via the content script's `getDebugInfo` handler:
- `loadTime` -- `navigation.loadEventEnd - startTime`
- `domContentLoaded` -- DOMContentLoaded timing
- `firstPaint` -- First paint timing
- `firstContentfulPaint` -- FCP timing
- `lcp` -- Largest Contentful Paint

---

## Storage Schema

All data is stored in `chrome.storage.local`:

| Key | Type | Description |
|---|---|---|
| `clipboardHistory` | `Array<{id, type, content, preview, timestamp, url}>` | Last 10 clipboard items |
| `recentRoutes` | `Array<{route, title, fullUrl, timestamp, visitCount}>` | Last visited routes |
| `pinnedRoutes` | `Array<{route, title, note, timestamp}>` | User-pinned routes |
| `projectMappings` | `Object<host, {path, name}>` | URL-to-project folder mappings |
| `indexPreferences` | `{extensions: string[], updatedAt}` | File index settings |
| `editorPreference` | `{editor: string, autoCopyContext: boolean}` | Default editor config |
| `projectFileIndex_*` | `{files: string[], folders: string[], updatedAt}` | Per-project file index |
| `widgetState` | `{state, position, ...}` | Widget UI state |
| `widgetAutoShow` | `boolean` | Whether widget auto-shows on page load |

---

## Message Passing

### Content Script -> Background

| Action | Data | Response |
|---|---|---|
| `consoleError` | `{error}` | -- |
| `networkDataUpdated` | `{count}` | -- (relayed to widget) |
| `copyScreenshot` | -- | `{ok, dataUrl}` |
| `captureScreenshot` | -- | `{ok, dataUrl, url}` |
| `getDebugInfo` | -- | `{errors, network, performance, url, title}` |
| `getSelectedText` | -- | `{selectedText}` |
| `clearDebugInfo` | -- | `{ok}` |
| `openInEditor` | `{editor, url, title, projectPath}` | `{ok, scheme}` |
| `toggleWidget` | -- | -- |

### Background -> Tab

| Action | Data |
|---|---|
| `networkDataUpdated` | `{count}` |
| `toggleWidget` | -- |

### Main World -> Content (postMessage)

| Type | Payload |
|---|---|
| `NEXUS_NETWORK_LOG` | `{type, url, method, status, duration, ...}` |
| `NEXUS_DETECT_PATH_RESULT` | `{path}` or `{path: null, error}` |
| `NEXUS_SPEECH` | `{event, final?, interim?, error?}` |
| `NEXUS_SPEECH_CMD` | `{command: 'start'|'stop', lang?}` |

---

## Autocomplete System

The widget supports two autocomplete triggers:

### Route Autocomplete (`/`)
- Triggered when user types `/` at the start of input or after a space
- Shows recent routes from `Storage.getRecentRoutes()`
- Fuzzy matched against typed text

### File Autocomplete (`@`)
- Triggered when user types `@`
- Shows indexed project files
- Matched against filename and path
- Inserts the selected file's relative path

### Ghost Text
- As the user types, the widget predicts completion based on recent routes or files
- Shown as semi-transparent overlay text
- Press `Tab` to accept the suggestion

---

## Speech Recognition

Voice input uses the Web Speech API via a main-world bridge:

1. Widget sends `NEXUS_SPEECH_CMD` with `command: 'start'` via `postMessage`
2. `speech-bridge.js` creates a `SpeechRecognition` instance in the main world
3. Interim and final transcripts are sent back via `NEXUS_SPEECH` messages
4. Widget appends transcripts to the prompt textarea
5. Supports continuous recognition with interim results

---

## CSS Architecture

The widget uses Shadow DOM for complete style isolation:

- All styles are injected inside the shadow root
- CSS custom properties (HSL-based) define the color system
- Responsive to light/dark mode via `prefers-color-scheme`
- Key design tokens:

```css
--nx-bg          /* Background */
--nx-fg          /* Foreground text */
--nx-primary     /* Primary accent */
--nx-secondary   /* Secondary surfaces */
--nx-border      /* Border color */
--nx-muted-fg    /* Muted text */
--nx-ring        /* Focus ring */
```

---

## Security Considerations

1. **Shadow DOM isolation** -- Widget styles and DOM don't leak into or from the host page
2. **Event propagation** -- All widget events are stopped from bubbling to the page (`stopPropagation`)
3. **Content Security** -- `detect-path.js` and `main-world-network.js` are declared as `web_accessible_resources`
4. **Extension context** -- Graceful handling of invalidated extension contexts (after updates/reloads)
5. **XSS prevention** -- HTML content in the "Open Folder" helper page is sanitized
6. **Data limits** -- Response bodies capped at 1000 chars, errors capped at 20, network at 50
7. **No remote code** -- All code is local; no external script loading
8. **Clipboard access** -- Only writes to clipboard, never reads

---

## Browser Compatibility

- **Chrome**: 116+ (Manifest V3, `chrome.storage.session`)
- **Edge**: Chromium-based (should work, untested)
- **Firefox**: Not supported (Manifest V3 differences)

---

_Last updated: February 2026 | Nexus Helper v3.1.0_
