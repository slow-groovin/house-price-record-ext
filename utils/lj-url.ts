export function isHousePage(url?: string) {
	if (!url) return false
	return /lianjia.com\/ershoufang\/\d+.html/.test(url)
}


export function isHouseSoldPage(url?: string) {
	if (!url) return false
	return /lianjia.com\/chengjiao\/\d+.html/.test(url)
}

export function isCaptchaPage(url?: string) {
	if (!url) return false
	return /lianjia.com\/captcha/.test(url)
}

export function isLoginPage(url?: string){
	if (!url) return false
	return url.includes('com/login')
}

export function isCommunityListPage(url?: string) {
	if (!url) return false
	return /ershoufang\/(pg\d+)?(co\d+)?c\d+\//.test(url)
}


export function extractCityAndHidFromHouseUrl(url: string | undefined | null): {
	city: string | undefined,
	hid: string | undefined
} {
	const empty = {city: undefined, hid: undefined}
	if (!url) return empty
	// 定义正则表达式来匹配URL中的city和houseId
	const regex = /(:?https?:\/\/)(.+?)\.lianjia\.com\/ershoufang\/(\d+)\/?/;
	const matches = url.match(regex);

	// 检查匹配结果，如果匹配成功则返回解析出的city和id
	if (matches) {
		const city = matches[2];
		const id = matches[3];
		return {city, hid: id};
	} else {
		return empty;
	}
}

export function extractCommunityListPageNumber(str: string): number | null {
	const regex = /\/pg(\d+)c/g;
	const match = regex.exec(str);

	if (match) {
		return Number(match[1]);
	}

	return null;
}

/**
 * 从 /xiaoqu url中提取cid
 * @param url
 */
export function extractCidFromHomePageUrl(url?: string | null): string | null {
	if (!url) {
		return null
	}
	const regex = /xiaoqu\/(\d+)/;
	const match = url.match(regex);
	return match ? match[1] : null;
}

/**
 * 从  https://city.lianjia.com/ershoufang/c<cid>.html 中提取cid
 * @param url
 */
export function extractCidFromListUrl(url?: string | null): string | null {

	if (!url) {
		return null
	}
	const regex = /ershoufang\/\w*(c\d+)\//;
	const match = url.match(regex);
	return match ? match[1].replace('c', '') : null;
}


export function extractPageNumberFromListUrl(str: string): number | null {
	const regex = /\/pg(\d+)c/g;
	const match = regex.exec(str);

	if (match) {
		return Number(match[1]);
	}

	return null;
}

/**
 * 从如同 https://<city>.lianjia.com* URL 中提取 <city> 内容, 即schema后的第一个字符串
 * 如果成功解析到则返回第一个字符串，否则返回 null
 */
export function extractCityFromUrl(urlStr: string) {
	try {
		const url = new URL(urlStr);
		const hostnameParts = url.hostname.split('.');

		// 检查是否有足够的部分，提取第一个部分
		return hostnameParts.length > 0 ? hostnameParts[0] : null;
	} catch (error) {
		console.error('Failed to extract segment from URL:', error);
		return null;
	}
}

/**
 * 生成社区页面URL
 *
 * 此函数根据城市、社区ID和页码生成对应的链家网社区页面URL
 * 它处理两种情况：当页码为1时，生成第一页的URL；当页码大于1时，生成相应页码的URL
 *
 * @param city 城市简称，用于生成URL的域名部分，例如"bj"代表北京
 * @param cid 社区ID，用于生成URL的路径部分
 * @param page 页码，表示需要生成URL的页面位置
 * @param order 排序方式，默认为"time"，可选值包括"time"、"area"和"price"
 * @returns 返回生成的社区页面URL字符串
 */
export function genCommunityPageUrl(city: string, cid: string, page: number, order: 'time' | 'default'  = "time"): string {
	const orderFlag=order==='default'?'':'co32'
	const pageFlag=page===1?'':`pg${page}`
	return `https://${city}.lianjia.com/ershoufang/${pageFlag}${orderFlag}c${cid}/`;
}

export function genHousePageUrl(city: string, hid: string): string {
	return `https://${city}.lianjia.com/ershoufang/${hid}.html`;
}
