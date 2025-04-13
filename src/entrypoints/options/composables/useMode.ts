import { useLocalStorage } from "@vueuse/core";

export function useMode() {
  const mode = useLocalStorage<"sell" | "rent">("select-mode", "sell");
  return { mode };
}
