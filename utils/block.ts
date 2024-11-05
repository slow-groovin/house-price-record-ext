import { storage, StorageItemKey } from "wxt/storage";


const debugRules=[
	{
		id: 20011,  // Unique rule ID
		priority: 11,  // Rule priority
		action: {type: "block"},  // Action to block the request
		condition: {
			urlFilter: "|https://www.api2o.com/img/blog/android",  // URL pattern
			"initiatorDomains" : ["www.api2o.com"],
			resourceTypes: ["image"]  // Resource type to block
		}
	},
	{
		id: 20012,  // Unique rule ID
		priority: 11,  // Rule priority
		action: {type: "block"},  // Action to block the request
		condition: {
			urlFilter: "|https://www.api2o.com/img/github",  // URL pattern
			"initiatorDomains" : ["www.not-exist.com"],
			resourceTypes: ["image"]  // Resource type to block
		}
	},
]

const ljMetricRules=[

	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17101,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			urlFilter: "||ajax.api.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17102,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			urlFilter: "||ex.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17103,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			urlFilter: "||dig.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "google" 的所有请求
		id: 17104,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			regexFilter: ".*google.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "baidu.com" 的所有请求
		id: 17105,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			regexFilter: ".||baidu.com",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "cnzz" 的所有请求
		id: 17106,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			regexFilter: "||cnzz.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "bdstatic" 的所有请求
		id: 17108,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			regexFilter: "||bdstatic.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "bdimg" 的所有请求
		id: 17109,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains : ["lianjia.com"],
			regexFilter: "||bdimg.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	}
]

const ljImgRules = [
	{
		// 阻止所有 .png, .jpg, .jpeg 文件
		id: 17001,
		priority: 1,
		action: { type: "block" },

		condition: {
			initiatorDomains : ["lianjia.com"],
			// urlFilter: "*",
			resourceTypes: ["image"]
		}
	},

];

const rules={
	debugRules,
	ljImgRules,
	ljMetricRules
}


export async function toggleRules(key:keyof typeof rules){
	const storageKey=`rules-toggle-${key}`
	const toggle=await storage.getItem<boolean>(`local:${storageKey}`,{fallback:false})
	if(!toggle){
		await storage.setItem(`local:${storageKey}`, true)
		updateRules(key)
	}else{
		await storage.setItem(`local:${storageKey}`, false)
		removeRules(key)
	}
}



export function updateRules(key:keyof typeof rules){
	browser.declarativeNetRequest.updateDynamicRules({
		//@ts-ignore
		addRules: rules[key],
		removeRuleIds: rules[key].map(rule => rule.id)
	});
}

export function removeRules(key:keyof typeof rules){
	browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: rules[key].map(rule => rule.id)
	});
}