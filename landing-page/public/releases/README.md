# Releases Folder

Place your built Electron app installers here:

## Expected Files

- `Opsidian-0.1.0-mac.dmg` - macOS installer
- `Opsidian-0.1.0-win.exe` - Windows installer  
- `Opsidian-0.1.0-linux.AppImage` - Linux AppImage

## Building Releases

From the main Opsidian project directory:

```bash
# Build for all platforms
npm run build

# The built files will be in the 'out' folder
# Copy them to this releases folder with appropriate names
```

## Alternative: Use GitHub Releases

Instead of hosting files here, you can update the download URLs in `src/components/Download.jsx` to point directly to GitHub releases:

```javascript
const downloadUrl = `https://github.com/yourusername/opsidian/releases/download/v0.1.0/${filename}`
```

This way, your landing page will always link to the latest releases on GitHub.
