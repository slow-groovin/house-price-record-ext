export interface PageState {
	pageIndex: number
	pageSize: number
}
export function calcOffset(pageIndex: number, pageSize: number): number {
	return (pageIndex - 1) * pageSize
}