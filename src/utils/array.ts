import {list, random} from "radash";

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


/**
 * 【Prompt 优化】编写一个函数，接收一个泛型数组和索引数组，返回索引对应的元素，同时从原数组中移除这些元素。
 * 【简介】此函数通过接收一个数组和索引数组，从原数组中提取索引对应的元素，返回新数组，并移除原数组中的这些元素。
 * 函数利用泛型支持多种数据类型，提供高效且灵活的处理方式。
 */
export function extractAndRemove<T>(array: T[], indexArray: number[]): T[] {
	// 检查输入参数是否有效
	if (!Array.isArray(array)) {
		throw new TypeError("输入的 array 必须是一个数组");
	}
	if (!Array.isArray(indexArray) || !indexArray.every(idx => Number.isInteger(idx))) {
		throw new TypeError("输入的 indexArray 必须是一个整数索引数组");
	}

	// 从索引数组中去重并排序，防止重复处理或越界问题
	const uniqueSortedIndices = [...new Set(indexArray)].sort((a, b) => b - a);


	// 创建结果数组存储被提取的元素
	const extractedElements: T[] = [];

	for (const index of uniqueSortedIndices) {
		// 跳过无效索引
		if (index >= 0 && index < array.length) {
			// 提取元素并从原数组中移除
			extractedElements.unshift(array.splice(index, 1)[0]);
		}
	}

	// 返回提取的元素数组
	return extractedElements;
}

/**
 * 【Prompt 优化】编写一个函数，接收一个泛型数组和索引数组，返回索引对应的元素，但不修改原数组。
 * 【简介】此函数通过接收一个数组和索引数组，提取对应索引的元素并返回新数组，保证原数组内容不被更改。
 * 函数利用泛型支持多种数据类型，提供高效且安全的处理方式。
 */
export function extractElements<T>(array: T[], indexArray: number[]): T[] {
	// 检查输入参数是否有效
	if (!Array.isArray(array)) {
		throw new TypeError("输入的 array 必须是一个数组");
	}
	if (!Array.isArray(indexArray) || !indexArray.every(idx => Number.isInteger(idx))) {
		throw new TypeError("输入的 indexArray 必须是一个整数索引数组");
	}

	// 从索引数组中去重
	const uniqueIndices = [...new Set(indexArray)];

	// 使用 map 提取索引对应的元素，过滤无效索引
	// 返回提取的元素数组
	return uniqueIndices
		.filter(index => index >= 0 && index < array.length)
		.map(index => array[index]);
}


export function randArray(length:number,min:number,max:number){
	return list(length-1).map(()=>random(min,max))
}
