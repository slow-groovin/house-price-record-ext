import {formatDistanceToNowStrict, isDate} from 'date-fns'
import {CalendarDate, getLocalTimeZone} from "@internationalized/date";
import {zhCN} from 'date-fns/locale/zh-CN'

/**
 * 返回输入时间距离当前的距离,如果小于24小时仅返回小时单位, 超过24小时仅返回天数但额外i, (封装date-fns)
 */
export function formatDistanceToNowHoursOrDays(date: any) {


	if ( (!date || !isDateValue(date) ) && typeof date !=='number'){
		return '- ago'
	}

	const dateObj = new Date(date)

	return formatDistanceToNowStrict(dateObj, { addSuffix: true,  locale: zhCN })
}

/**
 * 相比isDate()增加了: 如果是string,尝试构造Date并判断是否成功
 * @param value
 */
export function isDateValue(value: string | number | Date | any) {
	if (typeof value === 'string' || typeof value === 'object') {
		const date = new Date(value)
		return !isNaN(date.getDate())
	}
	return isDate(value)
}

export function calendarDateToDate(calendarDate?:CalendarDate){
	return calendarDate?.toDate(getLocalTimeZone())
}


export function ISODateStringOfDaysBefore(day:number):string{
	const date = new Date();
	date.setDate(date.getDate() - day);
	return date.toISOString().split('T')[0];

}