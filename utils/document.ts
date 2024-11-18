
export function deleteBySelector(selector:string){
	const elements = document.querySelectorAll(selector);
	elements.forEach(element => {
		element.parentNode?.removeChild(element);
	});
}

export function replaceBodyText(items:{source:string, target:string}[]){
	let innerHTML=document.body.innerHTML
	// 对整个页面内容进行替换
	items.forEach(item=>{
		innerHTML = innerHTML.replaceAll(item.source, item.target)
	})
	document.body.innerHTML=innerHTML
}