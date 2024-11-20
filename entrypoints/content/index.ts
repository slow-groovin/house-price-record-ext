import {onMessage} from "webext-bridge/content-script";
import './lianjia.css'
import {houseDisguise} from "@/entrypoints/content/lj-disguise";
import {random} from "radash";
import {removeNull} from "@/types/generic";


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

		houseDisguise()
		console.log('process.env.NODE_ENV',process.env.NODE_ENV)


		onMessage('parseHouse',async ({}) => {
			console.log('parseHouse receive message')
			const name = document.querySelector('h1.main')?.textContent??""

			//fetch info
			const totalPrice=document.querySelector('span.total')?.textContent
			const unitPrice=getDirectTextContent(document.querySelector('span.unitPriceValue'))
			const hid=getDirectTextContent(document.querySelector('.houseRecord .info'))

			const _communityUrl=getHref(document.querySelector('.communityName .info'))
			const cid=extractCidFromUrl(_communityUrl)??""
			const city=extractCity()??'unknown'

			const areaText=document.querySelector('.area .mainInfo')?.textContent
			const roomType=document.querySelector('.room .mainInfo')?.textContent
			//.room .subInfo
			const roomSubType=document.querySelector('.room .subInfo')?.textContent
			//.type .mainInfo
			const orientation=document.querySelector('.type .mainInfo')?.textContent

			const yearAndBuildingTypeNode=document.querySelector('.area .subInfo')

			let yearBuilt='',buildingType=''
			if(yearAndBuildingTypeNode){
				// 遍历子节点，提取文本内容
				const texts = Array.from(document.querySelector('.area .subInfo')!.childNodes)
					.filter(node => node.nodeType === Node.TEXT_NODE) // 仅保留文本节点
					.map(node => node?.textContent?.trim()) // 获取文本内容并去除多余空格
					.filter(text => text !== ""); // 排除空字符串
				yearBuilt=texts[0]??""
				buildingType=texts[1]?.replace('/','')??""
			}



			return {
				name,
				hid,
				cid,
				city,
				totalPrice: Number(totalPrice),
				unitPrice: Number(unitPrice),
				area: Number(extractNumericValue(areaText) ?? 0),
				buildingType,
				yearBuilt: yearBuilt,
				roomType: removeNull(roomType),
				roomSubType: removeNull(roomSubType),
				orientation: removeNull(orientation),
			}
		})

		onMessage('simple',async ({data})=>{
			if(data==='changePriceForTest'){
				const elem=document.querySelector('span.total')
				if(!elem ) return
				const totalPrice= elem?.textContent
				elem.textContent=Number(totalPrice)+random(-50,50)+''
			}else{
				console.log("content.js, receive simple message:",data)
			}
			return {respMsg:"OK"}
		})

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

function getHref(element?:Element|null){
	if(!element) return ''
	return element.getAttribute('href')
}

function extractCidFromUrl(input?: string|null): string | null {
	if(!input){
		return null
	}
	const regex = /xiaoqu\/(\d+)/;
	const match = input.match(regex);
	return match ? match[1] : null;
}

/**
 * 从当前 URL 中提取 schema 后的第一个字符串
 * @returns {string|null} 如果成功解析到则返回第一个字符串，否则返回 null
 */
function extractCity() {
	try {
		const url = new URL(window.location.href);
		const hostnameParts = url.hostname.split('.');

		// 检查是否有足够的部分，提取第一个部分
		return hostnameParts.length > 0 ? hostnameParts[0] : null;
	} catch (error) {
		console.error('Failed to extract segment from URL:', error);
		return null;
	}
}

function extractNumericValue(areaText?:string|null){
	if(!areaText) return null
	const regex = /\d+(\.\d+)?/; // 匹配数字（带小数或不带小数）
	const match = areaText.match(regex);
	console.log(match)
	return match ? match[0] : null;
}