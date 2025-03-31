import { CommunityBasic } from "@/types/lj";
import {
  extractCidFromHomePageUrl,
  extractCidFromKeRentUrl,
  extractCityFromKeRentUrl,
  extractCityFromUrl,
  extractPageNumberFromKeRentUrl,
  extractRidFromKeRentUrl,
} from "@/utils/lj-url";

export function parseCommunityHome(): CommunityBasic {
  const name = document.querySelector(".detailTitle")?.textContent ?? "";
  const avgUnitPrice = parseInt(
    document.querySelector(".xiaoquUnitPrice")?.textContent ?? "0"
  );
  const city = extractCityFromUrl(window.location.href) ?? "unknown";
  const cid = extractCidFromHomePageUrl(window.location.href);
  if (!cid) {
    throw new Error("cid is null. url:" + window.location.href);
  }
  return {
    cid,
    city,
    name,
    avgUnitPrice,
  };
}

export async function parseAllOfKeRentCommunity() {
  const name = document.querySelector(".sec1")?.textContent ?? undefined;
  const totalCount = Number.parseInt(
    document.querySelector(".content__title--hl")?.textContent ?? ""
  ); //totalCount
  const communityUrl = document
    .querySelector(".content__title > a:nth-child(3)")
    ?.getAttribute("href"); //url
  if (!communityUrl) {
    throw new Error("community url is null");
  }
  const city = extractCityFromKeRentUrl(communityUrl);
  const cid = extractCidFromKeRentUrl(communityUrl);
  const pageNo = extractPageNumberFromKeRentUrl(window.location.href);
  const list: { name: string; desc: string; price: number; rid: string }[] = [];
  document
    .querySelectorAll(".content__list .content__list--item--main")
    .forEach((element) => {
      const name = element.querySelector(".twoline")?.textContent?.trim() ?? "";
      const path = element.querySelector(".twoline")?.getAttribute("href");
      const rid = extractRidFromKeRentUrl(path)!;
      const desc = trimDesc(
        element.querySelector(".content__list--item--des")?.textContent ?? ""
      );
      const price = Number.parseInt(
        element.querySelector(".content__list--item-price > em")?.textContent ??
          ""
      );
      list.push({ name, rid, desc, price });
    });
  return { name, totalCount, cid, city, pageNo, list };
}

/**
 * 通过一个复杂的过程处理不同的情况, 返回community name
 */
function complicatedSelectCommunityName() {
  // 底部链接上的小区名字(小区存在的情况下)
  const communityNameInLink = (
    document.querySelector(".crumbs > h1 > a")?.textContent || ""
  )
    .trim()
    .replace(/小区|出售|二手房/g, "");

  // 房源列表中的小区名字(房源存在的情况下)
  const communityNamesInList: string[] = [];
  document.querySelectorAll('a[data-el="region"]').forEach((element) => {
    const communityName = element.textContent?.trim();
    if (communityName) {
      communityNamesInList.push(communityName);
    }
  });

  /**
   * 小区名字(必须在上一步exist==true的情况下)
   */
  const nameOption1 = communityNameInLink; //直接通过链接中的文字获取
  const nameOption2 = tryGetAllSameOne(communityNamesInList); //通过列表中的项获取,在不存在房源的情况下不能获取
  //优先选择nameOption2
  return nameOption2
    ? nameOption2.replace(/小区|出售|二手房/g, "")
    : nameOption1;
}

function tryGetAllSameOne(arr: string[]): string | undefined {
  if (!arr) return undefined;
  const first = arr[0];
  for (let str of arr) {
    if (first != str) {
      return undefined;
    }
  }
  return first;
}

/**
 *  返回desc从第二个'/'之后的左右内容, 并把空格和换行符替换为空
 */
function trimDesc(desc: string): string {
  const parts = desc.split("/");
  if (parts.length > 2) {
    return parts.slice(2).join("/").replace(/\s+/g, "");
  }
  return "";
}
