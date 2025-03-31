import { onMessage } from "@@/messaging";
import { parseHousePage } from "../util/house-dom-parse";

export function housePageOnMessages() {
  onParseHouseMessage();
  onForTestUseMessage();
  console.log("house page onMessage() done.");
}

function onParseHouseMessage() {
  onMessage("parseHouse", async ({}) => {
    console.log("parseHouse receive message");
    return await parseHousePage();
  });
}

function onForTestUseMessage() {
  onMessage("simple", async ({ data }) => {
    if (data === "changePriceForTest") {
      const elem = document.querySelector("span.total");
      if (!elem) return;
      const totalPrice = elem?.textContent;
      elem.textContent = Number(totalPrice) + random(-50, 50) + "";
    } else {
      console.log("content.js, receive simple message:", data);
    }
    return { respMsg: "OK" };
  });
}
