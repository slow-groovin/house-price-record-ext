const MAX_BIT: 32 = 32
const START_DATE = new Date(2024, 0, 1, 0, 0, 0)
const EIGHT_HOUR= 8 * 60 * 60 * 1000
const DAY= 24 * 60 * 60 * 1000
export class AccessRecord {

	constructor(
		public bitmap: number[] = [],
		public startDate: Date = START_DATE
	) {
		this.startDate = new Date(this.startDate.setHours(0,0,0,0))
		// this.bitmap = [] // 存储位图数组
	}



	// 计算天数差
	getDaysSinceStart(date: Date) {
		//clip date到当天的23点59分, 这样无论是任何时区都是相同下标
		const diffTime = date.setHours(0,0,0,0) - this.startDate.getTime()
		return Math.floor(diffTime / (1000 * 60 * 60 * 24))
	}

	getEndDate():Date {
		return new Date(this.startDate.getTime()+this.bitmap.length*MAX_BIT*DAY)
	}

	// 获取某一天的访问状态 (true 表示有访问，false 表示没有访问)
	getAccessStatus(date: Date) {
		// debugger
		const dayIndex = this.getDaysSinceStart(date)
		const bitmapIndex = Math.floor(dayIndex / MAX_BIT) // 计算bitmap数组的索引
		const bitIndex = dayIndex % MAX_BIT // 计算在对应bitmap中的位
		const bitmap = (bitmapIndex < this.bitmap.length) ? this.bitmap[bitmapIndex] : 0 // 获取对应的位图
		return ifBit(bitmap, bitIndex)
	}

	// 设置某一天的访问状态
	setAccessStatus(date: Date, status: boolean) {
		const dayIndex = this.getDaysSinceStart(date)
		const bitmapIndex = Math.floor(dayIndex / MAX_BIT)
		const bitIndex = dayIndex % MAX_BIT

		if (bitmapIndex >= this.bitmap.length) {
			const left = bitmapIndex - this.bitmap.length + 1
			for (let i = 0; i < left; i++) {
				this.bitmap.push(0) // 填充0
			}
		}

		if (status) {
			this.bitmap[bitmapIndex] |= 1 << bitIndex // 设置为1
		} else {
			this.bitmap[bitmapIndex] &= ~(1 << bitIndex) // 设置为0
		}

	}

	getAccessRange(begin: Date, end: Date): boolean[] {
		let indexDate = begin
		const result = []
		while (indexDate.getTime() < end.getTime()) {
			result.push(this.getAccessStatus(indexDate))
			indexDate = new Date(indexDate.getTime() + 24 * 60 * 60 * 1000)
		}
		return result
	}

	// 初始化（导入）记录
	initialize(records: number[]) {
		this.bitmap = records.map(record => record) // 假设传入的记录为数组，每项为一个 BigInt
	}

	// 导出当前记录
	exportToString() {
		return this.bitmap.map(b => b.toString(2)) // 导出为数组，每项为十进制字符串
	}
}

function maskBit(target: number, bitIndex: number) {
	return target & (1 << bitIndex)
}

function ifBit(target: number, bitIndex: number) {
	return !(maskBit(target, bitIndex) === 0)
}
