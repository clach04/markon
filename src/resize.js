import { createEventHandler, createElement, createClickHandler } from './utils.js'

const SNAP_THRESHOLD = 80

const applySnap = (width, maxWidth) =>
	width < SNAP_THRESHOLD ? 0 :
	width > maxWidth - SNAP_THRESHOLD ? maxWidth : width

// Layout utilities
const setPreviewWidth = (width, wrap) => {
	// Allow preview to expand to full width
	const finalWidth = Math.max(width, 0)
	wrap.style.gridTemplateColumns = `1fr 10px ${finalWidth}px`
}

// Preview manager
export const createPreviewManager = (wrap) => {
	let _width = 400 // Start with preview open
	const previewToggle = document.getElementById('preview-toggle')

	const setWidth = newWidth => {
		_width = newWidth
		setPreviewWidth(newWidth, wrap)
		previewToggle?.setAttribute('aria-pressed', String(newWidth > 0))
	}

	const toggle = () => setWidth(_width === 0 ? 400 : 0)

	// Add click handler to toggle button
	createClickHandler(previewToggle, toggle)

	// Initialize with preview open
	setWidth(_width)

	return {
		toggle,
		setWidth,
		get width() { return _width },
		set width(value) { _width = value }
	}
}

// Resize handler
export const createResizeHandler = (split, previewAside, wrap, previewManager) => e => {
	const startX = e.clientX
	const startWidth = previewAside.getBoundingClientRect().width

	split.classList.add('active')

	const onMove = ev => {
		const dx = startX - ev.clientX
		const newWidth = startWidth + dx
		const clampedWidth = Math.max(0, newWidth)
		setPreviewWidth(clampedWidth, wrap)
		// Update the preview manager's internal state
		if (previewManager) {
			previewManager.width = clampedWidth
		}
	}

	const onUp = () => {
		split.classList.remove('active')
		removeMoveListener()
		removeUpListener()

		const finalWidth = previewAside.getBoundingClientRect().width
		const maxWidth = wrap.getBoundingClientRect().width - 10
		const snappedWidth = applySnap(finalWidth, maxWidth)

		if (snappedWidth !== finalWidth) {
			setPreviewWidth(snappedWidth, wrap)
		}

		if (previewManager) {
			previewManager.width = snappedWidth
		}
	}

	const removeMoveListener = createEventHandler(window, 'pointermove', onMove)
	const removeUpListener = createEventHandler(window, 'pointerup', onUp)
}
