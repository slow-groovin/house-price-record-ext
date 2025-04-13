export class Semaphore {
	private readonly resolvers: Array<() => void> = []

	public constructor (private counter = 0) {
	}

	public count(){
		return this.counter
	}

	public async take (): Promise<void> {
		await new Promise<void>(resolve => {
			this.counter--
			if (this.counter < 0) {
				this.resolvers.push(resolve)
			} else {
				// Resolve immediately
				resolve()
			}
		})
	}

	public tryTake (): boolean {
		if (this.counter <= 0) {
			return false
		}

		this.counter--
		return true
	}

	private static async wait (millis: number): Promise<void> {
		await new Promise<void>(resolve => {
			setTimeout(resolve, millis)
		})
	}

	async tryTakeWithin (millis: number): Promise<boolean> {
		let alreadyTimedOut = false
		return await Promise.race([
			this.take().then(() => {
				// Promises offer no 'cancel' feature, therefore the take()
				// must be undone in case of a timeout.
				if (alreadyTimedOut) {
					this.free()

					// Since the other promise won anyway, this return value
					// will actually be ignored by Promise.race.
					return false
				} else {
					return true
				}
			}),
			Semaphore.wait(millis).then(() => {
				alreadyTimedOut = true
				return false
			})
		])
	}

	public free (): void {
		this.counter++

		if (this.resolvers.length >= 1) {
			// Resolve exactly one waiting take() promise!
			const resolver = this.resolvers.shift()

			/* istanbul ignore if */
			if (resolver === undefined) {
				// eslint-disable-next-line no-multi-str
				throw new Error('Semaphore free: internal data structure \
 corrupted. Internal buffer of unfulfilled promises \
 either empty or contains an "undefined" value.')
			}

			resolver()
		}
	}
}