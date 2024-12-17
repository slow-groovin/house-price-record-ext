/**
 * 查询当前浏览器 IndexedDB 数据库已占用的空间大小
 * @returns 已占用空间大小（字节数）和配额信息
 */
export async function getIndexedDBUsage() {
	// 检查浏览器是否支持 StorageManager API
	if (!navigator.storage || !navigator.storage.estimate) {
		throw new Error("当前浏览器不支持 StorageManager API。");
	}

	// 获取存储估算信息
	const estimate = await navigator.storage.estimate();
	return {
		usage: (estimate.usage ?? 0)/(1024*1024), // 已使用的存储空间，单位为字节
		quota: (estimate.quota ?? 0)/(1024*1024*1024), // 可用的存储配额，单位为字节
		percentage: (estimate.usage??0) / (estimate.quota??1) * 100
	};
}
