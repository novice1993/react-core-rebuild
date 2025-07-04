import { FiberNode } from "../type.fiber";
import { hasFiberFlag } from "../utils";
import { FiberFlags } from "../constants";

export function completeWork(fiber: FiberNode): void {
  const isPlacement = hasFiberFlag(fiber.flags, FiberFlags.Placement);
  const isUpdate = hasFiberFlag(fiber.flags, FiberFlags.Update);

  if (fiber.type === "TEXT_ELEMENT") {
    if (isPlacement && fiber.stateNode === null) {
      const textNode = document.createTextNode(fiber.pendingProps.nodeValue);
      fiber.stateNode = textNode;
      
    }
  }

  // Host 컴포넌트일 때
  else if (typeof fiber.type === "string") {
    // 1) 새롭게 생성되는 컴포넌트인 경우
    if (isPlacement && fiber.stateNode === null) {
      const dom = document.createElement(fiber.type);
      fiber.stateNode = dom;
      
    }

    // 2) 갱신되는 컴포넌트인 경우
    else if (isUpdate) {
      
    }
  }

  // props 설정
  fiber.memoizedProps = fiber.pendingProps;
}
