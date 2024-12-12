export type TaskGroup={
	id?:number;
	name:string;
	idList:string[];

	createdAt: number;
	lastRunningAt?:number;

	notification?: boolean;
	notifyInterval?: number;
}


