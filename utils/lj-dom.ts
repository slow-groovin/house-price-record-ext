/**
 * 从  https://city.lianjia.com/xiaoqu/<cid>.html 中提取cid
 * @param url
 */
export function extractCidFromUrl(url?: string|null): string | null {
	if(!url){
		return null
	}
	const regex = /xiaoqu\/(\d+)/;
	const match = url.match(regex);
	return match ? match[1] : null;
}

/**
 * 从如同 https://<city>.lianjia.com* URL 中提取 <city> 内容, 即schema后的第一个字符串
 * @returns {string|null} 如果成功解析到则返回第一个字符串，否则返回 null
 */
export function extractCityFromUrl(urlStr:string) {
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

