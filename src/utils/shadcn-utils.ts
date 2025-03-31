import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {Updater} from "@tanstack/vue-table";
import { Ref } from 'vue';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * https://www.shadcn-vue.com/docs/components/data-table.html
 * @param updaterOrValue
 * @param ref
 */
export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
	ref.value = typeof updaterOrValue === 'function'
		? updaterOrValue(ref.value)
		: updaterOrValue
}