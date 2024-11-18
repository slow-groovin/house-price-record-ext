import {sendMessage} from "webext-bridge/content-script";
import './lianjia.css'
import {houseDisguise} from "@/entrypoints/content/lj-disguise";

export default defineContentScript({
	matches: [
		'*://*.lianjia.com/ershoufang/*',
	],
	async main(ctx) {

		// ctx.block
		console.log('Hello content.');

		ctx.addEventListener(window,'load',()=>{
			console.log('load')
		})

		const name = document.querySelector('h1.main')?.textContent??""







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
		houseDisguise()

	},
});



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