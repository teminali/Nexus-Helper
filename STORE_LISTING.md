# Chrome Web Store Listing -- Nexus Helper

> Use this document as a reference when filling in the Chrome Web Store Developer Dashboard.

---

## Extension Name

Nexus Helper -- AI Context Capture

---

## Short Description (132 chars max)

AI-powered context capture for Cursor, VS Code & more. Routes, screenshots, debug info, API docs -- all from a floating widget.

---

## Detailed Description

Nexus Helper is a developer-focused Chrome extension that captures rich, structured context from any web page and formats it for AI-assisted code editors like Cursor, Antigravity, VS Code, Windsurf, and Zed.

A floating, draggable widget lives on every page and generates XML-tagged context optimized for AI models -- including routes, framework detection, component trees, error traces, API response shapes, viewport info, performance hints, and more.

KEY FEATURES:

-- Floating Widget --
Draggable, resizable widget with 3 states (collapsed capsule, expanded, maximized). Sleek glassmorphic minimized state with a breathing health dot. Hover to expand quick-action buttons. Keyboard toggle with Alt+N.

-- AI Context Engine --
Generates structured context across 15 sections: task prompt, framework info (Next.js, Nuxt, Vite auto-detected), page location, route params, related source files, layout chain, component tree, UI state, structured errors, data fetching, API response shapes, accessibility tree, viewport info, performance hints, and DOM snapshot.

-- Context Presets & Auto-Detection --
One-click presets: Auto, Bug Fix, UI, Full, Minimal. As you type, Nexus Helper auto-detects your intent (bug fix, styling, performance, API, accessibility, routing, form) and highlights the matching preset. A floating intent badge gives real-time feedback.

-- API Docs Integration --
Sign in with Firebase (email/password or Google) and access your published API documentation from NexusDocer directly inside the extension. Search and attach endpoints, folders, or entire collections to your AI context. Smart auto-suggest finds matching API endpoints as you type keywords like "implement" or "integrate".

-- Default Editor & Auto-Copy --
Choose your default editor (Cursor, Antigravity, VS Code, Windsurf, Zed). When you click "Open Editor", context is auto-copied to your clipboard, ready to paste.

-- Token Counter --
Real-time estimated token count with color-coded warnings (green/yellow/red) to help you stay within model limits.

-- Quick Capture --
Copy route, copy screenshot, copy context, open editor -- all in one click from the minimized action bar.

-- Debug Panel --
Real-time error and network monitoring with search and filtering.

-- Project Indexing --
Auto-detects project path from React fiber, indexes files, and resolves routes to source files.

-- Additional --
Clipboard history, recent routes, speech-to-text input, autocomplete for routes (/) and files (@), ghost text suggestions, export/import settings.

---

## Category

Developer Tools

---

## Language

English

---

## Single Purpose Description

Nexus Helper captures structured context from web pages (routes, errors, components, API data) and formats it for AI code editors, enabling developers to generate accurate AI prompts with rich contextual awareness in one click.

---

## Permission Justifications

| Permission | Justification |
|---|---|
| `activeTab` | Required to access the current tab's URL for route detection and to capture visible-tab screenshots that are included in the AI context. |
| `clipboardWrite` | Required to copy the generated AI context, routes, and screenshots to the user's clipboard so they can paste into their code editor. |
| `storage` | Required to persist user settings, widget state, project configuration, clipboard history, recent routes, and authentication tokens across browser sessions. |
| `tabs` | Required to query tab information for route tracking and to communicate between the widget and background service worker. |
| `scripting` | Required to inject content scripts that monitor console errors, network requests, and page state for the debug panel and AI context generation. |
| `webNavigation` | Required to track single-page application (SPA) navigation events so the widget can update route information without page reloads. |
| `identity` | Required for Google Sign-in via Chrome's identity API, enabling users to authenticate with Firebase to access their API documentation. |
| `<all_urls>` (host permission) | Required so the floating widget and page monitoring scripts can run on any web page the developer is working on, including localhost, staging, and production URLs. |

---

## Privacy Practices

### Data Use Disclosures

- **Authentication tokens**: Stored locally via `chrome.storage.local` to maintain Firebase sign-in state. Never transmitted to third parties.
- **User settings**: Widget preferences, editor choice, and project path stored locally. Never leave the device.
- **Page data**: Console errors, network requests, DOM state, and screenshots are processed locally and only copied to the user's clipboard when they explicitly click "Copy Context" or "Copy Screenshot". No page data is collected, transmitted, or stored remotely.
- **API documentation**: Fetched from the user's own Firebase/Firestore account on demand. Data stays in local memory and is not cached to disk or shared.

### Data Collection

This extension does **not** collect, transmit, or sell any user data to third parties. All data processing happens locally on the user's device.

---

## Screenshots Guide

Prepare 1280x800 or 640x400 screenshots showing:

1. **Expanded widget** -- the full widget on a web page with prompt text and context options visible
2. **Minimized capsule** -- the sleek glassmorphic capsule with health dot on a page
3. **Hover action bar** -- minimized state expanded on hover showing quick-action buttons
4. **Context output** -- the clipboard content showing XML-tagged structured context
5. **API docs attach** -- the API docs search panel with endpoints being attached
6. **Context presets** -- the preset toolbar with intent auto-detection highlighted

---

## Promotional Tile (440x280)

Create a promotional tile featuring:
- Nexus Helper logo (the "N" icon)
- Tagline: "AI Context Capture for Code Editors"
- Subtitle: "Routes - Screenshots - Debug - API Docs"
- Dark gradient background with accent colors

---

## Privacy Policy URL

Use your existing privacy policy URL (required for extensions that handle user authentication).
