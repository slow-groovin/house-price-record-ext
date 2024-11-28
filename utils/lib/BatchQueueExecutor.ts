/**
 * 管理批量任务, 包含:
 * 1. semaphore实现排队任务
 * 2. 失败重试逻辑
 * 3. 计时,进度条, 估计
 * 4. 中断等待
 */
import {Semaphore} from "@/utils/lib/Semaphore";
import {sleep} from "radash";

export type JobContext = { id: string, } & Record<string, any>
export type Job = {
	promiseGetter: () => Promise<any>,
	context: JobContext
}

export type ExecutorConfig = {
	retryTimes: number;
	timeout?: number;
	interval: number;
	maxConcurrent: number;
	log?: boolean;
	onDoneCountUpdateHook?: () => void;
	onRunCountUpdateHook?: () => void;
	onFinishedHook?: () => void;
	onPauseHook?: (context?: JobContext, error?: Error) => void;

	onJobStartHook?: (context: JobContext) => void;
	onJobEndHook?: (context: JobContext) => void;
	onJobRetryHook?: (context: JobContext, error: Error) => void;
	onJobFailHook?: (context: JobContext, error: Error) => void;
}

export class BatchQueueExecutor {

	public doneCost: number = 0;
	public isPaused: boolean = false;
	public retryCount: number = 0;
	public failedCount: number = 0;
	public pauseCount: number = 0;
	private pauseQueue: ((v: unknown) => void)[] = [];
	private semaphore: Semaphore;

	private canLog: boolean = false;
	private LOG_PREFIX = '[BatchQueueExecutor]'


	constructor(private jobIter: IterableIterator<Job>, private config: ExecutorConfig) {
		this.semaphore = new Semaphore(config.maxConcurrent);
		this.canLog = !!config.log
	}

	private _doneCount: number = 0;

	get doneCount() {
		return this._doneCount
	}

	private set doneCount(_doneCount: number) {
		this._doneCount = _doneCount
		noThrowRun(this.config.onDoneCountUpdateHook)
	}

	private _runCount: number = 0;

	get runCount() {
		return this._runCount
	}

	private set runCount(_runCount: number) {
		this._runCount = _runCount
		noThrowRun(this.config.onRunCountUpdateHook)
	}

	public manualPause() {
		this.isPaused = true
		noThrowRun(() => this.config.onPauseHook?.())
	}

	/**
	 * pause bcz job throw StopError, return a promise to wait for resume
	 */
	public pause(context: JobContext, err: Error) {
		this.isPaused = true
		this.pauseCount++
		noThrowRun(() => this.config.onPauseHook?.(context, err))

		return new Promise((resolve) => {
			this.pauseQueue.push(resolve)
		})
	}


	public async resume() {
		this.isPaused = false
		this.pauseQueue.forEach(f=>{
			f('ok')
		})
	}

	/**
	 * 运行中如果遇到pause,则等待
	 */
	private async waitResume(){
		if(!this.isPaused) return
		return new Promise((resolve) => {
			this.pauseQueue.push(resolve)
		})
	}


	public async run() {
		let finishResolve = (value: unknown): void => {
			throw new Error('unset finish resolve')
		};
		const finishPromise = new Promise((resolve) => {
			finishResolve = resolve
		})


		while (true) {
			await this.waitResume()
			await this.semaphore.take()
			//after take semaphore
			await this.waitResume()


			let curJob: Job
			let next = this!.jobIter.next()
			curJob = next.value

			//no more job, finish
			if (!curJob) {
				this.finish()
				finishResolve('finish')
				break;
			}

			//async start job of 'next'
			(async () => {
				const startAt = Date.now()
				this.runCount++


				let retryTime = 0
				let isJobSuc = false
				let lastError:Error=new Error("empty error")
				const {context, promiseGetter} = curJob
				noThrowRun(() => this.config.onJobStartHook?.(context))

				while (retryTime < this.config.retryTimes + 1) {

					try {
						const promise = promiseGetter()
						await promise // job exec
						isJobSuc = true
						break
					} catch (e) {
						lastError=e as Error
						//match stop error
						if (e instanceof NoRetryError) {
							this.canLog && console.error(this.LOG_PREFIX, '[no retry]', e)
							break
						}
						if (e instanceof PauseError) { //pause exception
							this.canLog && console.log(this.LOG_PREFIX, '[pause]',context.id, e)

							await this.pause(context,e) //pause ,wait resume
							this.canLog && console.log(this.LOG_PREFIX, '[resume]',context.id)
							retryTime--
						}
						//no match stop error, mark retry and go next loop
						this.canLog && console.log(this.LOG_PREFIX, '[retry]', retryTime, e)
						retryTime++
						this.retryCount++ //global retry count
						noThrowRun(() => this.config.onJobRetryHook?.(context,lastError))
					}
				}

				if (isJobSuc) {
					noThrowRun(() => this.config.onJobEndHook?.(context))
				} else {
					this.failedCount++
					noThrowRun(() => this.config.onJobFailHook?.(context,lastError))
				}

				this.doneCount++
				this.doneCost += Date.now() - startAt

				this.canLog && console.log(`${this.LOG_PREFIX}doneCount: ${this.doneCount}`)

				await sleep(this.config.interval)//执行等待interval
				this.semaphore.free()
			})().then(() => {
				this.canLog && console.log(this.LOG_PREFIX, 'one exec procedure done.', curJob.context.id)
			})

		}
		return finishPromise
	}

	private finish() {
		this.canLog && console.log(this.LOG_PREFIX, 'finish')
		noThrowRun(() => this.config.onFinishedHook?.())
	}


}

export class NoRetryError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'NoRetryError'
	}
}

export class PauseError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'PauseError'
	}
}

function noThrowRun(func?: Function) {
	if (!func) return
	try {
		return new Promise((resolve) => {
			func()
			resolve('ok')
		}).then(() => {
		})

	} catch (e) {
		console.error(e)
	}
}