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