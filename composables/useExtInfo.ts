export function useExtInfo(){
	const name=import.meta.env.VITE_EXT_NAME
	const version=import.meta.env.VITE_EXT_VERSION
	return {
		name,
		version
	}
}