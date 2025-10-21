import { createClickHandler, createElement, applyTheme, getPrefTheme, extractThemesFromCSS, saveCustomThemesCSS, clearCustomThemesCSS, openFileCSS, downloadText } from './utils.js'
import pkg from '../package.json'
import './settings.css'

const HOTKEYS = [
	['ctrl+/', 'Open settings', 'settings'],
	['ctrl+m', 'Toggle theme', 'toggle-theme'],
	['ctrl+k', 'Toggle spell check', 'toggle-spell'],
	['ctrl+p', 'Toggle preview', 'preview-toggle'],
	['ctrl+shift+c', 'Copy to clipboard', 'copy-to-clipboard'],
	['ctrl+s', 'Save to file', 'save-to-file'],
	['ctrl+o', 'Open file', 'load-from-file'],
	['ctrl+shift+v', 'Load from clipboard', 'load-from-clipboard'],
]


export const createSettingsDialog = () => {
	const dialog = createElement('dialog', {
		id: 'settings-system',
		className: 'settings-dialog',
		closedby: 'any' // Allow dismissal by backdrop click, ESC key, or close button
	})

	const header = createElement('div', { className: 'settings-header' })
	const title = createElement('h2', { className: 'settings-title', textContent: 'Settings' })
	const closeBtn = createElement('button', { className: 'settings-close' })
	closeBtn.innerHTML = '<iconify-icon width="38" height="38" icon="tabler:x"></iconify-icon>'
	header.append(title, closeBtn)

	const content = createElement('div', { className: 'settings-content' })

	const themesSection = createThemesSection()
	const performanceSection = createPerformanceSection()
	const shortcutsSection = createShortcutsSection()

	content.append(themesSection, performanceSection, shortcutsSection)

	const footer = createElement('div', { className: 'settings-footer' })
	const heart = createElement('span', { className: 'heart', textContent: '❤️' })
	const text1 = document.createTextNode('Made with ')
	const text2 = document.createTextNode(' by ')
	const githubProfileLink = createElement('a', {
		href: 'https://github.com/metaory',
		target: '_blank',
		textContent: 'github.metaory'
	})
	const text3 = document.createTextNode('/')
	const githubRepoLink = createElement('a', {
		href: 'https://github.com/metaory/markon',
		target: '_blank',
		textContent: 'markon'
	})
	const text4 = document.createTextNode(' · ')
	const version = createElement('kbd', {
		textContent: `v${pkg.version}`,
		className: 'settings-version'
	})

	// Line break
	const br = createElement('br')

	// Footer - line 2: Issues link
	const issuesIcon = createElement('iconify-icon', {
		icon: 'tabler:brand-github',
		width: '16',
		style: 'vertical-align: middle; margin-right: 4px;'
	})
	const issuesLink = createElement('a', {
		href: 'https://github.com/metaory/markon/issues/new/choose',
		target: '_blank',
		textContent: 'Submit issues or feature requests',
		style: 'display: inline-flex; align-items: center; margin-top: 8px; color: var(--accent);'
	})
	issuesLink.prepend(issuesIcon)

	footer.append(text1, heart, text2, githubProfileLink, text3, githubRepoLink, text4, version, br, issuesLink)

	dialog.append(header, content, footer)

	const show = () => {
		document.body.appendChild(dialog)
		dialog.showModal()
		// Highlight current theme after dialog is shown
		const themeGrid = dialog.querySelector('.settings-theme-grid')
		if (themeGrid) highlightCurrentTheme(themeGrid)
	}

	const hide = () => {
		dialog.close()
		dialog.remove()
	}

	createClickHandler(closeBtn, hide)

	// Fallback for backdrop click (in case closedby attribute isn't fully supported)
	dialog.addEventListener('click', e => {
		if (e.target === dialog) {
			hide()
		}
	})

	return { show, hide }
}

// Create configuration section
const createPerformanceSection = () => {
	const section = createElement('div', { className: 'settings-section' })
	const sectionTitle = createElement('h3', { className: 'settings-section-title', textContent: 'Configuration' })

	// Create two-column grid
	const configGrid = createElement('div', {
		className: 'settings-shortcuts',
		style: 'grid-template-columns: repeat(2, 1fr);'
	})

	// Profiler toggle
	const profilerToggle = createElement('div', { className: 'settings-item' })
	const profilerLabel = createElement('span', {
		textContent: 'Profiler',
		style: 'font-weight: 500;'
	})
	const profilerBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		id: 'toggle-profiler',
		'aria-pressed': localStorage.getItem('markon-profiler-visible') === 'true',
		style: 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2)); border: none;'
	})

	const profilerIcon = createElement('iconify-icon', {
		icon: 'tabler:gauge-filled',
		width: '16',
		height: '16'
	})
	const profilerText = createElement('span', { textContent: 'Toggle' })
	profilerBtn.append(profilerIcon, profilerText)

	profilerToggle.append(profilerLabel, profilerBtn)

	// Add click handler for profiler
	createClickHandler(profilerBtn, () => {
		const profiler = window.__MARKON_PERF__
		if (profiler) {
			profiler.toggle()
			const isVisible = profiler.isVisible
			profilerBtn.setAttribute('aria-pressed', String(isVisible))
		}
	})

	// Spell check toggle
	const spellToggle = createElement('div', { className: 'settings-item' })
	const spellLabel = createElement('span', {
		textContent: 'Spell Check',
		style: 'font-weight: 500;'
	})
	const spellBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		id: 'toggle-spell',
		'aria-pressed': 'false',
		style: 'background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)); border: none;'
	})

	const spellIcon = createElement('iconify-icon', {
		icon: 'tabler:file-text-filled',
		width: '16',
		height: '16'
	})
	const spellText = createElement('span', { textContent: 'Toggle' })
	spellBtn.append(spellIcon, spellText)

	spellToggle.append(spellLabel, spellBtn)

	// Add click handler for spell check
	createClickHandler(spellBtn, () => {
		const pressed = spellBtn.getAttribute('aria-pressed') === 'true'
		spellBtn.setAttribute('aria-pressed', String(!pressed))
		document.getElementById('toggle-spell')?.click()
	})

	// Save file button
	const saveToggle = createElement('div', { className: 'settings-item' })
	const saveLabel = createElement('span', {
		textContent: 'Save File',
		style: 'font-weight: 500;'
	})
	const saveBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		id: 'save-to-file',
		style: 'background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2)); border: none;'
	})

	const saveIcon = createElement('iconify-icon', {
		icon: 'tabler:file-download-filled',
		width: '16',
		height: '16'
	})
	const saveText = createElement('span', { textContent: 'Save' })
	saveBtn.append(saveIcon, saveText)

	saveToggle.append(saveLabel, saveBtn)

	// Add click handler for save
	createClickHandler(saveBtn, () => {
		document.getElementById('save-to-file')?.click()
	})

	// Load file button
	const loadToggle = createElement('div', { className: 'settings-item' })
	const loadLabel = createElement('span', {
		textContent: 'Load File',
		style: 'font-weight: 500;'
	})
	const loadBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		id: 'load-from-file',
		style: 'background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2)); border: none;'
	})

	const loadIcon = createElement('iconify-icon', {
		icon: 'tabler:file-upload-filled',
		width: '16',
		height: '16'
	})
	const loadText = createElement('span', { textContent: 'Load' })
	loadBtn.append(loadIcon, loadText)

	loadToggle.append(loadLabel, loadBtn)

	// Add click handler for load
	createClickHandler(loadBtn, () => {
		document.getElementById('load-from-file')?.click()
	})

	configGrid.append(profilerToggle, spellToggle, saveToggle, loadToggle)
	section.append(sectionTitle, configGrid)
	return section
}

// Create shortcuts section
const createShortcutsSection = () => {
	const section = createElement('div', { className: 'settings-section' })
	const sectionTitle = createElement('h3', { className: 'settings-section-title', textContent: 'Keyboard Shortcuts' })
	const shortcuts = createElement('div', { className: 'settings-shortcuts' })

	HOTKEYS.forEach(([key, desc]) => {
		const item = createElement('div', { className: 'settings-item' })
		item.append(
			createElement('kbd', { className: 'settings-key', textContent: key }),
			createElement('span', { className: 'settings-desc', textContent: desc }),
		)
		shortcuts.appendChild(item)
	})

	section.append(sectionTitle, shortcuts)
	return section
}

// Create themes section
const createThemesSection = () => {
	const section = createElement('div', { className: 'settings-section' })
	const sectionTitle = createElement('h3', { className: 'settings-section-title', textContent: 'Themes' })

	// Theme grid
	const themeGrid = createElement('div', { className: 'settings-theme-grid' })

	// Get themes dynamically from CSS
	const themes = extractThemesFromCSS()

	themes.forEach(theme => {
		const themeCard = createElement('div', {
			className: `settings-theme-card theme-${theme.id}`,
			'data-theme': theme.id
		})

		const themeName = createElement('div', { className: 'settings-theme-name', textContent: theme.id })

		// Color preview
		const colorPreview = createElement('div', { className: 'settings-theme-preview' })
		theme.colors.forEach(color => {
			const colorDot = createElement('div', {
				className: 'settings-theme-color',
				style: `background-color: ${color}`
			})
			colorPreview.appendChild(colorDot)
		})

		themeCard.append(themeName, colorPreview)

		// Add click handler for theme selection
		themeCard.addEventListener('click', async () => {
			const currentMode = getPrefTheme().mode
			await applyTheme(theme.id, currentMode)
			highlightCurrentTheme(themeGrid)
		})

		themeGrid.appendChild(themeCard)
	})

	// Download card
	const downloadCard = createElement('div', { className: 'settings-theme-card' })
	const downloadBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		title: 'Download themes.css'
	})
	const downloadIcon = createElement('iconify-icon', {
		icon: 'tabler:download',
		width: '16',
		height: '16'
	})
	const downloadText = createElement('span', { textContent: 'Download' })
	downloadBtn.append(downloadIcon, downloadText)
	downloadCard.appendChild(downloadBtn)

	// Upload card
	const uploadCard = createElement('div', { className: 'settings-theme-card' })
	const uploadBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		title: 'Upload themes.css'
	})
	const uploadIcon = createElement('iconify-icon', {
		icon: 'tabler:upload',
		width: '16',
		height: '16'
	})
	const uploadText = createElement('span', { textContent: 'Upload' })
	uploadBtn.append(uploadIcon, uploadText)
	uploadCard.appendChild(uploadBtn)

	// Reset card
	const resetCard = createElement('div', { className: 'settings-theme-card' })
	const resetBtn = createElement('button', {
		className: 'settings-theme-control-btn',
		textContent: 'Reset',
		title: 'Reset to built-in themes'
	})
	resetCard.appendChild(resetBtn)

	// Event handlers
	downloadBtn.addEventListener('click', async () => {
		const { downloadText } = await import('./utils.js')

		// Fetch the original themes.css file directly from GitHub
		const response = await fetch('https://raw.githubusercontent.com/metaory/markon/refs/heads/master/src/themes.css')
		const cssToDownload = await response.text()
		downloadText('themes.css', cssToDownload)
	})

	uploadBtn.addEventListener('click', async () => {
		const cssText = await openFileCSS()
		if (cssText) {
			saveCustomThemesCSS(cssText)
			// Refresh the settings dialog to show new themes
			location.reload()
		}
	})

	resetBtn.addEventListener('click', () => {
		clearCustomThemesCSS()
		location.reload()
	})

	// TODO: temporary disable
	// themeGrid.append(downloadCard, uploadCard, resetCard)

	section.append(sectionTitle, themeGrid)
	return section
}

// Highlight current theme in settings dialog
const highlightCurrentTheme = (themeGrid) => {
	const currentTheme = document.documentElement.getAttribute('data-theme')

	// Clear all selections and highlight current
	themeGrid.querySelectorAll('.settings-theme-card').forEach(card => {
		card.classList.toggle('selected', card.classList.contains(`theme-${currentTheme}`))
	})
}


// Settings icon creation
export const createSettingsIcon = settingsDialog => {
	const icon = createElement('iconify-icon', {
		icon: 'tabler:settings',
		className: 'settings-icon',
		title: 'Settings (Ctrl+/)',
		width: '36',
	})
	createClickHandler(icon, () => settingsDialog.show())
	return icon
}

// Export hotkeys for use in hotkeys module
export { HOTKEYS }
