export const isDisguise = import.meta.env.MODE === "development" && false;
export const isDebug = import.meta.env.MODE === "development" && true;
export function useDevSetting() {
  return { isDisguise, isDebug };
}
