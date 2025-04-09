import {
  extractCidFromKeRentUrl,
  extractCityFromKeRentUrl,
  extractPageNumberFromKeRentUrl,
  extractRidFromKeRentUrl,
} from "@/utils/lj-url";

export async function parseAllOfKeRentCommunity() {
  const name = document.querySelector(".sec1")?.textContent ?? undefined;
  const count = Number.parseInt(
    document.querySelector(".content__title--hl")?.textContent ?? ""
  ); //totalCount
  const communityUrl = document
    .querySelector(".content__title > a:nth-child(3)")
    ?.getAttribute("href"); //url
  if (!communityUrl) {
    throw new Error("community url is null");
  }
  const city = extractCityFromKeRentUrl(communityUrl)!;
  const cid = extractCidFromKeRentUrl(communityUrl)!;
  const pageNo = extractPageNumberFromKeRentUrl(window.location.href);

  const list: {
    name: string;
    area: number;
    desc: string;
    price: number;
    city: string;
    rid: string;
    source?: string;
  }[] = [];

  //maxpage
  const maxPageNo = parseInt(
    document.querySelector(".content__pg")?.getAttribute("data-totalpage") ??
      "1"
  );
  document
    .querySelectorAll(".content__list .content__list--item--main")
    .forEach((element) => {
      const name = element.querySelector(".twoline")?.textContent?.trim() ?? "";
      const path = element.querySelector(".twoline")?.getAttribute("href");
      const rid = extractRidFromKeRentUrl(path)!;
      const descRaw =
        element.querySelector(".content__list--item--des")?.textContent ?? "";
      const price = Number.parseInt(
        element.querySelector(".content__list--item-price > em")?.textContent ??
          ""
      );
      //area
      const area = parseFloat(descRaw?.match(/\d+\.\d+㎡/)?.[0] ?? "");
      const desc = trimDesc(descRaw);

      const source =
        element.querySelector(".brand")?.textContent?.trim() ?? undefined;

      const cidUrl = element
        .querySelector(".content__list--item--des >  a:nth-child(3)")
        ?.getAttribute("href");
      const cidInUrl = extractCidFromKeRentUrl(cidUrl);
      if (cidInUrl === cid) {
        list.push({ name, rid, area, desc, price, source, city });
      }
    });
  return { name, maxPageNo, count, cid, city, pageNo, list };
}

/**
 *  返回desc从第二个'/'之后的左右内容, 并把空格和换行符替换为空
 */
function trimDesc(desc: string): string {
  const parts = desc.split("/");
  if (parts.length < 2) return "";

  const isSpecial = parts[0].trim() === "精选";
  if (isSpecial) return parts.slice(3).join("/").replace(/\s+/g, "");
  return parts.slice(2).join("/").replace(/\s+/g, "");
}
