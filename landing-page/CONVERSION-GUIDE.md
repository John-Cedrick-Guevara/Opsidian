# Landing Page React + Framer Motion Conversion Guide

## Status
The landing page HTML has been analyzed. I've created the base structure with:
- ✅ App.jsx (main component)
- ✅ Icons.jsx (all icons from HTML)
- ✅ useTheme.js hook
- ✅ useReveal.js hook  
- ✅ package.json updated with framer-motion

## What's Needed

### 1. Copy All CSS
The HTML file contains comprehensive CSS (lines ~60-1100). This needs to be extracted to:
`src/assets/landing.css`

The CSS includes:
- Theme variables (light/dark)
- All component styles
- Animations
- Responsive breakpoints

### 2. Create Component Files

Each component needs to be created in `src/components/`:

#### Core Components:
- **Nav.jsx** - Navigation bar with theme toggle
- **Hero.jsx** - Hero section with animated composite view
- **ProblemFraming.jsx** - Problem statement section
- **FeatureShowcase.jsx** - All feature blocks
- **TrustSection.jsx** - Local-first trust section  
- **HowItWorks.jsx** - 4-step process
- **DownloadSection.jsx** - Platform download cards
- **Footer.jsx** - Footer with links

#### Sub-components:
- **ThemeToggle.jsx** - Theme switcher button
- **HeroVisual.jsx** - Composite app window
- **EditorMock.jsx** - Editor content display
- **GraphMock.jsx** - SVG graph visualization
- **BacklinksMock.jsx** - Backlinks panel
- **KanbanMock.jsx** - Kanban board display
- **CalendarMock.jsx** - Calendar grid

### 3. Add Framer Motion

Import and wrap components with motion:
```jsx
import { motion } from 'framer-motion'

// Instead of <div>, use:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

### 4. Animation Patterns to Add

**Fade + Slide Up** (for sections):
```jsx
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.2, 0, 0, 1] }
}
```

**Stagger Children** (for lists):
```jsx
<motion.div variants={container}>
  {items.map((item, i) => (
    <motion.div key={i} variants={item}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Graph Animation** (for SVG):
- Nodes: scale + opacity
- Edges: pathLength from 0 to 1
- Pulse effect on active node

### 5. Quick Start

1. Extract all CSS from landing-page.html <style> tag
2. Save to `src/assets/landing.css`
3. Copy each React component from HTML <script> section
4. Wrap with motion.div and add animations
5. Run `npm install` to get framer-motion
6. Run `npm run dev`

## Example Component Conversion

**Before (from HTML):**
```jsx
const Hero = () => {
  const [ref, visible] = useReveal()
  return (
    <section className="hero">
      <div ref={ref} className={`reveal${visible ? ' is-visible' : ''}`}>
        <h1>Title</h1>
      </div>
    </section>
  )
}
```

**After (with Framer Motion):**
```jsx
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <section className="hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Title
        </motion.h1>
      </motion.div>
    </section>
  )
}
```

## File Structure
```
landing-page/
├── src/
│   ├── assets/
│   │   ├── landing.css          ← Extract from HTML
│   │   └── styles.css
│   ├── components/
│   │   ├── Nav.jsx              ← Create from HTML
│   │   ├── Hero.jsx             ← Create from HTML
│   │   ├── HeroVisual.jsx       ← Create from HTML
│   │   ├── ProblemFraming.jsx   ← Create from HTML
│   │   ├── FeatureShowcase.jsx  ← Create from HTML
│   │   ├── EditorMock.jsx       ← Create from HTML
│   │   ├── BacklinksMock.jsx    ← Create from HTML
│   │   ├── KanbanMock.jsx       ← Create from HTML
│   │   ├── CalendarMock.jsx     ← Create from HTML
│   │   ├── GraphMock.jsx        ← Create from HTML
│   │   ├── TrustSection.jsx     ← Create from HTML
│   │   ├── HowItWorks.jsx       ← Create from HTML
│   │   ├── DownloadSection.jsx  ← Create from HTML
│   │   ├── Footer.jsx           ← Create from HTML
│   │   ├── ThemeToggle.jsx      ← Create from HTML
│   │   └── Icons.jsx            ✅ Done
│   ├── hooks/
│   │   ├── useTheme.js          ✅ Done
│   │   └── useReveal.js         ✅ Done
│   ├── App.jsx                  ✅ Done
│   └── main.jsx
├── index.html
└── package.json                 ✅ Updated
```
