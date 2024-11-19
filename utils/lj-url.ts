export function isHousePage(url?:string){
	if(!url) return false
	return /ershoufang\/\d+.html/.test(url)

}