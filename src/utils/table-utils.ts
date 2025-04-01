export interface PageState {
  pageIndex: number;
  pageSize: number;
}
export function calcOffset(pageIndex: number, pageSize: number): number {
  if (!pageIndex) return 0;
  return (pageIndex - 1) * pageSize;
}
