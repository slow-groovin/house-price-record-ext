import {storage} from "wxt/storage";
import {browser} from "wxt/browser";


const debugRules = [
	{
		id: 20011,  // Unique rule ID
		priority: 11,  // Rule priority
		action: {type: "block"},  // Action to block the request
		condition: {
			urlFilter: "|https://www.api2o.com/img/blog/android",  // URL pattern
			"initiatorDomains": ["www.api2o.com"],
			resourceTypes: ["image"]  // Resource type to block
		}
	},
	{
		id: 20012,  // Unique rule ID
		priority: 11,  // Rule priority
		action: {type: "block"},  // Action to block the request
		condition: {
			urlFilter: "|https://www.api2o.com/img/github",  // URL pattern
			"initiatorDomains": ["www.not-exist.com"],
			resourceTypes: ["image"]  // Resource type to block
		}
	},
]

const ljMetricRules = [

	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17101,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||ajax.api.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17102,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||ex.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17103,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||dig.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest", "other", "ping"]
		}
	},
	{
		// 阻止包含 "google" 的所有请求
		id: 17104,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*google.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "baidu.com" 的所有请求
		id: 17105,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*baidu.*",
			// urlFilter: "||baidu.com",
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
			// excludedResourceTypes:["main_frame"]
		}
	},
	{
		// 阻止包含 "cnzz" 的所有请求
		id: 17106,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*cnzz.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "bdstatic" 的所有请求
		id: 17108,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*bdstatic.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "bdimg" 的所有请求
		id: 17109,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*bdimg.*",
			resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
		}
	},
	{
		// 允许包含 "ljCdn" 的图片
		id: 17110,
		priority: 10,
		// action: { type: "block" },
		action: {type: "allow"},
		condition: {
			initiatorDomains: ["hip.lianjia.com"],
			urlFilter: "||s1.ljcdn.com/",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
	{
		// 阻止包含 "baidu.com" 的所有请求
		id: 17111,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||mediav.com",
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
			// excludedResourceTypes:["main_frame"]
		}
	},
	{
		// 阻止包含 "baidu.com" 的所有请求
		id: 17112,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||cdnmaster.com",
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
			// excludedResourceTypes:["main_frame"]
		}
	},
	{
		// 允许包含 "geetest.com" 的图片
		id: 17120,
		priority: 10,
		// action: { type: "block" },
		action: {type: "allow"},
		condition: {
			initiatorDomains: ["clogin.lianjia.com"],
			// urlFilter: "||geetest.com",
			// resourceTypes: ["image", "script", "xmlhttprequest"]
		}
	},
]

const ljImgRules = [
	{
		// 阻止所有 .png, .jpg, .jpeg 文件
		id: 17001,
		priority: 9,
		action: {type: "block"},

		condition: {
			initiatorDomains: ["lianjia.com"],
			// urlFilter: "*",
			resourceTypes: ["image"]
		}
	},

];


export const rules = {
	debugRules,
	ljImgRules,
	ljMetricRules
}

export const allBlockRuleKeys: (keyof typeof rules)[] = ['debugRules', 'ljImgRules', 'ljMetricRules']


export async function toggleRules(key: keyof typeof rules) {
	const storageKey = `rules-toggle-${key}`
	const toggle = await storage.getItem<boolean>(`local:${storageKey}`, {fallback: false})
	if (!toggle) {
		await storage.setItem(`local:${storageKey}`, true)
		updateRules(key)
	} else {
		await storage.setItem(`local:${storageKey}`, false)
		removeRules(key)
	}
}

export async function clearRules(){
	const _rules = await browser.declarativeNetRequest.getDynamicRules()

	if (browser.runtime.lastError) {
		console.error(browser.runtime.lastError.message);
		return;
	}
	await browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: _rules.map(rule => rule.id)
	})
	console.log('[block.ts]Clear all rules:', _rules.map(r=>r.id));
}
export async function updateRules(key: keyof typeof rules) {
	await browser.declarativeNetRequest.updateDynamicRules({
		// @ts-ignore
		addRules: rules[key],
	});
	console.log('[block.ts]update new rules done:');
}

export function removeRules(key: keyof typeof rules) {
	browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: rules[key].map(rule => rule.id)
	});
}

