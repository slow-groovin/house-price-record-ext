import {ContentScriptContext} from "wxt/client";
import {onMessage} from "webext-bridge/content-script";

export function pageDebugEntry(ctx: ContentScriptContext) {

	if(import.meta.env.VITE_HIDE==='true'){

	}
	if(process.env.NODE_ENV==='development'){
		onParseMessage()
	}

}

function onParseMessage() {
	console.log('[message listen] listen simple message')
	onMessage('simple', ({data})=>{
		console.log('[message][simple]'+data)
		if(data==='parse'){
			return  {text:document.title,url: window.location.href}
		}
	})
}