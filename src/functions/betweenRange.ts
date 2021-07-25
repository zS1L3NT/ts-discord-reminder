export default (test: number, actual: number, range: number) => {
	const high = actual + range
	const low = actual - range
	return test >= low && test <= high
}