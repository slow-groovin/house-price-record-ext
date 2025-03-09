const MAX_BIT = 32;
const START_DATE = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
const EIGHT_HOUR = 8 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

export class AccessRecord {
	constructor(
		public startDate: Date = START_DATE,
		public bitmap: Uint32Array = new Uint32Array(0),
	) {
		this.startDate = new Date( new Date(this.startDate).setHours(0, 0, 0, 0));
	}

	static fromAccessRecord(anotherAccessRecord: AccessRecord) {
		return new AccessRecord(
			anotherAccessRecord.startDate,
			new Uint32Array(anotherAccessRecord.bitmap),
		);
	}

	getDaysSinceStart(date: Date) {
		const diffTime = date.setHours(0, 0, 0, 0) - this.startDate.getTime();
		return Math.floor(diffTime / (1000 * 60 * 60 * 24));
	}

	getEndDate(): Date {
		return new Date(this.startDate.getTime() + this.bitmap.length * MAX_BIT * DAY);
	}

	getAccessStatus(date: Date) {
		const dayIndex = this.getDaysSinceStart(date);
		const bitmapIndex = Math.floor(dayIndex / MAX_BIT);
		const bitIndex = dayIndex % MAX_BIT;
		return (
			bitmapIndex < this.bitmap.length &&
			((this.bitmap[bitmapIndex] >> bitIndex) & 1) === 1
		);
	}

	setAccessStatus(date: Date, status: boolean) {
		const dayIndex = this.getDaysSinceStart(date);
		const bitmapIndex = Math.floor(dayIndex / MAX_BIT);
		const bitIndex = dayIndex % MAX_BIT;

		if (bitmapIndex >= this.bitmap.length) {
			const newLength = bitmapIndex + 1;
			const newBitmap = new Uint32Array(newLength);
			newBitmap.set(this.bitmap);
			this.bitmap = newBitmap;
		}

		const mask = 1 << bitIndex;
		if (status) {
			this.bitmap[bitmapIndex] |= mask;
		} else {
			this.bitmap[bitmapIndex] &= ~mask;
		}
	}

	getAccessRange(begin: Date, end: Date): boolean[] {
		let indexDate = begin;
		const result = [];
		while (indexDate.getTime() < end.getTime()) {
			result.push(this.getAccessStatus(indexDate));
			indexDate = new Date(indexDate.getTime() + 24 * 60 * 60 * 1000);
		}
		return result;
	}

	initialize(records: Uint32Array) {
		this.bitmap = new Uint32Array(records);
	}

	exportToString() {
		return Array.from(this.bitmap, (b) => b.toString(2).padStart(8, '0')).join('');
	}
}