import {ContentScriptContext} from "wxt/client";
import {random} from "radash";
import {onMessage} from "@/messaging";
import {housePageElementsDisguise, injectCoverModal, injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {houseContentUIMount} from "@/entrypoints/content/house-content-ui";
import {parseHousePage} from "@/entrypoints/content/house-dom-parse";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

const {isDisguise}=useDevSetting()

export function housePageEntry(ctx: ContentScriptContext) {
	console.log("[content.js][house page]")
	if (isDisguise) {
		injectFuzzyStyle()
		injectCoverModal()
		housePageElementsDisguise()
	}

	onParseHouseMessage()
	onForTestUseMessage()
	houseContentUIMount(ctx).then(()=>console.log("[content.js]house content ui mount."))

}

function onParseHouseMessage() {
	onMessage('parseHouse', async ({}) => {
		console.log('parseHouse receive message')
		return await parseHousePage()
	})
}

function onForTestUseMessage() {
	onMessage('simple', async ({data}) => {
		if (data === 'changePriceForTest') {
			const elem = document.querySelector('span.total')
			if (!elem) return
			const totalPrice = elem?.textContent
			elem.textContent = Number(totalPrice) + random(-50, 50) + ''
		} else {
			console.log("content.js, receive simple message:", data)
		}
		return {respMsg: "OK"}
	})
}