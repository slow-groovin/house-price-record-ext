import {computed, Ref} from "vue";
import {max,min} from "radash";


export const XTime = (d: { x: Date, [k: string]: any }) => d.x.getTime()  //Scatter使用'X'会有bug不显示, 使用'XTime'就可以没问题
/**
 * 直接提取y
 */
export const Y = (d: any) => d.y
/**
 * 直接提取x
 */
export const X = (d: any) => d.x

export function graphWidth(dataLength: number, factor:number=7):string{
	return `${dataLength * factor}rem`
}
/**
 * 生成一个UnovisXYContainer用的yDomain: [min(data.value)-expendValue, max(data.value)+expendValue]
 * @param data 数据
 * @param expandValue 扩展的大小
 * @param option
 */
export function expandYDomain(data: any[] | undefined, expandValue: number, option?:{minZero?:boolean}): [number, number] {
	if (!data) return [0, 1000]
	const dataM=data.map(d=>d.y)
	let minValue=option?.minZero?0:min(dataM, d => d??expandValue) - expandValue
	minValue=minValue<0?0:minValue
	return [
		minValue,
		max(dataM, d => d??-expandValue) + expandValue
	]
}

/**
 * 把VisAxis中的一个x格式化为展示日期字符串
 * @param d
 */
export const tickFormatDate = (d: number) => {
	return new Date(d).toLocaleDateString()
}

/**
 * 提取x为时间, y为具体值的数据数组
 */
export function computeDataSequence<T extends {at:number}>(data: Ref<T []>, valFetcher: (item: T) => number | undefined) {
	return computed(() => {
		let index = 0
		//手动index，用以label稀疏显示


		return data.value
			?.map(item => ({y: valFetcher(item), x: item.at}))
			.filter(item => item.y!==undefined && item.y!==null)
			.sort((a, b) => a.x - b.x)
			.map(item => ({...item, index: index++}))
	})
}

/**
 * tooltipTrigger数, 显示格式为 `<日期>: <数值>` 需满足x为日期
 */
export const triggerWithDatePrefix = (d: {
	x: number | Date,
	y: number
}) => `${new Date(d.x).toLocaleDateString()}: <span class="text-primary">${d.y}</span>`