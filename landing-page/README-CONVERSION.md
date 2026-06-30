# Complete Landing Page Conversion to React + Framer Motion

## Overview
Your landing-page.html is a complete, production-ready landing page with inline React (via Babel). 
To convert it to a proper React + Vite + Framer Motion app, follow these steps.

## Automated Approach (Recommended)

### Option 1: Run Python Script
```bash
cd landing-page
python convert-html.py
```

This will:
1. Extract all CSS to `src/assets/landing.css`
2. Extract all React code to `components-raw.js` for splitting

### Option 2: Manual Extraction

#### Step 1: Extract CSS
1. Open `landing-page.html`
2. Copy everything between `<style>` and `</style>` (lines ~60-1100)
3. Paste into `landing-page/src/assets/landing.css`

#### Step 2: Extract Google Fonts
Add to `landing-page/index.html` in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

#### Step 3: Update index.html
Replace `landing-page/index.html` content with:
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nerve — A local-first workspace for notes, tasks, and a graph that's actually yours</title>
  <meta name="description" content="Nerve combines a distraction-free rich editor, bi-directional linking, a recurring-task kanban, and a calendar — with all data stored locally on your device.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

## Component Files to Create

I've already created:
- ✅ `src/App.jsx`
- ✅ `src/components/Icons.jsx`
- ✅ `src/hooks/useTheme.js`
- ✅ `src/hooks/useReveal.js`

### YOU NEED TO CREATE:

Each component below can be copy-pasted from the `<script>` section of landing-page.html,
then wrapped with Framer Motion.

**Create these files in `src/components/`:**

1. **Nav.jsx** - Lines ~1170-1200 in HTML
2. **Hero.jsx** - Lines ~1320-1370 in HTML
3. **HeroVisual.jsx** - Lines ~1250-1320 in HTML
4. **ProblemFraming.jsx** - Lines ~1375-1390 in HTML
5. **FeatureShowcase.jsx** - Lines ~1580-1720 in HTML
6. **EditorMock.jsx** - Lines ~1395-1420 in HTML
7. **BacklinksMock.jsx** - Lines ~1460-1515 in HTML
8. **KanbanMock.jsx** - Lines ~1520-1575 in HTML
9. **CalendarMock.jsx** - Lines ~1725-1800 in HTML
10. **GraphMock.jsx** - Lines ~1425-1455 in HTML
11. **TrustSection.jsx** - Lines ~1805-1870 in HTML
12. **HowItWorks.jsx** - Lines ~1875-1920 in HTML
13. **DownloadSection.jsx** - Lines ~1925-2000 in HTML
14. **Footer.jsx** - Lines ~2005-2060 in HTML
15. **ThemeToggle.jsx** - Lines ~1205-1220 in HTML

## Adding Framer Motion Animations

### Basic Pattern
Replace `<div className="reveal">` patterns with:

```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
>
  {/* content */}
</motion.div>
```

### Remove Old CSS Animation
Once Framer Motion is added, you can remove from CSS:
- `.reveal` class
- `.reveal.is-visible` class
- `useReveal` hook usage (replaced by `whileInView`)

## Quick Start After Setup

```bash
cd landing-page
npm install
npm run dev
```

## Current Status

✅ Project structure created
✅ Dependencies installed (including framer-motion)
✅ Core hooks created
✅ Icons component complete
✅ App.jsx skeleton ready

❌ CSS needs extraction
❌ Components need creation
❌ Framer Motion needs integration

## Estimated Time
- Manual: 2-3 hours
- With script: 30-60 minutes

Would you like me to create a specific component as an example?
