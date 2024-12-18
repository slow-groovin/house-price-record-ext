import {useTitle, UseTitleOptions} from "@vueuse/core";
import {MaybeRef, MaybeRefOrGetter} from "vue";

export function useExtInfo() {
	const name = import.meta.env.VITE_EXT_NAME
	const version = import.meta.env.VITE_EXT_VERSION
	return {
		name,
		version
	}
}

export function useExtTitle(newTitle?: MaybeRefOrGetter<string | null | undefined>, options?: UseTitleOptions) {
	return useTitle(newTitle??'', options ?? {titleTemplate: (title) => (`${title ? title + ' | ' : ''}${import.meta.env.VITE_EXT_NAME}`)})
}