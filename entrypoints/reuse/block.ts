import { browser } from "wxt/browser";
import { omit } from "radash";
import { storage } from "wxt/storage";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";

const { isDebug } = useDevSetting()
let debugRules: any[] = []
if (isDebug) {
	debugRules = [
		// {
		// 	// 阻止所有 .jpg, .jpg, .jpeg 文件
		// 	id: 17001,
		// 	priority: 9,
		// 	action: {type: "block"},
		//
		// 	condition: {
		// 		initiatorDomains: ["lianjia.com"],
		// 		// urlFilter: "*",
		// 		resourceTypes: ["image"]
		// 	}
		// },
		{
			// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
			id: 17101,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				urlFilter: "||ajax.api.lianjia.com",
				resourceTypes: ["image", "script", "xmlhttprequest"]
			},
			action_desc: '阻止所有 ajax.api.lianjia.com 的图片/脚本/请求',
			effect_desc: '阻止广告/推荐数据的请求',
			default_on: false,
		},
		{
			// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
			id: 17102,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				urlFilter: "||ex.lianjia.com",
				resourceTypes: ["image", "script", "xmlhttprequest"]
			},
			action_desc: '阻止所有 ex.lianjia.com的图片/脚本/请求',
			effect_desc: '阻止发往ex.lianjia.com的行为分析上报请求',
			default_on: true,
		},
		{
			// 阻止 https://dig.lianjia.com, https://ajax.api.lianjia.com, https://ex.lianjia.com 的所有请求
			id: 17103,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				urlFilter: "||dig.lianjia.com",
				resourceTypes: ["image", "script", "xmlhttprequest", "other", "ping"]
			},
			action_desc: '阻止所有 dig.lianjia.com的图片/脚本/请求',
			effect_desc: '阻止上报操作行为数据',
			default_on: true,
		},
		{
			// 阻止包含 "google" 的所有请求
			id: 17104,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				regexFilter: ".*google.*",
				resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest"]
			},
			action_desc: '阻止所有 google.* 的请求',
			effect_desc: '阻止发送数据到Google分析服务',
			default_on: false,
		},
		{
			// 阻止包含 "baidu.com" 的所有请求
			id: 17105,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				regexFilter: ".*baidu.*",
				// urlFilter: "||baidu.com",
				resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
				// excludedResourceTypes:["main_frame"]
			},
			action_desc: '阻止所有 baidu.com 的请求',
			effect_desc: '阻止百度广告行为数据上报',
			default_on: false,
		},
		{
			// 阻止包含 "cnzz" 的所有请求
			id: 17106,
			priority: 1,
			action: { type: "block" },
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
			action: { type: "block" },
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
			action: { type: "block" },
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
			action: { type: "allow" },
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
			id: 17112,
			priority: 1,
			action: { type: "block" },
			condition: {
				initiatorDomains: ["lianjia.com"],
				urlFilter: "||cdnmaster.com",
				resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
				// excludedResourceTypes:["main_frame"]
			},
			action_desc: '阻止所有 cdnmaster.com 的请求',
			effect_desc: '阻止cdnmaster.com的用户行为追踪请求',
			default_on: true,
		}
	]
}


export const ljMetricRules: any[] = [
	...debugRules,
	{
		// 允许包含 "geetest.com" 的图片
		id: 17120,
		priority: 10,
		// action: { type: "block" },
		action: { type: "allow" },
		condition: {
			initiatorDomains: ["lianjia.com"],
			// urlFilter: "||geetest.com",
			// resourceTypes: ["image", "script", "xmlhttprequest"]
		},
		action_desc: '允许所有 geetest.com 的图片',
		effect_desc: '允许在登陆页加载验证码图片',
		default_on: true,
		must_on: true,
	},
	{
		id: 18010,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||www.google-analytics",
			resourceTypes: ["xmlhttprequest"]
		},
		action_desc: '阻止google-analytics统计访问数据',
		effect_desc: '阻止所有发向 www.google-analytics.com 的请求',
		default_on: false,
	},
	//www.googletagmanager.com
	{
		id: 18012,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||www.googletagmanager.com",
			resourceTypes: ["xmlhttprequest", "script"]
		},
		action_desc: '阻止googletagmanager进行营销分析',
		effect_desc: '阻止所有发向 www.googletagmanager.com 的请求',
		default_on: false,
	},

	{
		id: 18020,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||dig.lianjia.com",
			resourceTypes: ["xmlhttprequest", "ping", "media", "image", "script", "other"]
		},
		action_desc: '阻止lianjia统计用户浏览网页的行为信息(用以参与决策制定买方价格底线)',
		effect_desc: '阻止所有发向 dig.lianjia.com 的请求/图片/ping',
		default_on: true,
	},


	{
		id: 18029,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".*baidu.*",
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
		},
		action_desc: '阻止百度相关的所有营销/行为分析/功能请求: 营销分析,位置上报,用户行为分析,百度地图内嵌等等',
		effect_desc: '阻止所有url中包含 *.*baidu.* 的任何请求',
		default_on: false,
	},
	// {
	// 	id: 18030,
	// 	priority: 1,
	// 	action: {type: 'block'},
	// 	condition: {
	// 		initiatorDomains: ["lianjia.com"],
	// 		regexFilter: ".*baidu.*",
	// 		urlFilter: "||hm.baidu.com",
	// 		resourceTypes: ["xmlhttprequest", "ping", "media", "image", "script", "other"]
	// 	},
	// 	action_desc: '阻止百度统计通过伪装为图片请求的方式统计用户信息',
	// 	effect_desc: '阻止所有发向 hm.lianjia.com 的请求/图片/ping',
	// 	default_on: true,
	// },
	//
	// {
	// 	id: 18040,
	// 	priority: 1,
	// 	action: {type: 'block'},
	// 	condition: {
	// 		urlFilter: "||miao.baidu.com",
	// 		resourceTypes: ["xmlhttprequest"]
	// 	},
	// 	action_desc: '阻止百度地图统计的未知数据',
	// 	effect_desc: '阻止所有发向 miao.lianjia.com 的post请求',
	// 	default_on: true,
	// },
	//imapi.lianjia.com/msg/sync
	{
		id: 18050,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			regexFilter: ".imapi.lianjia.com\/msg\/sync*",
			resourceTypes: ["xmlhttprequest"]
		},
		action_desc: '阻止imapi.lianjia.com同步未知信息',
		effect_desc: '阻止所有发向 imapi.lianjia.com/msg/sync 的post请求',
		default_on: false,
	},
	//ajax.api.lianjia.com/login/login/getuserinfo
	{
		id: 18060,
		priority: 1,
		action: { type: 'block' },
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "ajax.api.lianjia.com*?callback",
			// regexFilter: "(.*)ajax\\.api\\.lianjia\\.com(.*)", //❌ regexFilter只匹配主机
			resourceTypes: ["xmlhttprequest", 'script']
		},
		action_desc: '阻止ajax.api.lianjia.com 同步用户信息',
		effect_desc: '阻止 网址为ajax.api.lianjia.com且包含callback参数的情请求',
		default_on: false,
	},

	{
		// 阻止包含 "baidu.com" 的所有请求
		id: 18070,
		priority: 1,
		action: { type: "block" },
		condition: {
			initiatorDomains: ["lianjia.com"],
			urlFilter: "||mediav.com",
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
			// excludedResourceTypes:["main_frame"]
		},
		action_desc: '阻止所有 mediav.com 的营销请求',
		effect_desc: '阻止所有包含mediav.com的请求',
		default_on: false,
	},
]




const ljRulesWithoutDesc = ljMetricRules.map(rule => omit(rule, ["action_desc", "effect_desc", "default_on", "must_on"]))

//只记录 开启的
const getBlockSettings = async () => await storage.getItem<Record<number, boolean>>('local:block-setting', {
	fallback: ljMetricRules.filter(rule => rule.default_on).reduce((acc, cur) => {
		return { ...acc, [cur.id]: true }
	}, {}),
})

export async function clearRules() {
	const _rules = await browser.declarativeNetRequest.getDynamicRules()

	if (browser.runtime.lastError) {
		console.error(browser.runtime.lastError.message);
		return;
	}
	await browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: _rules.map(rule => rule.id)
	})
	console.log('[block.ts]Clear all rules:', _rules.map(r => r.id));
}


export async function addRules() {
	const setting = await getBlockSettings()
	let rules = ljRulesWithoutDesc.filter(rule => setting[rule.id]);
	console.log('rules', rules, setting)
	await browser.declarativeNetRequest.updateDynamicRules({
		// @ts-ignore
		addRules: rules,
	});
	console.log('[block.ts]addRules done:', rules);
}

export async function updateLjRulesById(removeRuleIds: number[], addRuleIds: number[]) {
	const setting = await getBlockSettings()
	removeRuleIds.forEach(id => {
		delete setting[id]
	})
	addRuleIds.forEach(id => {
		setting[id] = true
	})
	//保存
	await storage.setItem('local:block-setting', setting)

	await browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: ljRulesWithoutDesc.map(r => r.id),
		//@ts-ignore
		addRules: addRuleIds.map(id => ljRulesWithoutDesc.find(rule => rule.id == id))
	});
}


