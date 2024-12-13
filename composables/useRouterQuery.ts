import {useRouter} from "vue-router";

export function useRouterQuery(){
	const router = useRouter();

	async function pushQuery(k:string,v:string|number|boolean){
		if(v===undefined || v===null) {
			return
		}
		await router.replace({ query: {...router.currentRoute.value.query, [k]: String(v) } });
	}
	async function pushQueries(kv:Record<string,string|number|boolean>){
		const stringKV:Record<string,string>={}
		for(let k of Object.keys(kv)){
			const v=kv[k]
			if(v!==undefined && v!==null){
				stringKV[k]=String(v)
			}
		}
		await router.replace({ query: {...router.currentRoute.value.query, ...stringKV } });
	}
	async function removeQuery(k:string){
		return removeQueries([k])
	}
	async function removeQueries(keys:string[]){
		const query={...router.currentRoute.value.query}
		for(const k of keys){
			delete query[k]
		}
		await router.replace({ query});
	}
	return {
		pushQuery,removeQueries,pushQueries,removeQuery
	}

}
