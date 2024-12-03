import { formatDistanceToNowStrict, isDate } from 'date-fns'

/**
 * 返回输入时间距离当前的距离,如果小于24小时仅返回小时单位, 超过24小时仅返回天数但额外i, (封装date-fns)
 */
export function formatDistanceToNowHoursOrDays(date: any) {


	if ( (!date || !isDateValue(date) ) && typeof date !=='number'){
		return '- ago'
	}

	const dateObj = new Date(date)

	const differenceInHours = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60)
	if (differenceInHours < 24) {
		return formatDistanceToNowStrict(dateObj, { addSuffix: true, unit: 'hour' })
	} else {
		return formatDistanceToNowStrict(dateObj, { addSuffix: true, unit: 'day' })
	}


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