import {
	applySpell,
	applyTheme,
	copySmart,
	createClickHandler,
	createElement,
	downloadText,
	openFileText,
} from './utils.js'

// PWA state predicates - pure functions
const isPWAInstalled = () =>
	window.matchMedia('(display-mode: standalone)').matches ||
	window.navigator.standalone === true

const canInstallPWA = () =>
	window.deferredPrompt && !isPWAInstalled()

// Unified actions configuration - single source of truth
const ACTIONS_CONFIG = [
	// Toolbar actions (ordered from left to right, so rightmost appears last)
	{
		id: 'save-to-file',
		label: 'Save',
		icon: 'tabler:device-floppy',
		hotkey: 'ctrl+s',
		gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
		showInToolbar: true,
		handler: async (showToast) => {
			const text = await window.getMarkdown?.()
			if (text) {
				const name = prompt('filename:', 'document.md') || 'document.md'
				downloadText(name, text)
				showToast('saved', 1200, 'tabler:check')
			}
		}
	},
	{
		id: 'load-from-file',
		label: 'Open',
		icon: 'tabler:folder-open',
		hotkey: 'ctrl+o',
		gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: true,
		handler: async (showToast) => {
			const text = await openFileText()
			if (text) {
				window.setMarkdown?.(text)
				showToast('opened', 1200, 'tabler:check')
			}
		}
	},
	{
		id: 'toggle-spell',
		label: 'Spell',
		icon: 'tabler:file-text-filled',
		hotkey: 'ctrl+k',
		gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: false,
		handler: (showToast) => {
			const btn = document.getElementById('toggle-spell')
			const pressed = btn?.getAttribute('aria-pressed') === 'true'
			btn?.setAttribute('aria-pressed', String(!pressed))
			applySpell(!pressed)
			showToast(`spell: ${!pressed ? 'on' : 'off'}`, 1200, 'tabler:file-text')
		},
		isToggle: true
	},
	{
		id: 'install-pwa',
		label: 'Install',
		icon: 'tabler:badges-filled',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
		showInToolbar: true,
		handler: async (showToast) => {
			if (window.deferredPrompt) {
				window.deferredPrompt.prompt()
				const { outcome } = await window.deferredPrompt.userChoice
				showToast(outcome === 'accepted' ? 'installed!' : 'cancelled', 1200, outcome === 'accepted' ? 'tabler:check' : 'tabler:x')
				window.deferredPrompt = null
			} else {
				showToast('not available', 1200, 'tabler:alert-circle')
			}
		}
	},
	{
		id: 'settings',
		label: 'Settings',
		icon: 'tabler:settings-2',
		hotkey: 'ctrl+/',
		gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2))',
		showInToolbar: true,
		handler: (showToast) => {
			// This will be handled by the settings dialog creation
			document.getElementById('settings')?.click()
		}
	},
	{
		id: 'toggle-theme',
		label: 'Theme',
		icon: 'tabler:brightness-filled',
		hotkey: 'ctrl+m',
		gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
		showInToolbar: true,
		handler: async (showToast) => {
			const current = document.documentElement.getAttribute('data-mode') || 'dark'
			const next = current === 'light' ? 'dark' : 'light'
			const theme = document.documentElement.getAttribute('data-theme') || 'panda'
			await applyTheme(theme, next)
			showToast(`theme: ${next}`, 1200, 'tabler:palette')
		},
		isToggle: true
	},
	// Settings-only actions
	{
		id: 'copy-to-clipboard',
		label: 'Copy',
		icon: 'tabler:copy',
		hotkey: 'ctrl+shift+c',
		gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
		showInToolbar: false,
		handler: async (showToast) => {
			const text = await window.getMarkdown?.()
			if (text) {
				await copySmart(text, showToast)
			}
		}
	},
	{
		id: 'load-from-clipboard',
		label: 'Paste',
		icon: 'tabler:clipboard-text-filled',
		hotkey: 'ctrl+shift+v',
		gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
		showInToolbar: false,
		handler: async (showToast) => {
			const text = await window.readClipboardSmart?.()
			if (text) {
				const lines = text.split('\n')
				const minLines = 5
				const paddingLines = lines.length < minLines ? 3 : 0
				const paddedText = paddingLines > 0
					? '\n'.repeat(paddingLines) + text
					: text
				window.setMarkdown?.(paddedText)
				showToast('pasted', 1200, 'tabler:clipboard-check')
			} else {
				showToast('clipboard empty', 1200, 'tabler:alert-circle')
			}
		}
	},
	{
		id: 'toggle-profiler',
		label: 'Profiler',
		icon: 'tabler:gauge-filled',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
		showInToolbar: false,
		handler: (showToast) => {
			const profiler = window.__MARKON_PERF__
			if (profiler) {
				profiler.toggle()
				const isVisible = profiler.isVisible
				showToast(`profiler: ${isVisible ? 'on' : 'off'}`, 1200, 'tabler:gauge')
			}
		},
		isToggle: true
	},
	{
		id: 'github',
		label: 'GitHub',
		icon: 'tabler:brand-github',
		hotkey: '',
		gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2))',
		showInToolbar: false,
		handler: () => {
			window.open('https://github.com/metaory/markon', '_blank')
		}
	}
]

// Button factory - functional approach with popover
const createButton = (config, showToast) => {
	const { id, label, icon, handler, isToggle, hotkey } = config

	const btn = createElement('button', {
		id,
		...(isToggle && { 'aria-pressed': 'false' }),
		className: isToggle ? 'toggle' : ''
	})

	const iconEl = createElement('iconify-icon', { icon, width: '32' })
	btn.appendChild(iconEl)

	// Add popover span with label + hotkey (no title attribute)
	// For theme-mode and settings, show only hotkey
	const popoverText = (id === 'toggle-theme' || id === 'settings')
		? hotkey
		: hotkey ? `${label} • ${hotkey}` : label
	const span = createElement('span', { textContent: popoverText })
	btn.appendChild(span)

	createClickHandler(btn, () => handler(showToast))

	return btn
}

// Derive arrays for different uses
export const SETTINGS_ACTIONS = ACTIONS_CONFIG
export const HOTKEYS = ACTIONS_CONFIG
	.filter(a => a.hotkey)
	.map(a => [a.hotkey, a.label, a.id])
	.concat([
		['ctrl+p', 'Toggle preview', 'preview-toggle']
	])

// Create all buttons
export const createButtons = (showToast, settingsDialog) => {
	const actions = document.getElementById('actions')
	ACTIONS_CONFIG
		.filter(a => a.showInToolbar)
		.forEach(config => {
			const btn = createButton(config, showToast)

			// Special handling for settings button
			if (config.id === 'settings') {
				createClickHandler(btn, () => settingsDialog.show())
			}

			// Special handling for PWA install button visibility
			if (config.id === 'install-pwa') {
				const update = () => btn.style.display = canInstallPWA() ? 'flex' : 'none'
				update()
				window.addEventListener('beforeinstallprompt', update)
				window.addEventListener('appinstalled', update)
			}

			actions.appendChild(btn)
		})
}

// Export action handlers for reuse in settings
export const getActionHandlers = () => {
	const handlers = {}
	ACTIONS_CONFIG.forEach(config => {
		handlers[config.id] = config.handler
	})
	return handlers
}
