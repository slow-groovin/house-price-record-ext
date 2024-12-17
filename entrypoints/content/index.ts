import  "webext-bridge/content-script";
import {housePageEntry} from "@/entrypoints/content/house-page";
import {communityListPageEntry} from "@/entrypoints/content/community-list-page";
import {
	isCaptchaPage,
	isCommunityHomePage,
	isCommunityListPage,
	isHousePage,
	isHouseSoldPage,
	isLoginPage
} from "@/utils/lj-url";
import '~/assets/tailwind.css'
import '~/assets/shacn.css'
import {pageDebugEntry} from "@/entrypoints/content/page-debug";
import {defineContentScript} from "wxt/sandbox";
import {houseSoldPageEntry} from "@/entrypoints/content/house-sold-page";
import {loginPageEntry,captchaPageEntry} from './exception-page'
export default defineContentScript({
	matches: [
		'*://*.lianjia.com/ershoufang/*',
		'*://*.lianjia.com/',
		'*://*.lianjia.com/*',
		'*://*.example.com/*'
	],
	cssInjectionMode: 'ui',
	async main(ctx) {

		console.log('process.env.NODE_ENV',process.env.NODE_ENV)
		console.log('import.meta.env.VITE_HIDE',import.meta.env.VITE_HIDE)

		// ctx.block
		console.log('hit lj page.',window.location.href);

		if (import.meta.env.VITE_HIDE === 'true') {
			import('~/assets/disguise.css');
		}



		const url=window.location.href
		console.log('url:',url)
		if(isHousePage(url)){
			housePageEntry(ctx)
		}else if(isCommunityListPage(url)){
			await communityListPageEntry(ctx)
		}else if(isHouseSoldPage(url)){
			console.log("sold out hit")
			await houseSoldPageEntry(ctx)
		}else if(isLoginPage(url)){
			await loginPageEntry(ctx)
		}else if(isCaptchaPage(url)){
			await captchaPageEntry(ctx)
		}

		if(url.includes('example.com')){
			pageDebugEntry(ctx)
		}


	},
});
