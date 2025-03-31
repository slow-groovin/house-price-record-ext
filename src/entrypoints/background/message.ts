import { onMessage } from "@@/messaging";

export function registerSimpleMessage() {
  class A {
    constructor(public msg: string) {
      console.log("new A", msg);
    }
    echo() {
      console.log("msg is", this.msg);
    }
  }
  onMessage("simple", async ({}) => {
    return new A("aaa");
  });
}
