import {sendMessage} from "webext-bridge/content-script";
import './lianjia.css'

export default defineContentScript({
	matches: [
		'*://*.lianjia.com/*',
		'*://*.api2o.com/*'
	],
	async main(ctx) {

		// ctx.block
		console.log('Hello content.');

		ctx.addEventListener(window,'load',()=>{
			console.log('load')
		})



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


		let name=''

		const h1 = document.querySelector('h1.main')
		if (h1){
			name=h1.textContent??""
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



		//fetch info
		const totalPrice=document.querySelector('span.total')?.textContent
		const unitPrice=getDirectTextContent(document.querySelector('span.unitPriceValue'))
		const id=getDirectTextContent(document.querySelector('.houseRecord .info'))
		const area=document.querySelector('.area .mainInfo')?.textContent?.trim().replace('平米','')

		console.log({totalPrice,unitPrice})
		const resp = await sendMessage('houseItem', {
			id: id,
			totalPrice:Number(totalPrice),
			unitPrice:Number(unitPrice),
			name:name,
			area:Number(area)

		}, 'background')
		console.log(resp)
		console.log("send message done.")
	},
});


function deleteBySelector(selector:string){
	const elements = document.querySelectorAll(selector);
	elements.forEach(element => {
		element.parentNode?.removeChild(element);
	});
}

function getDirectTextContent(element?:Element|null) {
	if(!element) return ''
	// 获取元素的所有直接子节点
	const childNodes = element.childNodes;
	let textContent = '';

	// 遍历所有子节点
	for (let i = 0; i < childNodes.length; i++) {
		const node = childNodes[i];
		// 检查节点类型，如果是文本节点，则追加其内容
		if (node.nodeType === Node.TEXT_NODE) {
			textContent += node.textContent;
		}
	}

	return textContent.trim(); // 去掉前后空白
}