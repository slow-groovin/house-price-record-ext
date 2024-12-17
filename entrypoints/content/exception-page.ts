import {onMessage} from "webext-bridge/content-script";
import {PauseError} from "@/utils/lib/BatchQueueExecutor";

export function loginPageEntry(){
	console.log('login page')
	onMessage('parseOneCommunityListOnePage', async ({}) => {
		throw new PauseError('需要登录')
	})
}
export function captchaPageEntry(){

}