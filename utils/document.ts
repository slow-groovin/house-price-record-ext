
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

/**
 * 获取指定元素的所有直接子文本节点的内容
 * 这个函数旨在提取给定元素下的所有文本内容，忽略其他类型的节点，如元素节点或注释节点
 * @param element 可选的元素参数，如果未提供或为null，函数将返回一个空字符串
 * @returns 返回直接子文本节点中的文本内容，去除前后空白字符
 */
export function getDirectTextContent(element?:Element|null) {
    // 如果未提供元素或元素为null，则返回空字符串
    if(!element) return ''
    // 获取元素的所有直接子节点
    const childNodes = element.childNodes;
    let textContent = '';

    // 遍历所有子节点
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        // 检查节点类型，如果是文本节点，则追加其内容
        if (node.nodeType === Node.TEXT_NODE) {
            textContent += node.textContent;
        }
    }

    // 返回直接子文本节点中的文本内容，去除前后空白字符
    return textContent.trim();
}



export function getAttrHref(element?:Element|null){
	if(!element) return ''
	return element.getAttribute('href')
}

/**
 * 从以数字开头的字符串中(如 '83.11m','45个')中提取开头的数字
 * @param areaText
 */
export function extractPrefixNumericValueFromText(areaText?:string|null){
	if(!areaText) return null
	const regex = /\d+(\.\d+)?/; // 匹配数字（带小数或不带小数）
	const match = areaText.match(regex);
	return match ? Number(match[0]) : null;
}