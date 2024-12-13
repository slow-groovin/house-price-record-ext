import {
	extractCidFromListUrl,
	extractCityAndHidFromHouseUrl,
	extractCityFromUrl,
	extractPageNumberFromListUrl
} from "@/utils/lj-url";
import {extractNumber, waitForElement} from "@/utils/document";
import {CommunityListPageItem, HouseListDetailItem, HousePriceItem} from "@/types/lj";
import {removeNull} from "@/types/generic";

export async function parseAllOfCommunity():Promise<CommunityListPageItem>{
	/**
	 * 判断小区是否存在
	 */
		// 顶部第一个radio的label(如果小区存在则为小区名字)
	const radioKey = document.querySelector('body > div:nth-child(12) > div > div.list-more > dl:nth-child(1) > h2 > dt')?.textContent || '';
	// (某些城市) 如果小区不存在, 则显示'新上房源通知'
	const waitingNotifyText = document.querySelector('.lz_box > .title')?.textContent?.trim() || '';

	const exist = radioKey == '小区' || waitingNotifyText == '新上房源通知'
	if (!exist) {
		console.warn(`community  not exist.`)
	}

	/**
	 * cid,city,pageNo
	 */
	const cid=extractCidFromListUrl(window.location.href)
	if (!cid) {
		console.warn(`cid is undefined.`)
		throw new Error(`cid is undefined.`)
	}
	const city=removeNull(extractCityFromUrl(window.location.href))
	const pageNo=extractPageNumberFromListUrl(window.location.href)??1

	const pageData=JSON.parse(document.querySelector('.page-box.house-lst-page-box')?.getAttribute('page-data')??"") as {totalPage:number,curPage:number}
	// console.log(pageData)

	const maxPageNo = pageData.totalPage
	if(pageNo!==pageData.curPage){
		console.warn('pageNo is not curPage',pageNo,pageData.curPage)
	}
	/**
	 * 名字
	 */
	const communityName=complicatedSelectCommunityName()



	// 列表中的所有id
	const houseItems:HouseListDetailItem[] = [];
	// .info.clear > .title > a .info.clear > .priceInfo > .totalPrice
	document.querySelectorAll('.info.clear ').forEach((element) => {
		const {city,hid}=extractCityAndHidFromHouseUrl(element.querySelector('.title > a')?.getAttribute('href'))
		const totalPrice=extractNumber(element.querySelector('.priceInfo > .totalPrice')?.textContent)
		const unitPrice=extractNumber(element.querySelector('.priceInfo > .unitPrice')?.getAttribute('data-price'))??undefined
		const name=element.querySelector('.title > a')?.textContent??undefined
		const info=element.querySelector('.houseInfo ')?.textContent?.split('|')??[]
		//2室1厅 ', ' 79平米 ', ' 西 ', ' 精装 ', ' 顶层(共26层) ', ' 2023年 ', ' 板楼'
		const roomType=info[0]?.trim()
		const area=extractNumber(info[1]?.trim())??undefined
		const orientation=info[2]?.trim()
		const roomSubType=info[4]?.trim()
		const yearBuilt= info[5]?.trim()
		const buildingType=info[6]?.trim()


		// console.log(name,info)
		if(!hid || !totalPrice){
			console.warn('hid or price is undefined',`hid:${hid},price:${totalPrice}}`)
			return
		}
		houseItems.push({hid,price: totalPrice,unitPrice, roomType, area, orientation, roomSubType, yearBuilt, buildingType, name})
	});


	/**
	 * 显示的 总套数 成交量 价格 带看数量
	 */
	let showedOnSellCount=NaN,showedAvgPrice=NaN,showedDoneCountIn90Days=NaN,showedVisitCountIn90Days=NaN;
	await waitForElement('.agentCardDetailItem',30_000)
		.then((element) => {
			showedAvgPrice = Number(extractNumber(document.querySelector('.agentCardDetailItem:nth-child(1)>.agentCardDetailInfo')?.textContent));
			showedOnSellCount=Number(extractNumber(document.querySelector('.agentCardDetailItem:nth-child(2)>.agentCardDetailInfo')?.textContent));
			showedDoneCountIn90Days=Number(extractNumber(document.querySelector('.agentCardDetailItem:nth-child(3)>a')?.textContent));
			showedVisitCountIn90Days=Number(extractNumber(document.querySelector('.agentCardDetailItem:nth-child(4)>.agentCardDetailInfo')?.textContent));
		})
		.catch((error) => {
			//do nothing
			console.log("[content.js] '.agentCardDetailItem'  not loaded")
		});


	return {
		cid,
		city,
		pageNo,
		maxPageNo,
		name: communityName,
    onSellCount:showedOnSellCount,
		avgUnitPrice:showedAvgPrice,
		doneCountIn90Days:showedDoneCountIn90Days,
		visitCountIn90Days:showedVisitCountIn90Days,
		houseList: houseItems
		// houseIds
	};
}

/**
 * 通过一个复杂的过程处理不同的情况, 返回community name
 */
function complicatedSelectCommunityName(){
	// 底部链接上的小区名字(小区存在的情况下)
	const communityNameInLink = (document.querySelector('.crumbs > h1 > a')?.textContent || '')
		.trim()
		.replace(/小区|出售|二手房/g, '');

	// 房源列表中的小区名字(房源存在的情况下)
	const communityNamesInList:string[] = [];
	document.querySelectorAll('a[data-el="region"]').forEach((element) => {
		const communityName = element.textContent?.trim();
		if (communityName) {
			communityNamesInList.push(communityName);
		}
	});

	/**
	 * 小区名字(必须在上一步exist==true的情况下)
	 */
	const nameOption1 = communityNameInLink//直接通过链接中的文字获取
	const nameOption2 = tryGetAllSameOne(communityNamesInList)//通过列表中的项获取,在不存在房源的情况下不能获取
	 //优先选择nameOption2
	return nameOption2 ? nameOption2.replace(/小区|出售|二手房/g, '') : nameOption1;
}

function tryGetAllSameOne(arr: string[]): string | undefined {
	if (!arr) return undefined
	const first = arr[0]
	for (let str of arr) {
		if (first != str) {
			return undefined
		}
	}
	return first
}