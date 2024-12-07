import {isNullOrUndefined} from "@/utils/variable";

export function tryMinusOrUndefined(n1?: number, n2?: number) {
	if (typeof n1 === 'number' && typeof n2 === 'number')
		return n1 - n2
	return undefined
}

export function tryLessThanOrFalse(n1?: number, n2?: number):boolean{

	if(isNullOrUndefined(n1)||isNullOrUndefined(n2)) return false
	return n1 < n2
}

export function tryGreaterThanOrFalse(n1?: number, n2?: number):boolean{
	if(isNullOrUndefined(n1)||isNullOrUndefined(n2)) return false
	return n1 > n2
}