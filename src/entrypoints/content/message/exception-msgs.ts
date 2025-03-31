import { onMessage } from "@@/messaging";
import { PauseError } from "@/utils/lib/BatchQueueExecutor";

export function loginPageOnMessage() {
  onMessage("parseOneCommunityListOnePage", async ({}) => {
    throw new PauseError(
      "需要登录, 请先打开网页登录后, 确保页面能正常打开后手动恢复运行!"
    );
  });
}
export function captchaPageOnMessage() {
  onMessage("parseOneCommunityListOnePage", async ({}) => {
    throw new PauseError(
      "遭遇了验证码, 请打开网页通过验证码后, 确保页面能正常打开后手动恢复运行!"
    );
  });
}
