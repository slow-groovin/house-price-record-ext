import {random, toInt} from "radash";

/**
 * 返回一个[0, 原始数值*2]的随机数, 且与原始数不相同
 */
export function doubleRand(n:any){
	const raw=toInt(n)
	let rand = random(0,raw*2)
	if(rand==raw) rand+=1
	return rand
}

/**
 * 返回一个[原始数值-ratio*原始数值, 原始数值+ratio*原始数值]的随机数, 且与原始数不相同
 */
export function ratioRand(num:any, ratio:number){
	const raw=toInt(num)
	let rand = raw + random(toInt(-ratio*raw),toInt(ratio*raw))
	if(rand==raw) rand+=1
	return rand
}