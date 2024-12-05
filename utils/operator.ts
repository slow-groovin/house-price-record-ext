export function tryMinusOrUndefined(n1?: number, n2?: number) {
	if (typeof n1 === 'number' && typeof n2 === 'number')
		return n1 - n2
	return undefined
}