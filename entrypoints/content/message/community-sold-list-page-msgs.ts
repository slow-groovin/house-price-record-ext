import { onMessage } from "@/messaging";
import { parseCommunityListPage } from "../util/community-sold-dom-parse";

export function communitySoldListPageOnMessage() {
  // console.log("communitySoldListPageOnMessage");
  onMessage("parseCommunitySoldList", async ({}) => {
    return parseCommunityListPage();
  });
}
