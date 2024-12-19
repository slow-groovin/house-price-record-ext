import {ContentScriptContext} from "wxt/client";
import {onMessage} from "@/messaging";
import {injectCoverModal, injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

const {isDisguise}=useDevSetting()
export async function houseSoldPageEntry(ctx: ContentScriptContext) {
	console.log("[content.js][house sold page]")

	if(isDisguise){
		injectFuzzyStyle()
		injectCoverModal()
		disguise()
	}


	onParseHouseSoldMessage()
	// onForTestUseMessage()

}
function disguise(){
	document.title='组件事件 |Vue3'
}
function onParseHouseSoldMessage() {
	onMessage('parseHouseSold', async ({}) => {
		console.log('[parseHouseSold] receive message')
		const soldDate=document.querySelector('.record_list .record_detail:nth-of-type(1)')?.textContent ?? undefined
		const priceText=document.querySelector('.msg  >span:first-child >label')?.textContent
		const price=Number(priceText)

		return {
			price,
			soldDate,
		}
	})
}
