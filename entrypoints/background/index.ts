import { onMessage, sendMessage } from "webext-bridge/background"

import { storage, StorageItemKey } from "wxt/storage";
import {updateRules} from "@/utils/block";






export default defineBackground(() => {
  console.log('Load background!', { id: browser.runtime.id });
	updateRules('ljMetricRules')
	updateRules('ljImgRules')
	updateRules('debugRules')

	onMessage('block',(enable)=>{
		if(enable){
			return {resp: 'ok'}
		}
		return {resp: 'nothing'}

	} )

	onMessage('houseItem',(house)=>{
		storage.setItem(`local:house-${house.id}`,house.data)
		console.log('house',house,house.data)
		return {resp:"ok"}
	})
});


