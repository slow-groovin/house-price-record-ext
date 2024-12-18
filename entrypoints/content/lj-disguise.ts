import {deleteBySelector, hiddenAndReplace} from "@/utils/document";

export function injectCoverModal() {

	// 创建覆盖层 div
	const overlayDiv = document.createElement('img');
	overlayDiv.style.objectFit = 'none'; // 或 'cover' 取决于需求

	overlayDiv.id = 'customOverlay';
	overlayDiv.style.position = 'fixed';
	overlayDiv.style.top = '20px';
	overlayDiv.style.left = '0px';
	overlayDiv.style.width = '100%';
	overlayDiv.style.height = '100%';
	overlayDiv.style.backgroundColor = 'rgb(255,255,255)';
	overlayDiv.style.zIndex = '9999';
	overlayDiv.style.display = 'flex';  // 初始隐藏覆盖层

// 创建按钮
	const toggleButton = document.createElement('button');
	toggleButton.id = 'toggleButton14144'
	toggleButton.className = 'toggleButton35151'
	toggleButton.textContent = 'Home';
	toggleButton.style.position = 'fixed';
	toggleButton.style.padding = '10px 20px';
	toggleButton.style.backgroundColor = 'white';
	toggleButton.style.border = '2px solid #333';
	toggleButton.style.cursor = 'help';
	// toggleButton.style.marginBottom = '10px';  // 可选：设置按钮与其他页面内容的间隔

// 将按钮插入到页面的第一个元素之前
	document.body.insertBefore(toggleButton, document.body.firstChild);

// 按钮点击事件，切换覆盖层显示/隐藏
	toggleButton.addEventListener('click', () => {
		if (overlayDiv.style.display === 'none') {
			overlayDiv.style.display = 'flex';  // 显示覆盖层
			toggleButton.textContent = '关闭覆盖';  // 更改按钮文本
		} else {
			overlayDiv.style.display = 'none';  // 隐藏覆盖层
			toggleButton.textContent = '开启覆盖';  // 更改按钮文本
		}
	});

// 将覆盖层添加到页面 body 中
	document.body.appendChild(overlayDiv);
}

export function injectFuzzyStyle() {
	// 定义 CSS 样式
// 	const css = `
// body * {
//     background-color: rgba(115, 92, 83, 0.56) !important;
//     color: rgba(191, 189, 189, 0.38) !important;
// }`;
// 	font-size: 9px !important; /* 缩小字体 */
	const css = `
body * {
    background-color: rgba(115, 92, 83, 0.56) !important;

    color: rgba(191, 189, 189, 0.38) !important;
}`;
	// 创建一个 <style> 标签
	const style = document.createElement('style');

	// style.type = 'text/css';
	style.innerHTML = css;

// 将 <style> 标签插入到 <head> 中
	document.head.appendChild(style);
}

export function communityElementDisguise(){
	document.title = "ElasticSearch";
}
export function housePageElementsDisguise() {
	document.title = "CSDN";

	const oldIcon = document.querySelector("link[rel='icon']");
	if (oldIcon) {
		oldIcon.parentNode?.removeChild(oldIcon);
	}

	// 创建新的 favicon 元素
	const newIcon = document.createElement("link");
	newIcon.rel = "icon";
	newIcon.href = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 替换为新图标的 URL
	document.head.appendChild(newIcon);

	const h1 = document.querySelector('h1.main')
	if (h1) {
		hiddenAndReplace("h1.main", "ElasticSearch Painless Summary")
	}


	const classes = [
		// '.banner',
		// '.header',
		// '.m-yezhu',
		// '.go-login',
		// '.footer',
		// '.btnContainer',
		// '.ke-agent-sj-phone',
		// '.ke-agent-sj-container',
		// '.intro.clear',
		// '.publisher',
		// '.compareBtn',
		// '.sharethis',
		// '.taxtext',
		// '.tax',
		// '.aroundInfo',
		'#topImg',
		// '.houseInfo'

	]
	classes.forEach((k: string) => deleteBySelector(k))

	// replaceBodyText([
	// 	{source: '平米', target: 'Token'},
	// 	{source: '元', target: 'Text'},
	// 	{source: '万', target: 'WLAN'},
	// ])


}



