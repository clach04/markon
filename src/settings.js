import { createClickHandler, createElement, getThemesList, applyTheme, getPrefTheme } from './utils.js'
import pkg from '../package.json'

// Hotkey configuration - single source of truth
const HOTKEYS = [
	['t', 'Toggle theme', 'toggle-theme'],
	['s', 'Toggle spell check', 'toggle-spell'],
	['p', 'Toggle preview', 'toggle-preview'],
	['c', 'Copy to clipboard', 'copy-to-clipboard'],
	['f', 'Save to file', 'save-to-file'],
	['o', 'Open file', 'load-from-file'],
]

// Theme configuration
const THEMES = [
	{
		id: 'panda',
		name: 'Panda',
		description: 'Vibrant colors',
		colors: ['#ff4488', '#8866ff', '#ccaa22', '#22aa88', '#22aa88']
	},
	{
		id: 'muted',
		name: 'Muted',
		description: 'Softer tones',
		colors: ['#b3667a', '#7a7ab3', '#a3a366', '#66a3a3', '#7ab37a']
	},
	{
		id: 'nord',
		name: 'Nord',
		description: 'Cool blues',
		colors: ['#88c0d0', '#5e81ac', '#ebcb8b', '#a3be8c', '#a3be8c']
	},
	{
		id: 'monokai',
		name: 'Monokai',
		description: 'Warm oranges',
		colors: ['#f92672', '#66d9ef', '#e6db74', '#a6e22e', '#e6db74']
	},
	{
		id: 'dracula',
		name: 'Dracula',
		description: 'Purple pinks',
		colors: ['#ff79c6', '#8be9fd', '#f1fa8c', '#50fa7b', '#f1fa8c']
	},
	{
		id: 'solarized',
		name: 'Solarized',
		description: 'warm/cool',
		colors: ['#d33682', '#268bd2', '#b58900', '#859900', '#859900']
	},
]

// Settings dialog creation
export const createSettingsDialog = () => {
	const dialog = createElement('dialog', {
		id: 'settings-system',
		className: 'settings-dialog',
		closedby: 'any' // Allow dismissal by backdrop click, ESC key, or close button
	})

	// Header
	const header = createElement('div', { className: 'settings-header' })
	const title = createElement('h2', { className: 'settings-title', textContent: 'Settings' })
	const closeBtn = createElement('button', { className: 'settings-close', textContent: '×' })
	header.append(title, closeBtn)

	// Content sections
	const content = createElement('div', { className: 'settings-content' })

	// Themes section (moved to top)
	const themesSection = createThemesSection()

	// Shortcuts section
	const shortcutsSection = createShortcutsSection()

	content.append(themesSection, shortcutsSection)

	// Footer
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
	const text4 = document.createTextNode(' · v')
	const version = createElement('span', {
		textContent: pkg.version,
		style: 'color: var(--comment); font-weight: 600;'
	})

	// Line break
	const br = createElement('br')

	// Footer - line 2: Issues link
	const issuesIcon = createElement('iconify-icon', {
		icon: 'tabler:brand-github-filled',
		width: '16',
		style: 'vertical-align: middle; margin-right: 4px;'
	})
	const issuesLink = createElement('a', {
		href: 'https://github.com/metaory/markon/issues/new/choose',
		target: '_blank',
		textContent: 'Submit issues or feature requests',
		style: 'display: inline-flex; align-items: center; margin-top: 8px;'
	})
	issuesLink.prepend(issuesIcon)

	footer.append(text1, heart, text2, githubProfileLink, text3, githubRepoLink, text4, version, br, issuesLink)

	dialog.append(header, content, footer)

	const show = () => {
		document.body.appendChild(dialog)
		dialog.showModal()
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

	THEMES.forEach(theme => {
		const themeCard = createElement('div', {
			className: 'settings-theme-card',
			'data-theme': theme.id
		})

		const themeName = createElement('div', { className: 'settings-theme-name', textContent: theme.name })
		const themeDesc = createElement('div', { className: 'settings-theme-desc', textContent: theme.description })

		// Color preview
		const colorPreview = createElement('div', { className: 'settings-theme-preview' })
		theme.colors.forEach(color => {
			const colorDot = createElement('div', {
				className: 'settings-theme-color',
				style: `background-color: ${color}`
			})
			colorPreview.appendChild(colorDot)
		})

		themeCard.append(themeName, themeDesc, colorPreview)

		// Add click handler for theme selection
		themeCard.addEventListener('click', async () => {
			const currentMode = getPrefTheme().mode
			await applyTheme(theme.id, currentMode)

			// Update visual selection
			themeGrid.querySelectorAll('.settings-theme-card').forEach(card => {
				card.classList.remove('selected')
			})
			themeCard.classList.add('selected')
		})

		themeGrid.appendChild(themeCard)
	})

	// Event handlers
	const currentTheme = getPrefTheme()

	// Set initial selection
	const initialCard = themeGrid.querySelector(`[data-theme="${currentTheme.theme}"]`)
	if (initialCard) initialCard.classList.add('selected')

	section.append(sectionTitle, themeGrid)
	return section
}


// Settings icon creation
export const createSettingsIcon = settingsDialog => {
	const icon = createElement('iconify-icon', {
		icon: 'solar:settings-bold',
		className: 'settings-icon',
		title: 'Settings (?)',
		width: '36',
	})
	createClickHandler(icon, () => settingsDialog.show())
	return icon
}

// Export hotkeys for use in hotkeys module
export { HOTKEYS }
