import { HouseSoldItem } from "@/types/lj";
import { extractCityAndHidFromHouseSoldUrl } from "@/utils/lj-url";

export function parseCommunityListPage(): HouseSoldItem[] {
  let results: HouseSoldItem[] = [];
  document.querySelectorAll(".listContent .info").forEach((element) => {
    const { hid } = extractCityAndHidFromHouseSoldUrl(
      element.querySelector(".title > a")?.getAttribute("href")
    );
    const soldDateStr =
      element.querySelector(".address .dealDate")?.textContent;

    const soldAt = new Date(soldDateStr!.replace(/\./g, "-")).getTime(); // 获取时间戳（毫秒）
    if (!hid) {
      console.warn("hid is null");
      return;
    }
    results.push({ hid, soldAt });
  });
  return results;
}
