# Landing Page Setup Guide

## Overview

The Opsidian landing page has been transformed into a modern React application with Vite, featuring:

- ✅ Responsive design for all devices
- ✅ Dark/Light theme toggle
- ✅ Download links for macOS, Windows, and Linux
- ✅ Feature showcase
- ✅ Modern UI with glassmorphism effects
- ✅ Fast performance with Vite

## Directory Structure

```
landing-page/
├── public/
│   ├── index.html              # HTML entry point
│   └── releases/                # Place app installers here
│       ├── Opsidian-0.1.0-mac.dmg
│       ├── Opsidian-0.1.0-win.exe
│       └── Opsidian-0.1.0-linux.AppImage
├── src/
│   ├── components/
│   │   ├── Nav.jsx             # Navigation with theme toggle
│   │   ├── Hero.jsx            # Hero section
│   │   ├── Features.jsx        # Features grid
│   │   ├── Download.jsx        # Download cards with links
│   │   ├── Footer.jsx          # Footer
│   │   └── Icons.jsx           # SVG icons
│   ├── assets/
│   │   └── styles.css          # Global styles
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # React entry point
├── package.json
├── vite.config.js
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd landing-page
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

This starts the dev server at http://localhost:5173

### 3. Build for Production

```bash
npm run build
```

Outputs to `landing-page/dist/`

## Linking Download Files

### Option 1: Local Hosting

1. Build your Electron app:
   ```bash
   cd ..  # Back to main project
   npm run build
   ```

2. Copy built files to releases folder:
   ```bash
   # macOS
   cp out/Opsidian-0.1.0-mac.dmg landing-page/public/releases/

   # Windows
   cp out/Opsidian-0.1.0-win.exe landing-page/public/releases/

   # Linux
   cp out/Opsidian-0.1.0-linux.AppImage landing-page/public/releases/
   ```

3. The download buttons will automatically work.

### Option 2: GitHub Releases (Recommended)

1. Create a GitHub release with your built files

2. Update `src/components/Download.jsx`:
   ```javascript
   const handleDownload = (filename) => {
     const downloadUrl = `https://github.com/yourusername/opsidian/releases/download/v0.1.0/${filename}`
     window.location.href = downloadUrl
   }
   ```

This keeps your landing page lightweight and leverages GitHub's CDN.

## Customization

### Branding

#### Logo
The logo is an SVG component in `Nav.jsx` and `Footer.jsx`. Customize the `LogoMark` component:

```javascript
const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    {/* Your custom logo paths */}
  </svg>
)
```

#### Colors
Edit CSS variables in `src/assets/styles.css`:

```css
:root {
  --accent: #4f46e5;        /* Brand color */
  --accent-hover: #4338ca;  /* Hover state */
  /* Light theme colors */
}

[data-theme="dark"] {
  --accent: #6366f1;        /* Dark mode brand color */
  /* Dark theme colors */
}
```

### Content

#### Hero Section
Edit `src/components/Hero.jsx`:
```javascript
<h1 className="hero__headline">
  Your <em>custom</em> headline here
</h1>
<p className="hero__sub">
  Your subtitle description
</p>
```

#### Features
Edit the features array in `src/components/Features.jsx`:
```javascript
const features = [
  {
    icon: <YourIcon />,
    title: 'Feature Name',
    description: 'Feature description'
  },
  // Add more features
]
```

#### Download Cards
Edit the downloads array in `src/components/Download.jsx`:
```javascript
const downloads = [
  {
    name: 'Platform Name',
    icon: <Icon />,
    meta: 'System requirements',
    description: 'Description',
    available: true,
    filename: 'your-file.dmg'
  }
]
```

#### Links
Update GitHub/social links:
- `src/components/Hero.jsx` - CTA buttons
- `src/components/Footer.jsx` - Footer links

Replace `https://github.com/yourusername/opsidian` with your actual repository URL.

## Deployment

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

Netlify will auto-deploy on every push to main.

### Vercel

1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

### GitHub Pages

1. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/opsidian/',  // Your repo name
     // ...
   })
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `dist` folder to gh-pages branch:
   ```bash
   npm install -D gh-pages
   npm run build
   npx gh-pages -d dist
   ```

4. Enable GitHub Pages in repo settings → Pages → Source: gh-pages branch

Your site will be at: `https://yourusername.github.io/opsidian/`

### Custom Domain

#### Netlify/Vercel
1. Go to Domain settings
2. Add your custom domain
3. Update DNS records as instructed

#### GitHub Pages
1. Add a `CNAME` file to `public/` with your domain
2. Update DNS:
   ```
   A Record: 185.199.108.153
   A Record: 185.199.109.153
   A Record: 185.199.110.153
   A Record: 185.199.111.153
   ```

## Performance Optimization

The landing page is already optimized, but you can:

1. **Add images**: Use WebP format and lazy loading
2. **Optimize fonts**: Self-host Google Fonts for better performance
3. **Enable compression**: Most hosts do this automatically
4. **Add analytics**: Google Analytics, Plausible, or Fathom

## SEO

Update meta tags in `public/index.html`:

```html
<meta name="description" content="Your app description">
<meta property="og:title" content="Opsidian">
<meta property="og:description" content="Your description">
<meta property="og:image" content="/og-image.png">
<meta name="twitter:card" content="summary_large_image">
```

Add `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

## Analytics

### Google Analytics

1. Create a GA4 property
2. Add to `public/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible (Privacy-friendly)

1. Sign up at plausible.io
2. Add to `public/index.html`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Maintenance

### Updating Version Numbers

When releasing a new version:

1. Update version in `Hero.jsx`:
   ```javascript
   <span className="hero__pill-version">v0.2.0</span>
   ```

2. Update filenames in `Download.jsx`:
   ```javascript
   filename: 'Opsidian-0.2.0-mac.dmg'
   ```

3. Update footer in `Footer.jsx`:
   ```javascript
   Version 0.2.0 • Released July 2026
   ```

### Adding New Features

1. Add to features array in `Features.jsx`
2. Optionally add a new icon to `Icons.jsx`
3. Test on mobile and desktop
4. Deploy!

## Troubleshooting

### Dev server won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build fails
- Check for console errors
- Verify all imports are correct
- Ensure all dependencies are installed

### Downloads don't work
- Check file paths in `public/releases/`
- Verify filenames match in `Download.jsx`
- Check browser console for errors

### Styles not loading
- Clear browser cache
- Check CSS file path in `main.jsx`
- Verify CSS variables are defined

## Support

For issues with:
- **Landing page**: Check this document and README
- **Main app**: See main project documentation
- **Deployment**: Check host-specific docs (Netlify, Vercel, GitHub Pages)

## Next Steps

1. ✅ Set up landing page locally
2. ✅ Customize branding and content
3. ✅ Build Electron app and add download files
4. ✅ Deploy to hosting service
5. ✅ Configure custom domain (optional)
6. ✅ Add analytics (optional)
7. ✅ Share with the world! 🚀
