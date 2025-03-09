import {browser,Tabs,} from "wxt/browser";

type Tab = Tabs.Tab;

/**
 * 查询当前浏览器 IndexedDB 数据库已占用的空间大小
 * @returns 已占用空间大小（字节数）和配额信息
 */
export async function getIndexedDBUsage() {
	// 检查浏览器是否支持 StorageManager API
	if (!navigator.storage || !navigator.storage.estimate) {
		throw new Error("当前浏览器不支持 StorageManager API。");
	}

	// 获取存储估算信息
	const estimate = await navigator.storage.estimate();
	return {
		usage: (estimate.usage ?? 0)/(1024*1024), // 已使用的存储空间，单位为字节
		quota: (estimate.quota ?? 0)/(1024*1024*1024), // 可用的存储配额，单位为字节
		percentage: (estimate.usage??0) / (estimate.quota??1) * 100
	};
}


/**
 * 创建标签页并等待加载完成
 * @returns {Promise<browser.tabs.Tab>} - 加载完成后的标签页对象
 * @param tab
 */
export async function waitForTabLoad(tab:Tab): Promise<any> {

	let listener:any
	return new Promise((resolve) => {
		listener = (tabId: number, changeInfo: any) => {
			if (tabId === tab.id && changeInfo.status === "complete") {
				browser.tabs.onUpdated.removeListener(listener); // 取消监听
				resolve(tab); // 返回标签页对象
			}
		};
		// 监听标签页更新事件
		browser.tabs.onUpdated.addListener(listener);
	}).finally(()=>{
		console.log('finally remove listener')
		browser.tabs.onUpdated.removeListener(listener);
	});
}

// 用户离开时确认
const unloadEvent = (event: BeforeUnloadEvent) => {
  event.preventDefault();
}

function preventUnload(){
	window.addEventListener('beforeunload',unloadEvent)
}

function cancelPreventUnload(){
	window.removeEventListener('beforeunload',unloadEvent)
}

export function usePreventUnload(){
	return {preventUnload,cancelPreventUnload}
}