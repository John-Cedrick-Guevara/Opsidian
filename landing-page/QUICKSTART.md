# Quick Start Guide

Get the Opsidian landing page running in 3 steps:

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## 3. Build for Production

```bash
npm run build
```

The built site will be in the `dist/` folder, ready to deploy anywhere!

---

## Next Steps

### Add Download Files

Place your Electron app builds in `public/releases/`:
- `Opsidian-0.1.0-mac.dmg`
- `Opsidian-0.1.0-win.exe`
- `Opsidian-0.1.0-linux.AppImage`

### Deploy

**Netlify / Vercel (Recommended)**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

**GitHub Pages**
```bash
npm run build
npx gh-pages -d dist
```

---

## Customization

### Change Colors
Edit `src/assets/styles.css`:
```css
:root {
  --accent: #4f46e5;  /* Your brand color */
}
```

### Update Content
- Hero: `src/components/Hero.jsx`
- Features: `src/components/Features.jsx`
- Downloads: `src/components/Download.jsx`

### Update Links
Replace `https://github.com/yourusername/opsidian` with your actual GitHub URL in:
- `Hero.jsx`
- `Download.jsx`
- `Footer.jsx`

---

## Need Help?

- See **README.md** for detailed instructions
- See **docs/landing-page-setup.md** for comprehensive guide
- Check **public/releases/README.md** for download file setup

## Commands Reference

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

That's it! 🚀
