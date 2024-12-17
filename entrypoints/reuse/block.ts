import {storage} from "wxt/storage";
import {browser} from "wxt/browser";
import {omit} from "radash";


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

export const ljMetricRules = [

	{
		// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
		id: 17101,
		priority: 1,
		action: {type: "block"},
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||ajax.api.lianjia.com",
			resourceTypes: ["image", "script", "xmlhttprequest"]
		},
		action_desc:'阻止所有 ajax.api.lianjia.com 的图片/脚本/请求',
		effect_desc:'阻止广告/推荐数据的请求',
		default_on:false,
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
		},
		action_desc:'阻止所有 ex.lianjia.com的图片/脚本/请求',
		effect_desc:'阻止发往ex.lianjia.com的行为分析上报请求',
		default_on:true,
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
		},
		action_desc:'阻止所有 dig.lianjia.com的图片/脚本/请求',
		effect_desc:'阻止上报操作行为数据',
		default_on:true,
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
		},
		action_desc:'阻止所有 google.* 的请求',
		effect_desc:'阻止发送数据到Google分析服务',
		default_on: false,
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
		},
		action_desc:'阻止所有 baidu.com 的请求',
		effect_desc:'阻止百度广告行为数据上报',
		default_on: false,
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
		},
		action_desc: '阻止所有 cnzz.* 的请求',
		effect_desc: '阻止cnzz统计行为数据上报',
		default_on: false,
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
		},
		action_desc: '阻止所有 bdstatic.* 的请求',
		effect_desc: '阻止百度统计行为数据上报',
		default_on: false,
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
		},
		action_desc: '阻止所有 bdimg.* 的请求',
		effect_desc: '阻止百度地图行为数据上报',
		default_on: false,
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
		},
		action_desc: '允许所有 ljcdn.com 的图片',
		effect_desc: '允许图片加载',
		default_on: true,
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
		},
		action_desc: '阻止所有 mediav.com 的请求',
		effect_desc: '阻止mediav的用户行为追踪请求',
		default_on: false,
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
		},
		action_desc: '阻止所有 cdnmaster.com 的请求',
		effect_desc: '阻止cdnmaster.com的用户行为追踪请求',
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
		},
		action_desc: '允许所有 geetest.com 的图片',
		effect_desc: '允许在登陆页加载验证码图片',
		default_on: true,
		must_on:true,
	},
]


const ljRulesWithoutDesc=ljMetricRules.map(rule=>omit(rule, ["action_desc","effect_desc","default_on","must_on"]))
console.log(ljRulesWithoutDesc)
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
export async function updateLjRulesById(removeRuleIds:number[], addRuleIds:number[]){

	await browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds:ljRulesWithoutDesc.map(r=>r.id),
		//@ts-ignore
		addRules: addRuleIds.map(id=>ljRulesWithoutDesc.find(rule=>rule.id==id))
	});
}

export function removeRules(key: keyof typeof rules) {
	browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: rules[key].map(rule => rule.id)
	});
}

