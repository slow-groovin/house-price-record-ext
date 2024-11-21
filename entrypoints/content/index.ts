import {housePageEntry} from "@/entrypoints/content/house-page";
import {communityListPageEntry} from "@/entrypoints/content/community-list-page";
import {isCommunityListPage} from "@/utils/lj-url";
import '~/assets/tailwind.css'
import '~/assets/shacn.css'

export default defineContentScript({
	matches: [
		'*://*.lianjia.com/ershoufang/*',
	],
	cssInjectionMode: 'ui',
	async main(ctx) {
		console.log('process.env.NODE_ENV',process.env.NODE_ENV)

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

	},
});

