
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

/**
 * 把原有元素隐藏, 并使用text新建元素
 * @param selector
 * @param text
 */
export function hiddenAndReplace(selector:string,text:string) {
	// 获取原始元素
	const originalElement = document.querySelector(selector);

	if (!originalElement) {
		console.warn(`元素未找到: ${selector}`);
		return;
	}
	// 创建一个新的元素
	const newElement = document.createElement(originalElement.tagName);
	newElement.textContent=text
	// 将新的元素插入到原元素的后面
	originalElement.insertAdjacentElement('afterend', newElement);
	originalElement.setAttribute("style","display:none;")
}
