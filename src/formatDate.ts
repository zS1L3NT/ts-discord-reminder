export default (due: number): string => {
	const ms = due - new Date().getTime()

	if (ms < 1000) {
		return "NOW"
	}

	const s = Math.floor(ms / 1000)
	if (s < 60) {
		return "Less than 1m"
	}

	const m = Math.floor(s / 60)
	if (m < 60) {
		return m + "m"
	}

	const h = Math.floor(m / 60)
	const mr = m % 60
	if (h < 24) {
		return h + "h " + mr + "m"
	}

	const d = Math.floor(h / 24)
	const hr = h % 24
	if (d < 7) {
		return d + "d " + hr + "h " + mr + "m"
	}

	const w = Math.floor(d / 7)
	const dr = d % 7
	return w + "w " + dr + "d " + hr + "h " + mr + "m"
}
