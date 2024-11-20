import {ContentScriptContext} from "wxt/client";
import {injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";

export function communityListPageEntry(ctx:ContentScriptContext) {
	injectFuzzyStyle()

}