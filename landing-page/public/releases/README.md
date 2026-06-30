# Releases Folder

Place built installers here so the landing page download buttons work.

## Windows (build on your PC)

From the **project root** (`Opsidian/`, not `landing-page/`):

```bash
npm install
npm run dist:win
```

Output: `release/Opsidian-0.1.0-win.exe`

Copy to this folder:

```bash
copy "..\..\release\Opsidian-0.1.0-win.exe" "Opsidian-0.1.0-win.exe"
```

(PowerShell from this directory: `Copy-Item "..\..\release\Opsidian-0.1.0-win.exe" .`)

## Expected filenames

| Platform | File |
|----------|------|
| Windows | `Opsidian-0.1.0-win.exe` |
| macOS | `Opsidian-0.1.0-mac.dmg` |
| Linux | `Opsidian-0.1.0-linux.AppImage` |

## GitHub Releases (optional)

For large files, use GitHub Releases and point `Download.jsx` URLs to:

`https://github.com/yourusername/opsidian/releases/download/v0.1.0/Opsidian-0.1.0-win.exe`
