import { createElement, createEventHandler } from './utils.js'

const ensureId = (h, idx) => {
	if (!h.id) {
		h.id = `h-${idx}-${h.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
	}
	return h
}

const extractHeaders = previewHtml =>
	Array.from(previewHtml.querySelectorAll('h1, h2, h3, h4, h5, h6'))
		.map(ensureId)
		.map(h => ({
			id: h.id,
			text: h.textContent.trim(),
			level: parseInt(h.tagName[1]),
			element: h
		}))
		.filter(h => h.text)

const scrollToHeader = header => {
	if (!header?.element) return
	header.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const createTOCItem = (header, onScroll) => {
	const item = createElement('div', {
		className: 'toc-item',
		textContent: header.text,
		style: { paddingLeft: `${(header.level - 1) * 10}px` }
	}, [])
	item.setAttribute('data-level', header.level)
	createEventHandler(item, 'click', () => onScroll(header))
	return item
}

const createTOCList = (headers, onScroll) =>
	headers.length
		? headers.map(h => createTOCItem(h, onScroll))
		: [createElement('div', { className: 'toc-empty', textContent: 'No headers' }, [])]

const updateTOCList = (dropdown, headers, onScroll) => {
	dropdown.innerHTML = ''
	createTOCList(headers, onScroll).forEach(item => dropdown.appendChild(item))
}

const createHoverHandlers = (button, dropdown, delay = 300) => {
	let hideTimer
	const show = () => {
		clearTimeout(hideTimer)
		dropdown.style.opacity = '1'
		dropdown.style.pointerEvents = 'auto'
	}
	const hide = () => {
		clearTimeout(hideTimer)
		hideTimer = setTimeout(() => {
			dropdown.style.opacity = '0'
			dropdown.style.pointerEvents = 'none'
		}, delay)
	}
	createEventHandler(button, 'mouseenter', show)
	createEventHandler(dropdown, 'mouseenter', show)
	createEventHandler(button, 'mouseleave', hide)
	createEventHandler(dropdown, 'mouseleave', hide)
}

const observePreview = (previewHtml, update) => {
	const observer = new MutationObserver(() => {
		requestAnimationFrame(update)
	})
	observer.observe(previewHtml, { childList: true, subtree: true })
	return () => observer.disconnect()
}

export const createTOC = (previewHtml, previewContainer) => {
	const button = createElement('iconify-icon', {
		id: 'toc-button',
		icon: 'tabler:list',
		width: '24',
		height: '24'
	}, [])
	
	const dropdown = createElement('div', { id: 'toc-dropdown' }, [])
	const wrapper = createElement('div', { id: 'toc-wrapper' }, [dropdown, button])
	
	previewContainer.appendChild(wrapper)
	createHoverHandlers(button, dropdown)
	
	const update = () => {
		const headers = extractHeaders(previewHtml)
		updateTOCList(dropdown, headers, scrollToHeader)
	}
	
	update()
	observePreview(previewHtml, update)
}

