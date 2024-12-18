/**
 * 管理批量任务, 包含:
 * 1. semaphore实现排队任务
 * 2. 失败重试逻辑
 * 3. 计时,进度条, 估计
 * 4. 中断等待
 */
import {Semaphore} from "@/utils/lib/Semaphore";
import {sleep} from "radash";
import EventEmitter from 'eventemitter3';

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
}

// 定义事件与消息的类型映射
interface MyEvents {
	onStart: void;
	onFinished: void;
	onPause: (context?: JobContext, error?: Error) => void;
	onResume: void;
	onJobStart: (context: JobContext) => void;
	onJobEnd: (context: JobContext) => void;
	onJobRetry: (context: JobContext, error: Error) => void;
	onJobFail: (context: JobContext, error: Error) => void;
}

type Args<T> = T extends (...args: infer P) => any ? P : [];
type ParametersWrapper<T> = T extends (...args: any[]) => any ? Args<T> : [];


export class BatchQueueExecutor {
	public doneCost: number = 0;
	public isInit: boolean = true;
	public isRunning: boolean = false;
	public isFinished: boolean = false;
	public isPaused: boolean = false;
	public retryCount: number = 0;
	public failedCount: number = 0;
	public pauseCount: number = 0;
	public runningPromise: Promise<any>[] = [];
	public runningIds: string[] = [];
	private emitter: EventEmitter = new EventEmitter();
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
	}

	private _runCount: number = 0;

	get runCount() {
		return this._runCount
	}

	private set runCount(_runCount: number) {
		this._runCount = _runCount
	}

	// 重写 emit 方法以支持事件类型检查
	emit<K extends keyof MyEvents>(event: K, ...args: Args<MyEvents[K]>): boolean {
		return this.emitter.emit(event, ...args);
	}

	// 重写 on 方法以支持事件类型检查
	on<K extends keyof MyEvents>(event: K, listener: (...args: Args<MyEvents[K]>) => void): EventEmitter {
		return this.emitter.on(event, listener);
	}

	public manualPause() {
		this.isPaused = true
		this.isRunning = false
		this.emit('onPause', {id: '-1'}, new Error('manual pause'))
	}

	/**
	 * pause bcz job throw StopError, return a promise to wait for resume
	 */
	public pause(context: JobContext, err: Error) {
		this.isPaused = true
		this.isRunning = false
		this.pauseCount++
		this.emit('onPause', context, err)
		return new Promise((resolve) => {
			this.pauseQueue.push(resolve)
		})
	}


	public async resume() {
		this.isPaused = false
		this.isRunning = true
		this.pauseQueue.forEach(f => {
			f('continue')
		})
		this.emit('onResume')
	}

	public async run() {
		this.isRunning = true
		this.isInit = false
		this.emit('onStart')


		while (!this.isFinished) {
			await this.waitResume()
			await this.semaphore.take()

			let curJob: Job
			let next = this!.jobIter.next()
			curJob = next.value

			//no more job, finish
			if (!curJob) {
				this.finish()
				break;
			}

			//async start job of 'next'
			const asyncJobExec = (async () => {
				const startAt = Date.now()
				this.runCount++


				let retryTime = 0
				let isJobSuc = false
				let lastError: Error = new Error("empty error")
				const {context, promiseGetter} = curJob
				this.emit('onJobStart', context)

				while (retryTime < this.config.retryTimes + 1) {

					try {
						const promise = promiseGetter()
						await promise // job exec
						isJobSuc = true
						break
					} catch (_e: any) {
						const e = _e as Error
						lastError = e as Error
						//match stop error
						if (e instanceof NoRetryError || e.name === 'NoRetryError') {
							this.canLog && console.error(this.LOG_PREFIX, '[no retry]', e)
							break
						}
						if (e instanceof PauseError || e.name === 'PauseError') { //pause exception
							this.canLog && console.log(this.LOG_PREFIX, '[pause]', context.id, e)

							await this.pause(context, e) //pause ,wait resume
							this.canLog && console.log(this.LOG_PREFIX, '[resume]', context.id)
							retryTime--
						}
						//no match stop error, mark retry and go next loop
						this.canLog && console.log(this.LOG_PREFIX, '[retry]', retryTime, e)
						retryTime++
						this.retryCount++ //global retry count

						this.emit('onJobRetry', context, lastError)
					}
				}

				if (isJobSuc) {
					this.emit('onJobEnd', context)
				} else {
					this.failedCount++
					this.emit('onJobFail', context, lastError)
				}

				this.doneCount++
				this.doneCost += Date.now() - startAt

				this.canLog && console.log(`${this.LOG_PREFIX}doneCount: ${this.doneCount}`)

				await sleep(this.config.interval)//执行等待interval
				this.semaphore.free()
			})()

			this.runningPromise.push(asyncJobExec)
			this.runningIds.push(curJob.context.id)
			asyncJobExec.finally(() => {
				this.runningPromise.splice(this.runningPromise.indexOf(asyncJobExec), 1)
				this.runningIds.splice(this.runningIds.indexOf(curJob.context.id), 1)
			})

			// 	.then(() => {
			// 	this.canLog && console.log(this.LOG_PREFIX, 'one exec procedure done.', curJob.context.id)
			// })

		}
	}

	public manualForceFinish() {
		this.isRunning = false
		this.isPaused = false
		this.isFinished = true
		this.emit('onFinished')
	}

	/**
	 * 运行中如果遇到pause,则等待
	 */
	private async waitResume() {
		if (!this.isPaused) return
		return new Promise((resolve) => {
			this.pauseQueue.push(resolve)
		})
	}

	private finish() {
		this.isRunning = false

		//等待剩余的都结束
		Promise.all(this.runningPromise).then(() => {
			this.canLog && console.log(this.LOG_PREFIX, 'finish')
			this.emit('onFinished')
			this.isFinished = true

		})


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