<div align="center">
  <h1>
    <img valign="middle" src="public/wordmark.png" alt="logo" height="64" />
  </h1>
  <strong>
    Minimal distraction-free live Markdown editor
  </strong>
  <br>
  <h3>
    <a href="https://metaory.github.io/markon">metaory.github.io/markon</a>
  </h3>
  <br>
  <a href="https://metaory.github.io/markon">
    <img src="https://img.shields.io/badge/PWA-Installable-blue?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Installable" />
  </a>
  <img src="public/screenshots.png" alt="screenshot" width="80%" />
  <br> <br>
  <img src="public/themes.png" alt="themes" width="70%" />
  <br>
  <a href="https://metaory.github.io/markon/themes">themes</a>
</div>


## Features

- **GFM**: GitHub Flavored Markdown + alerts
- **Syntax**: 250+ languages with highlighting
- **Split view**: resizable editor & preview
- **Auto-save**: localStorage persistence
- **Themes**: multiple presets
- **Hotkeys**: keyboard shortcuts
- **Offline**: no network required

## Language Loading & Caching

**markon** uses **lazy loading** for syntax highlighting to keep the app fast and lightweight:

- **On-demand loading**: Language modules are only loaded when you use them
- **Smart caching**: Once loaded, languages work offline in future sessions
- **250+ languages**: Full highlight.js support with minimal initial bundle size
- **PWA optimized**: Cached languages persist across app updates

> [!TIP]
> **Offline behavior**: Languages you've used before will work offline. New languages require an internet connection to load initially.

## Roadmap

- [x] **Autosave**: local persistence
- [ ] **Export**: PDF/HTML
- [ ] **Mobile**: touch gestures
- [x] **PWA**: installable, offline cache
- [ ] **Scroll**: toggle scroll follow
- [ ] **Share**: url hash content
- [x] **Snap**: split resize snapping
- [x] **Shortcuts**: command palette
- [x] **Theming**: custom CSS look
- [x] **Theme Presets**: multiple presets in settings
- [ ] **Scroll**: sync

> [!NOTE]
> _in no particular order_

---

## License

[AGPL-3.0](LICENSE)
