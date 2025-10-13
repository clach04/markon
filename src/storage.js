const STORAGE_KEY = 'markon-content'
const DEBOUNCE_MS = 600

const saveToStorage = (content) => {
	try {
		localStorage.setItem(STORAGE_KEY, content)
		return true
	} catch (e) {
		console.warn('Failed to save to localStorage:', e)
		return false
	}
}

const loadFromStorage = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) || null
	} catch (e) {
		console.warn('Failed to load from localStorage:', e)
		return null
	}
}

const createIdleCallback = (fn) =>
	window.requestIdleCallback ? requestIdleCallback(fn) : setTimeout(fn, 0)

export const createStorage = ({ onMarkdownUpdated, initialContent = '' }) => {
	let lastSavedContent = initialContent
	let debounceTimer = null
	let idleCallbackId = null
	let isFlushing = false

	const cleanup = () => {
		clearTimeout(debounceTimer)
		cancelIdleCallback?.(idleCallbackId)
		window.removeEventListener('beforeunload', flush)
		document.removeEventListener('visibilitychange', handleVisibilityChange)
	}

	const handleVisibilityChange = () =>
		document.visibilityState === 'hidden' && flush()

	const flush = () => {
		if (isFlushing) return
		isFlushing = true

		clearTimeout(debounceTimer)
		cancelIdleCallback?.(idleCallbackId)

		const currentContent = window.getMarkdown?.() || ''
		if (currentContent !== lastSavedContent) {
			saveToStorage(currentContent) && (lastSavedContent = currentContent)
		}

		isFlushing = false
	}

	const debouncedSave = (content) => {
		if (content === lastSavedContent) return

		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			debounceTimer = null
			idleCallbackId = createIdleCallback(() => {
				idleCallbackId = null
				flush()
			})
		}, DEBOUNCE_MS)
	}

	onMarkdownUpdated(debouncedSave)
	window.addEventListener('beforeunload', flush)
	document.addEventListener('visibilitychange', handleVisibilityChange)

	return { load: loadFromStorage, cleanup }
}
