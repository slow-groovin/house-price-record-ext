/**
 * 描述：在 Vue 3 中实现一个低代价的缓存类，用于页面内缓存某些参数，
 *       不使用 ref 或 reactive，因为不需要响应式功能。
 * Prompt: 构建一个简单易用的缓存类，提供方便的接口来管理数据缓存，
 *         函数内部可对参数进行可选的获取操作。
 */

export class ArgCache<T = any> {
	private store: Map<string, T>;

	constructor() {
		// 初始化 Map 作为缓存存储
		this.store = new Map<string, T>();
	}

	/**
	 * 获取缓存值或存储默认值,
	 * 如果提供的value存在, 则更新缓存且返回value，
	 * 否则尝试从缓存中获取key对应的value作为结果返回, 如果不存在则返回defaultValue
	 * @param key 缓存键
	 * @param value 可选的参数值
	 * @param defaultValue 默认值
	 * @returns 返回缓存值、参数值或默认值
	 */
	retrieve(key: string, value?: T, defaultValue?: T): T {
		if (value !== undefined) {
			// 如果提供了参数值，则存储并返回
			this.store.set(key, value);
			return value;
		}

		const cachedValue = this.store.get(key);
		if (cachedValue !== undefined) {
			// 如果缓存中存在值，则返回
			return cachedValue;
		}

		// 如果缓存不存在，存储并返回默认值
		if (defaultValue !== undefined) {
			this.store.set(key, defaultValue);
			return defaultValue;
		}

		// 如果没有默认值，返回 undefined
		return undefined as T;
	}

	del(key:string){
		this.store.delete(key)
	}

	/**
	 * 清空缓存
	 */
	clear(): void {
		// 清空所有缓存数据
		this.store.clear();
	}
}
