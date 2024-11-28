/**
 * 管理批量任务, 包含:
 * 1. semaphore实现排队任务
 * 2. 失败重试逻辑
 * 3. 计时,进度条, 估计
 * 4. 中断等待
 */
import {Semaphore} from "@/utils/lib/Semaphore";


export type ExecutorConfig={
	retryTimes:number;
	timeout:number;
	interval:number;
	maxConcurrent:number;
	onDoneCountUpdateHook?:()=>void;
	onRunCountUpdateHook?:()=>void;
}

export class BatchQueueExecutor {

	public config: ExecutorConfig;

	jobGenerator?: ()=>Promise<any>|undefined;
	private semaphore: Semaphore;
	private _doneCount:number=0;
	private _runCount:number=0;
	public doneCost:number=0;

	constructor(config: ExecutorConfig) {
		this.config = config;
		this.semaphore = new Semaphore(config.maxConcurrent);
	}

	public async exec<T>(getter:() => Promise<T>) {
		await this.semaphore.take()
		const startAt=Date.now()
		this.runCount++

		const promise=getter()
		await promise


		this.doneCost+=Date.now()-startAt
		this.doneCount++
		this.semaphore.free()
	}

	 get doneCount() {
		return this._doneCount
	}
	get runCount() {
		return this._runCount
	}

	private set doneCount(_doneCount:number){
		this._doneCount=_doneCount
		this.config?.onDoneCountUpdateHook?.()
	}
	private set runCount(_runCount:number){
		this._runCount=_runCount
		this.config?.onRunCountUpdateHook?.()
	}




}