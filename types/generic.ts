export type Maybe<T> = T | undefined | null

export type RemoveNull<T> = T extends null ? never : T;
export function removeNull<T>(value: T | null | undefined): T | undefined {
	if (value === null) {
		return undefined;
	}
	return value;
}