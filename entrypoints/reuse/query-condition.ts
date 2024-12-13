import {HouseTaskQueryCondition} from "@/types/query-condition";
import {parseToType} from "@/utils/variable";
import {LocationQuery} from "vue-router";

/**
 * 将 query 转换为 QueryCondition变量, 类型T所有元素必须
 * @param template
 * @param query
 */
export function newQueryConditionFromQueryParam<T extends Record<string,string|number|boolean|undefined>>(template:T,query:LocationQuery):T {
	const condition: T = {} as T
	for (let k of Object.keys(template)) {
		if (query[k]) {
			const value = (typeof query[k] === 'string' ? query[k] : query[k][0]) as string
			//@ts-ignore
			condition[k] = parseToType(value, (typeof template[k]))
		}
	}
	return condition
}