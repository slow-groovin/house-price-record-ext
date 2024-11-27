// import {crawlHouse} from "@/entrypoints/reuse/house-control";
// import {browser} from "wxt/browser";
//
//
// export function openTabAndExec(url:string, func:(tabId:number)=>Promise<any>|any,closeTab=true){
// 	return new Promise<any>(async (resolve, reject) => {
// 		browser.tabs.create({url,active:false}, async (tab) => {
// 			if(!tab.id) {
// 				reject(false)
// 				return
// 			}
// 			const rs=await func(tab.id)
//
// 			if(closeTab){
// 				browser.tabs.remove(tab.id)
// 			}
//
// 			resolve(rs)
//
// 		})
// 	})
// }