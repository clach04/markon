import { HOTKEYS } from './settings.js'
import { $ } from './utils.js'

// Key event handler
export const createKeyHandler = settingsDialog => e => {
	// Allow hotkeys to work even when editor is focused
	// Only skip if it's a regular input/textarea (not CodeMirror)
	if (e.target.matches('input:not([data-cm-editor]), textarea:not([data-cm-editor])')) return

	const key = e.key.toLowerCase()
	const hasCtrl = e.ctrlKey || e.metaKey
	const hasShift = e.shiftKey

	// Special keys
	switch (key) {
		case '?':
			if (hasShift) {
				e.preventDefault()
				settingsDialog.show()
			}
			return
	}

	// Build modifier string
	let modifierString = ''
	if (hasCtrl) modifierString += 'ctrl+'
	if (hasShift) modifierString += 'shift+'
	const fullKey = modifierString + key

	// Regular hotkeys
	const hotkey = HOTKEYS.find(([k]) => k === fullKey)
	if (hotkey) {
		e.preventDefault()
		const [, , targetId] = hotkey

		// Special handling for toggle-preview
		if (targetId === 'preview-toggle' && window.previewManager) {
			window.previewManager.toggle()
			return
		}

		$(targetId)?.click()
	}
}

// Setup hotkeys
export const setupHotkeys = settingsDialog => {
	window.addEventListener('keydown', createKeyHandler(settingsDialog), true)
}
