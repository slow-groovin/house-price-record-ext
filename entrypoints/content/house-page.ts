import {ContentScriptContext} from "wxt/client";
import {removeNull} from "@/types/generic";
import {random} from "radash";
import {onMessage} from "webext-bridge/content-script";
import {extractNumber, getAttrHref, getDirectTextContent} from "@/utils/document";
import {housePageElementsDisguise, injectFuzzyStyle, injectCoverModal} from "@/entrypoints/content/lj-disguise";
import {extractCidFromHomePageUrl, extractCityFromUrl} from "@/utils/lj-url";

export function housePageEntry(ctx:ContentScriptContext){

	injectFuzzyStyle()
	housePageElementsDisguise()

	onParseHouseMessage()

	onForTestUseMessage()

	injectCoverModal()

}

function onParseHouseMessage(){
	onMessage('parseHouse',async ({}) => {
		console.log('parseHouse receive message')
		const name = document.querySelector('h1.main')?.textContent??""

		//fetch info
		const totalPrice=document.querySelector('span.total')?.textContent
		const unitPrice=getDirectTextContent(document.querySelector('span.unitPriceValue'))
		const hid=getDirectTextContent(document.querySelector('.houseRecord .info'))

		const _communityUrl=getAttrHref(document.querySelector('.communityName .info'))
		const cid=extractCidFromHomePageUrl(_communityUrl)??""
		const city=extractCityFromUrl(window.location.href)??'unknown'

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
			area: extractNumber(areaText) ?? 0,
			buildingType,
			yearBuilt: yearBuilt,
			roomType: removeNull(roomType),
			roomSubType: removeNull(roomSubType),
			orientation: removeNull(orientation),
		}
	})
}

function onForTestUseMessage(){
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
}