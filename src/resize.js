import { createEventHandler, createElement, createClickHandler } from './utils.js'

const SNAP_THRESHOLD = 80

const applySnap = (width, maxWidth) =>
	width < SNAP_THRESHOLD ? 0 :
	width > maxWidth - SNAP_THRESHOLD ? maxWidth : width

const setPreviewWidth = (width, wrap) => {
	const finalWidth = Math.max(width, 0)
	wrap.style.gridTemplateColumns = `1fr 14px ${finalWidth}px`
}

export const createPreviewManager = (wrap) => {
	let _width = 250
	const previewToggle = document.getElementById('preview-toggle')

	const setWidth = newWidth => {
		_width = newWidth
		setPreviewWidth(newWidth, wrap)
		previewToggle?.setAttribute('aria-pressed', String(newWidth > 0))
	}

	const toggle = () => setWidth(_width === 0 ? 400 : 0)

	createClickHandler(previewToggle, toggle)

	setWidth(_width)

	return {
		toggle,
		setWidth,
		get width() { return _width },
		set width(value) { _width = value }
	}
}

export const createResizeHandler = (split, previewAside, wrap, previewManager) => e => {
	const startX = e.clientX
	const startWidth = previewAside.getBoundingClientRect().width

	split.classList.add('active')

	const onMove = ev => {
		const dx = startX - ev.clientX
		const newWidth = startWidth + dx
		const clampedWidth = Math.max(0, newWidth)
		setPreviewWidth(clampedWidth, wrap)

		if (previewManager) {
			previewManager.width = clampedWidth
		}
	}

	const onUp = () => {
		split.classList.remove('active')
		removeMoveListener()
		removeUpListener()

		const finalWidth = previewAside.getBoundingClientRect().width
		const maxWidth = wrap.getBoundingClientRect().width - 14
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
