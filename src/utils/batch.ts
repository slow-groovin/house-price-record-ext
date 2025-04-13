export async function batchProcess<T>(
	items: T[],
	batchSize: number,
	callback:  (batch: T[]) => Promise<void>
): Promise<void> {
	if (batchSize <= 0) {
		throw new Error("batchSize must be greater than 0");
	}

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await callback(batch);
	}
}