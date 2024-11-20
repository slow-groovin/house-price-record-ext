export function isHousePage(url?:string){
	if(!url) return false
	return /ershoufang\/\d+.html/.test(url)
}

export function isCommunityListPage(url?:string){
	if(!url) return false
	return /ershoufang\/(c\d+|pg\d+c\d+)\//.test(url)
}