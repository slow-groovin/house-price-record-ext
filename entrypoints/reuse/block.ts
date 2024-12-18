import {browser} from "wxt/browser";
import {omit} from "radash";
import {storage} from "wxt/storage";
import {undefined} from "zod";


export const ljMetricRules = [

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

//只记录 开启的
const getBlockSettings=async ()=>await storage.getItem<Record<number,boolean>>('local:block-setting', {
	fallback: ljMetricRules.filter(rule=>!rule.default_on).reduce((acc, cur)=>{
		return {...acc, [cur.id]:true}
	},{}),
})

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


export async function addRules() {
	const setting=await getBlockSettings()
	let rules = ljRulesWithoutDesc.filter(rule=>setting[rule.id]);
	await browser.declarativeNetRequest.updateDynamicRules({
		// @ts-ignore
		addRules: rules,
	});
	console.log('[block.ts]addRules done:',rules);
}

export async function updateLjRulesById(removeRuleIds:number[], addRuleIds:number[]){
	const setting=await getBlockSettings()
	removeRuleIds.forEach(id=>{
		delete setting[id]
	})
	addRuleIds.forEach(id=>{
		setting[id]=true
	})
	//保存
	await storage.setItem('local:block-setting', setting)

	await browser.declarativeNetRequest.updateDynamicRules({
		removeRuleIds:ljRulesWithoutDesc.map(r=>r.id),
		//@ts-ignore
		addRules: addRuleIds.map(id=>ljRulesWithoutDesc.find(rule=>rule.id==id))
	});
}


