# Nexus Will Landing Page

**Welcome to the Grand Line.** 🏴‍☠️

A cinematic, One Piece-inspired landing page for [nexuswill.com](https://nexuswill.com) — the portal to AI-native software development.

## The Concept

This is not a landing page. It's the **Reverse Mountain** — the moment you leave the safe East Blue (old-school dev) and enter the **Grand Line** of software development.

### Sections

1. **Hero / Reverse Mountain** — The dramatic entrance with stormy ocean, lightning effects, and the call to adventure
2. **The Grand Line** — Interactive map showing pain points (Bug Hell, Context Loss Cove, etc.) with solutions
3. **The New World** — AI-native future where everything is stronger, darker, more epic
4. **Sky Islands** — The elevated plane where coding feels magical, white/gold theme
5. **The Fleet** — Subdomain navigation showing the entire Nexus Will ecosystem

### Key Features

- **Log Pose Compass** — Interactive navigation that rotates as you scroll (desktop & mobile)
- **Animated Ocean Background** — Storm effects, lightning, floating code particles
- **Interactive Map** — Click islands to explore pain points and solutions
- **Scroll-triggered Animations** — Smooth reveals using Framer Motion
- **Responsive Design** — Works beautifully on all devices

## Tech Stack

- **Next.js 15** — React framework with static export
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Beautiful UI components
- **Framer Motion** — Animations and interactions
- **Lucide Icons** — Iconography

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
app/
├── components/
│   └── LogPose.tsx          # Interactive compass navigation
├── sections/
│   ├── Hero.tsx             # Reverse Mountain hero
│   ├── GrandLine.tsx        # Interactive map
│   ├── NewWorld.tsx         # AI-native future
│   ├── SkyIslands.tsx       # Elevated plane
│   ├── Subdomains.tsx       # Fleet/navigation
│   └── Footer.tsx           # Site footer
├── page.tsx                 # Main page composition
├── layout.tsx               # Root layout
└── globals.css              # Global styles & animations
```

## Design System

### Colors
- **Ocean Deep**: `#020617` — Background
- **Ocean Mid**: `#0f172a` — Cards
- **Lightning**: `#38bdf8` — Primary accent
- **Treasure Gold**: `#f59e0b` — CTA, highlights
- **Devil Fruit**: `#8b5cf6` — Secondary accent

### Typography
- **Display**: Cinzel (serif) — Headlines
- **Body**: Inter (sans-serif) — Body text
- **Code**: JetBrains Mono — Technical elements

### Animations
- `float` — Gentle vertical floating
- `glow` — Pulsing glow effect
- `pulse-lightning` — Lightning pulse
- `wave` — Horizontal wave motion
- `thunder-flash` — Thunder flash overlay

## The Log Pose

The signature interactive element — a glowing compass in the top-right corner:

- Rotates to point toward the active section as you scroll
- Click to open navigation menu
- On mobile, becomes a floating orb at bottom-right
- Glows with cyan energy

## Customization

### Changing Sections

Edit the `sections` array in `app/page.tsx`:

```tsx
const sections = [
  { id: "reverse-mountain", label: "Reverse Mountain" },
  { id: "grand-line", label: "The Grand Line" },
  // Add your sections...
];
```

### Adding Islands to the Map

Edit the `islands` array in `app/sections/GrandLine.tsx`:

```tsx
const islands = [
  {
    id: "your-island",
    name: "Your Island",
    icon: YourIcon,
    description: "Description of the pain point",
    solution: "How Nexus Will solves it",
    color: "from-cyan-500 to-blue-500",
    position: { x: 50, y: 50 },
  },
];
```

## License

Private — All rights reserved.

---

*The sea is calling.* 🌊⚡
