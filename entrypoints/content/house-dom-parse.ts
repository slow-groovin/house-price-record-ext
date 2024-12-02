import {extractNumber, getAttrHref, getDirectTextContent} from "@/utils/document";
import {extractCidFromHomePageUrl, extractCityFromUrl} from "@/utils/lj-url";
import {removeNull} from "@/types/generic";
import {HouseItem} from "@/types/lj";

export async function parseHousePage():Promise<HouseItem>{
	const name = document.querySelector('h1.main')?.textContent ?? ""

	//fetch info
	const totalPrice = Number(document.querySelector('span.total')?.textContent)
	const unitPrice = getDirectTextContent(document.querySelector('span.unitPriceValue'))
	const hid = getDirectTextContent(document.querySelector('.houseRecord .info'))

	const _communityUrl = getAttrHref(document.querySelector('.communityName .info'))
	const cid = extractCidFromHomePageUrl(_communityUrl) ?? ""
	const city = extractCityFromUrl(window.location.href) ?? 'unknown'

	const areaText = document.querySelector('.area .mainInfo')?.textContent
	const roomType = document.querySelector('.room .mainInfo')?.textContent
	//.room .subInfo
	const roomSubType = document.querySelector('.room .subInfo')?.textContent
	//.type .mainInfo
	const orientation = document.querySelector('.type .mainInfo')?.textContent

	const onSellDate = new Date(document.querySelector('.introContent .transaction .content li:nth-child(1) > span:nth-child(2)')?.textContent ?? "").getTime()


	const yearAndBuildingTypeNode = document.querySelector('.area .subInfo')

	let yearBuilt = '', buildingType = ''
	if (yearAndBuildingTypeNode) {
		// 遍历子节点，提取文本内容
		const texts = Array.from(document.querySelector('.area .subInfo')!.childNodes)
			.filter(node => node.nodeType === Node.TEXT_NODE) // 仅保留文本节点
			.map(node => node?.textContent?.trim()) // 获取文本内容并去除多余空格
			.filter(text => text !== ""); // 排除空字符串
		yearBuilt = texts[0] ?? ""
		buildingType = texts[1]?.replace('/', '') ?? ""
	}


	//real area
	let totalRealArea = 0
	document.querySelectorAll('.des .row > .col:nth-child(2)').forEach((element) => {
		const partArea = extractNumber(element.textContent)
		if (partArea) totalRealArea += partArea
	})
	totalRealArea = Number(totalRealArea.toFixed(2)) // 避免出现小数点后两位以上
	//real unit price
	let realUnitPrice: undefined | number
	if (totalPrice) {
		realUnitPrice = (totalPrice * 10000) / totalRealArea
		realUnitPrice = Number(realUnitPrice.toFixed(0))
	}

	return {
		name,
		hid,
		cid,
		city,
		totalPrice: totalPrice,
		unitPrice: Number(unitPrice),
		area: extractNumber(areaText) ?? 0,
		realArea: totalRealArea ? totalRealArea : undefined,  //为0则改为undefined
		realUnitPrice,
		onSellDate,
		buildingType,
		yearBuilt: yearBuilt,
		roomType: removeNull(roomType),
		roomSubType: removeNull(roomSubType),
		orientation: removeNull(orientation),
	}
}