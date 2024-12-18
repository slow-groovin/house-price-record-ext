import "webext-bridge/content-script";
import {housePageEntry} from "@/entrypoints/content/house-page";
import {communityListPageEntry} from "@/entrypoints/content/community-list-page";
import {isCaptchaPage, isCommunityListPage, isHousePage, isHouseSoldPage, isLoginPage} from "@/utils/lj-url";
import '~/assets/tailwind.css'
import '~/assets/shacn.css'
import {pageDebugEntry} from "@/entrypoints/content/page-debug";
import {defineContentScript} from "wxt/sandbox";
import {houseSoldPageEntry} from "@/entrypoints/content/house-sold-page";
import {captchaPageEntry, loginPageEntry} from './exception-page'
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

const matches = () => { //this will be exec on build
	return import.meta.env.MODE === 'development' ?
		[
			'*://*.lianjia.com/*',
			// '*://*.example.com/*'
		] :
		[
			'*://*.lianjia.com/*',
		]
}

export default defineContentScript({
	matches: matches(),
	cssInjectionMode: 'ui',
	async main(ctx) {
		const {isDebug, isDisguise} = useDevSetting()

		console.log('[content/index.js]process.env.NODE_ENV', process.env.NODE_ENV, 'import.meta.env.MODE', import.meta.env.MODE)
		console.log('[content/index.js]import.meta.env.VITE_HIDE', import.meta.env.VITE_HIDE)

		// ctx.block
		console.log('hit lj page.', window.location.href);


		if (isDisguise) {
			import('~/assets/disguise.css');
		}


		const url = window.location.href
		console.log('url:', url)
		if (isHousePage(url)) {
			housePageEntry(ctx)
		} else if (isCommunityListPage(url)) {
			await communityListPageEntry(ctx)
		} else if (isHouseSoldPage(url)) {
			console.log("sold out hit")
			await houseSoldPageEntry(ctx)
		} else if (isLoginPage(url)) {
			loginPageEntry()
		} else if (isCaptchaPage(url)) {
			captchaPageEntry()
		}

		if (url.includes('example.com')) {
			pageDebugEntry(ctx)
		}


	},
});
