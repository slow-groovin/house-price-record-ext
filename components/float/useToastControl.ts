import {ref} from "vue";
import {uid} from "radash";

export function useToastControl(){

	const toastMsg=ref('')
	const toastType=ref<"info" | "success" | "warning" | "error">('info')
	let keyCounter=0
	let keyPrefix='toast-'+uid(6)+'-'
	const toastKey=ref(keyPrefix+keyCounter) //控制重新渲染的
	function _set(msg:string, type: "info" | "success" | "warning" | "error"){
		toastMsg.value=msg
		toastType.value=type
		keyCounter++
		toastKey.value=keyPrefix+keyCounter
	}
	const toast={
		warning(msg:string){
			_set(msg, 'warning')
		},
		error(msg:string){
			_set(msg, 'error')
		},
		success(msg:string){
			_set(msg, 'success')
		},
		info(msg:string){
			_set(msg, 'info')
		},
	}
	return {
		toastMsg,toastType,toast,toastKey
	}
}