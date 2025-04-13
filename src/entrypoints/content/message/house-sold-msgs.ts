import { onMessage } from "@@/messaging";

export function houseSoldPageOnMessages() {
  onMessage("parseHouseSold", async ({}) => {
    console.log("[parseHouseSold] receive message");
    const soldDate =
      document.querySelector(".record_list .record_detail:nth-of-type(1)")
        ?.textContent ?? undefined;
    const priceText = document.querySelector(
      ".msg  >span:first-child >label"
    )?.textContent;
    const price = Number(priceText);

    return {
      price,
      soldDate,
    };
  });
}
