# Opsidian Landing Page

A modern, responsive landing page for Opsidian built with React and Vite.

## Features

- 🎨 Beautiful, modern design with glassmorphism effects
- 🌓 Dark/Light theme toggle with persistent preference
- 📱 Fully responsive for all screen sizes
- ⚡ Fast and optimized with Vite
- 🎯 Download links for macOS, Windows, and Linux
- ♿ Accessible and semantic HTML

## Setup

### Install Dependencies

```bash
cd landing-page
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Adding Download Files

To make the download buttons functional:

1. Build your Electron app for all platforms (macOS, Windows, Linux)
2. Place the built files in `public/releases/`:
   - `Opsidian-0.1.0-mac.dmg` (macOS installer)
   - `Opsidian-0.1.0-win.exe` (Windows installer)
   - `Opsidian-0.1.0-linux.AppImage` (Linux AppImage)

Alternatively, you can modify the download URLs in `src/components/Download.jsx` to point to GitHub releases or another hosting service.

## Structure

```
landing-page/
├── public/
│   ├── index.html
│   └── releases/          # Place your app installers here
├── src/
│   ├── components/
│   │   ├── Nav.jsx        # Navigation bar
│   │   ├── Hero.jsx       # Hero section
│   │   ├── Features.jsx   # Features grid
│   │   ├── Download.jsx   # Download cards
│   │   ├── Footer.jsx     # Footer
│   │   └── Icons.jsx      # SVG icon components
│   ├── assets/
│   │   └── styles.css     # Global styles
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Customization

### Colors

Edit CSS variables in `src/assets/styles.css`:

```css
:root {
  --accent: #4f46e5;        /* Primary brand color */
  --accent-hover: #4338ca;  /* Hover state */
  --accent-text: #4f46e5;   /* Text color */
  /* ... */
}
```

### Content

- **Navigation**: Edit `src/components/Nav.jsx`
- **Hero section**: Edit `src/components/Hero.jsx`
- **Features**: Edit the `features` array in `src/components/Features.jsx`
- **Downloads**: Edit the `downloads` array in `src/components/Download.jsx`
- **Footer links**: Edit `src/components/Footer.jsx`

### GitHub Links

Update GitHub links throughout the site by replacing `https://github.com/yourusername/opsidian` with your actual repository URL.

## Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service.

### GitHub Pages

1. Update `vite.config.js` with your repository name:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy dist folder to gh-pages branch
   ```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS Custom Properties** - Theming
- **Google Fonts** - Inter & JetBrains Mono

## License

MIT License - feel free to use this template for your own projects!

## Credits

Design inspired by modern SaaS landing pages with a focus on clarity and usability.
