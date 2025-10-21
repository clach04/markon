import {
	applySpell,
	applyTheme,
	copySmart,
	createClickHandler,
	createElement,
	downloadText,
	openFileText,
} from './utils.js'

// Button factory - more functional approach
const createButton = (config, showToast) => {
	const [id, label, icon, handler, isToggle, pressedDefault] = config

	const btn = createElement('button', {
		id,
		title: label,
		...(isToggle && { 'aria-pressed': String(pressedDefault) }),
		className: isToggle ? 'toggle' : '',
	})

	const iconEl = createElement('iconify-icon', { icon, width: '32' })
	btn.appendChild(iconEl)

	label && btn.appendChild(createElement('span', { textContent: label }))
	createClickHandler(btn, () => handler(btn, showToast))

	return btn
}

// Tabler icons don't use style suffixes like Solar
// const iconStyle = 'bold'
// const iconStyle = 'outline'
// const iconStyle = 'broken'
// const iconStyle = 'linear'

// Button configurations
const BUTTON_CONFIGS = [
	[
		'copy-to-clipboard',
		'Copy to clipboard',
		`tabler:copy-filled`,
		async (_btn, showToast) => {
			const text = await window.getMarkdown?.()
			if (text) await copySmart(text, showToast)
		},
	],
	[
		'load-from-clipboard',
		'Load from clipboard',
		`tabler:clipboard-text-filled`,
		async (_btn, showToast) => {
			const text = await window.readClipboardSmart?.()
			if (text) {
				const lines = text.split('\n')
				const minLines = 5
				const paddingLines = lines.length < minLines ? 3 : 0
				const paddedText = paddingLines > 0
					? '\n'.repeat(paddingLines) + text
					: text
				window.setMarkdown?.(paddedText)
				showToast('loaded from clipboard')
			} else showToast('clipboard empty')
		},
	],
	[
		'toggle-spell',
		'Toggle spell check',
		'tabler:file-text-filled',
		(btn, showToast) => {
			const pressed = btn.getAttribute('aria-pressed') === 'true'
			btn.setAttribute('aria-pressed', !pressed)
			applySpell(!pressed)
			showToast(pressed ? 'spell check off' : 'spell check on')
		},
		true,
		false,
	],
	[
		'toggle-theme',
		'Toggle theme',
		'tabler:sun-filled',
		async (_btn, showToast) => {
			const current = document.documentElement.getAttribute('data-mode') || 'dark'
			const next = current === 'light' ? 'dark' : 'light'
			const theme = document.documentElement.getAttribute('data-theme') || 'panda'
			await applyTheme(theme, next)
			showToast(`theme: ${next}`)
		},
		true,
		false,
	],
	[
		'save-to-file',
		'Save to file',
		`tabler:file-download-filled`,
		async (_btn, showToast) => {
			const text = await window.getMarkdown?.()
			if (text) {
				const name = prompt('filename:', 'document.md') || 'document.md'
				downloadText(name, text)
				showToast('saved to file')
			}
		},
	],
	[
		'load-from-file',
		'Load from file',
		`tabler:file-upload-filled`,
		async (_btn, showToast) => {
			const text = await openFileText()
			if (text) {
				window.setMarkdown?.(text)
				showToast('loaded from file')
			}
		},
	],
	[
		'install-pwa',
		'Install App',
		'tabler:device-desktop-filled',
		async (btn, showToast) => {
			if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
				// Show native install prompt
				window.deferredPrompt.prompt()
				const { outcome } = await window.deferredPrompt.userChoice
				showToast(outcome === 'accepted' ? 'App installed!' : 'Install cancelled')
				window.deferredPrompt = null
				btn.style.display = 'none'
			} else {
				showToast('Install not available on this device')
			}
		},
	],
	[
		'github',
		'GitHub',
		'tabler:brand-github',
		(_btn, _showToast) => {
			window.open('https://github.com/metaory/markon', '_blank')
		},
	],
]

// Create all buttons
export const createButtons = showToast => {
	const actions = document.getElementById('actions')
	BUTTON_CONFIGS.forEach(config => {
		const btn = createButton(config, showToast)
		actions.appendChild(btn)
	})
}
