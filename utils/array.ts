export function removeRepeat<T, R>(items: T[], keySelector: (item: T) => R): T[] {
	const seenKeys = new Set<R>();
	return items.filter(item => {
		const key = keySelector(item);
		if (seenKeys.has(key)) {
			return false;
		}
		seenKeys.add(key);
		return true;
	});
}

