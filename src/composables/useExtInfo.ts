import { useTitle, UseTitleOptions } from "@vueuse/core";
import { MaybeRef, MaybeRefOrGetter } from "vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import {
  curVersionChangeLog,
  historyChangeLog,
} from "@/entrypoints/reuse/global-variables";

export function useExtInfo() {
  const name = import.meta.env.VITE_EXT_NAME;
  const version = import.meta.env.VITE_EXT_VERSION;
  return {
    name,
    version,
    curVersionChangeLog,
    historyChangeLog,
  };
}

export function useExtTitle(
  newTitle?: MaybeRefOrGetter<string | null | undefined>,
  options?: UseTitleOptions
) {
  const { isDisguise } = useDevSetting();
  if (isDisguise) {
    return useTitle("Github");
  }
  return useTitle(
    //@ts-ignore
    newTitle,
    options ?? {
      titleTemplate: (title) =>
        `${title ? title + " | " : ""}${import.meta.env.VITE_EXT_NAME}`,
    }
  );
}
