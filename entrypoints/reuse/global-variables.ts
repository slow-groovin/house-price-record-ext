export const isDisguise = import.meta.env.MODE	=== 'development' && import.meta.env.VITE_HIDE === 'true' && true
export const isDebug = import.meta.env.MODE === 'development' && true
export function useDevSetting(){
	return {isDisguise,isDebug}
}