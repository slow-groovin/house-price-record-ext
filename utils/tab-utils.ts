import {browser, Tabs} from "wxt/browser";
import {NoRetryError} from "@/utils/lib/BatchQueueExecutor";


export async function openTabAndRun<T>(option: Tabs.CreateCreatePropertiesType,action: (tab:Tabs.Tab) => Promise<T>) {
	const tab=await browser.tabs.create(option)
	if(!tab || !tab.id){
		throw new NoRetryError( 'tab id is undefined.')
	}
	const rs=await action(tab)
	browser.tabs.remove(tab.id)
	return rs
}