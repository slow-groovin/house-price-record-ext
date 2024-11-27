import {housePageEntry} from "@/entrypoints/content/house-page";
import {communityListPageEntry} from "@/entrypoints/content/community-list-page";
import {isCommunityListPage, isHousePage} from "@/utils/lj-url";
import '~/assets/tailwind.css'
import '~/assets/shacn.css'
import {pageDebugEntry} from "@/entrypoints/content/page-debug";
import {defineContentScript} from "wxt/sandbox";

export default defineContentScript({
	matches: [
		'*://*.lianjia.com/ershoufang/*',
		'*://*.lianjia.com/',
		'*://*.lianjia.com/*',
	],
	cssInjectionMode: 'ui',
	async main(ctx) {

		console.log('process.env.NODE_ENV',process.env.NODE_ENV)
		console.log('import.meta.env.VITE_HIDE',import.meta.env.VITE_HIDE)

		// ctx.block
		console.log('hit lj page.',window.location.href);


		const url=window.location.href
		if(isHousePage(url)){
			console.log('lj house')
			housePageEntry(ctx)

		}else if(isCommunityListPage(url)){
			console.log('lj community list',Date.now())
			await communityListPageEntry(ctx)
		}

		pageDebugEntry(ctx)

	},
});
