import {deleteBySelector} from "@/utils/document";


export function houseDisguise() {
	document.title = "CSDN";

	const oldIcon = document.querySelector("link[rel='icon']");
	if (oldIcon) {
		oldIcon.parentNode?.removeChild(oldIcon);
	}

	// 创建新的 favicon 元素
	const newIcon = document.createElement("link");
	newIcon.rel = "icon";
	newIcon.href = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 替换为新图标的 URL
	document.head.appendChild(newIcon);


	let name = ''

	const h1 = document.querySelector('h1.main')
	if (h1) {
		name = h1.textContent ?? ""
		h1.innerHTML = 'ElasticSearch中的Painless脚本操作总结'
	}

	deleteBySelector('.banner')
	deleteBySelector('.header')
	deleteBySelector('.m-yezhu')
	deleteBySelector('.go-login')
	deleteBySelector('.footer')
	deleteBySelector('.btnContainer')
	deleteBySelector('.ke-agent-sj-phone')
	deleteBySelector('.ke-agent-sj-container')
	deleteBySelector('.intro.clear')
	deleteBySelector('.publisher')
	deleteBySelector('.compareBtn')
	deleteBySelector('.sharethis')
	const classes = [
		'.taxtext',
		'.tax',
		'.aroundInfo',
		'#topImg',
		'.houseInfo'

	]
	classes.forEach((k: string) => deleteBySelector(k))

	replaceBodyText([
		{source: '平米', target: 'Token'},
		{source: '元', target: 'Text'},
		{source: '万', target: 'WLAN'},
	])
}