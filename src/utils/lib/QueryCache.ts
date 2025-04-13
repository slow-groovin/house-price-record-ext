/**
 * Prompt: 针对数据库查询的 N+1 问题，优化查询缓存
 * 该类通过提供一个查询 key 和一个查询函数，避免在同一请求中重复查询相同的数据。
 * 如果缓存中存在相同 key 的结果，则直接返回缓存结果，否则执行查询函数并缓存结果。
 */
export class QueryCache<T> {
	private cache: Map<string | number, T|undefined> = new Map(); // 缓存存储

	/**
	 * 根据缓存 key 和查询函数获取数据
	 * @param cacheKey - 缓存的 key，可以是基本类型
	 * @param queryFn - 查询函数，返回数据库查询结果
	 * @returns 查询结果，若缓存中已有，则返回缓存数据；否则执行查询并缓存结果
	 */
	async getData(cacheKey: string | number, queryFn: () => Promise<T|undefined>): Promise<T|undefined> {
		// 1. 检查缓存中是否已经存在该数据
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!; // 2. 如果存在，直接返回缓存结果
		}

		// 3. 如果缓存中没有，执行查询函数获取数据
		const result = await queryFn();

		// 4. 将查询结果缓存
		this.cache.set(cacheKey, result);

		// 5. 返回查询结果
		return result;
	}
}
