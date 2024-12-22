export function areAllMemberEqualByKey<T>(array: T[], memberKey: keyof T, excludeNullOrUndefined: boolean = false): boolean {
	if (array.length === 0) return true; // 空数组视为一致
	const firstValue = array[0][memberKey];
	return array.every(item =>
		(excludeNullOrUndefined && (isNullOrUndefined(item[memberKey]) || isNullOrUndefined(firstValue)))
		||
		item[memberKey] === firstValue);
}

export function areAllMemberEqualByKeys<T>(array: T[], memberKeys: (keyof T)[]): {
	isEqual: boolean,
	failedKeys: (keyof T)[]
} {
	const failedKeys: (keyof T)[] = [];
	for (const memberKey of memberKeys) {
		if (!areAllMemberEqualByKey(array, memberKey)) {
			failedKeys.push(memberKey);
		}
	}
	return {
		isEqual: failedKeys.length === 0,
		failedKeys
	};
}

export function isNullOrUndefined<T>(v: T | null | undefined): v is null | undefined {
	return v === null || v === undefined
}


/**
 * 提示词: 对于一组不稳定的对象数组(community 不同pages的结果),其中某些字段可能为空值或与其他对象的相同字段值不一致。
 * 该函数将对每个字段选择出现次数最多的值作为最终值,忽略掉空值和少数异常值。
 * 同时,函数返回一个记录,指出每个对象哪些字段与大多数对象的值不同。
 * 只处理['string','number','boolean']这几种值类型的字段
 *
 * 函数简介: 接收一组对象数组,返回一个包含稳定字段值的对象和一个差异记录数组。
 */
export function stabilizeFields<T extends Record<string, any>>(
	values: T[],
	options?: {
		excludeFields?: string[]
	}):
	{
		result: T,
		diff: Record<string, string>[],
		hasDiff: boolean
	} {
	const fieldNames = new Set<string>();
	const allowTypes = ['string', 'number', 'boolean']
	values.forEach(obj => {
		Object.keys(obj).forEach(key => {
			if (!allowTypes.includes(typeof obj[key])) return;
			if (options?.excludeFields?.includes(key)) return;

			fieldNames.add(key)
		});
	});

	const result: Record<string, any> = {};
	const diff: Record<string, string>[] = Array(values.length).fill(null);

	fieldNames.forEach(fieldName => {
		const fieldValues = values.map(obj => obj[fieldName] === undefined ? null : obj[fieldName]);
		const mostCommonValue = getMostCommonValue(fieldValues);

		if (mostCommonValue !== null) {
			result[fieldName] = mostCommonValue;
		}

		fieldValues.forEach((value, index) => {
			if (value !== null && value !== mostCommonValue) {
				diff[index] = diff[index] || {};
				diff[index]![fieldName] = value;
			}
		});
	});

	return {result: result as T, diff, hasDiff: diff.some(v => !!v)};
}

function getMostCommonValue(values: (any | null)[]) {
	const valueCounts: Record<string, number> = {};
	let mostCommonValue: any | null = null;

	values.forEach(value => {
		if (value !== null) {
			valueCounts[value] = (valueCounts[value] || 0) + 1;
			if (valueCounts[value]! > values.length/2) {
				mostCommonValue = value;
			}
		}
	});

	return mostCommonValue;
}

export function tryMin(...nums: (number|undefined)[]):number|undefined{
	return nums.reduce((acc,cur)=>{
		if(isNullOrUndefined(acc)||isNullOrUndefined(cur)) return undefined
		return Math.min(acc,cur)
	})
}
export function tryMax(...nums: (number|undefined)[]):number|undefined{
	return nums.reduce((acc,cur)=>{
		if(isNullOrUndefined(acc)||isNullOrUndefined(cur)) return undefined
		return Math.max(acc,cur)
	})
}

/**
 * Prompt: 将一个字符串转换为常规的基本类型，如 number、boolean 或 string。
 * 简介: 提供了一个通用函数，可以根据指定的类型将字符串解析为对应的常规类型。
 *       如果类型不被支持或无法正确解析，则返回 null。
 */
export function parseToType<T>(val: string, type: 'string' | 'number' | 'boolean'): T | null {
	// 确保输入值和类型均有效
	if (!val || !type) return null;

	// 根据类型解析输入值
	switch (type) {
		case 'string':
			// 字符串类型直接返回输入值
			return val as T;

		case 'number':
			// 将字符串转换为数字
			const parsedNumber = Number(val);
			// 如果解析失败返回 NaN，返回 null
			return isNaN(parsedNumber) ? null : (parsedNumber as T);

		case 'boolean':
			// 解析为布尔类型，支持 'true' 和 'false'
			if (val.toLowerCase() === 'true') return true as T;
			if (val.toLowerCase() === 'false') return false as T;
			return null;

		default:
			// 对于未知的类型，返回 null
			return null;
	}
}

/**
 * 合并参数函数 (Prompt: 优化的需求提示词：合并来自不同来源的参数，按优先级确定最终结果)
 *
 * 本函数接收变长参数列表，每个参数均为可选值（如 route query 和 localStorage）。
 * 按参数的先后顺序，返回第一个非空值。若所有参数均为空，返回空字符串。
 */
export function mergeParams<T>(...values: (T | undefined | null)[]): T|undefined {
	// 遍历参数列表，找到第一个非空（非 undefined 或 null 或空字符串）的值
	for (const value of values) {
		if (value) {
			return value;
		}
	}

	// 若所有参数均为空，返回空字符串
	return undefined;
}
