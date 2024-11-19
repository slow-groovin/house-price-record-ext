export type DexieSampleItem= {
	id?: number;
	name: string;
	price: number;
	createdAt: number; // Timestamp
}

export type DebugInfo={
	id?:number;
	msg:string;
	at: string;
}