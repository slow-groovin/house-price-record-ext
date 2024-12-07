import {onMessage} from "webext-bridge/background";


// export function registerCrawlHouseTask() {
// 	onMessage('crawlHouseTask', async ({data}) => {
// 		const {hid} = data as { hid: string }
// 		await oneHouseEntry(hid)
// 		return {resp: 'ok'}
// 	})
// }

export function registerSimpleMessage(){
	class A{
		constructor(public msg:string) {
			console.log("new A",msg)
		}
		echo(){console.log("msg is",this.msg)}
	}
	onMessage('simple',async ({})=>{
		return new A('aaa')
	})
}