import '@fontsource/bungee'
import '@fontsource/monaspace-argon'
import '@fontsource/monaspace-argon/400-italic.css'
import '@fontsource/monaspace-argon/700.css'
import '@fontsource/monaspace-krypton'
import '@fontsource/monaspace-krypton/400-italic.css'
import '@fontsource/monaspace-krypton/700.css'
import 'iconify-icon'
import tablerIcons from '@iconify-json/tabler/icons.json' with { type: 'json' }
import './style.css'
import './components.css'
import './themes.css'
import { createEditor } from './core.js'
import { setupPreview } from './preview.js'
import { initUI } from './ui.js'
import { injectCustomThemesCSS } from './utils.js'

const boot = async () => {
	injectCustomThemesCSS()

	// Configure iconify to use local Tabler icons instead of API
	// Wait for iconify-icon to be ready, then add the collection
	const addTablerIcons = () => {
		if (window.Iconify && window.Iconify.addCollection) {
			window.Iconify.addCollection(tablerIcons)
		} else if (window.customElements && window.customElements.get('iconify-icon')) {
			const iconifyIcon = window.customElements.get('iconify-icon')
			if (iconifyIcon.addCollection) {
				iconifyIcon.addCollection(tablerIcons)
			}
		}
	}

	// Try immediately and also when DOM is ready
	addTablerIcons()
	document.addEventListener('DOMContentLoaded', addTablerIcons)

	// Handle PWA install prompt
	window.addEventListener('beforeinstallprompt', event => {
		event.preventDefault()
		window.deferredPrompt = event
	})

	// Clear install prompt after successful install
	window.addEventListener('appinstalled', () => {
		window.deferredPrompt = null
	})

	const { getMarkdown, setMarkdown, onMarkdownUpdated, cleanup, profiler } = await createEditor()
	const { previewHtml } = await initUI({ getMarkdown, setMarkdown })
	setupPreview({ getMarkdown, onMarkdownUpdated, previewHtml, profiler })

	// Expose profiler globally for console inspection
	window.__MARKON_PERF__ = profiler

	// Cleanup storage on page unload
	window.addEventListener('beforeunload', cleanup)
}

boot()
