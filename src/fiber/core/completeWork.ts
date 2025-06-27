import { FiberNode } from "../type.fiber";
import { hasFiberFlag } from "../utils.fiber";
import { FiberFlags } from "../constants";

export function completeWork(fiber: FiberNode): void {
  const isPlacement = hasFiberFlag(fiber.flags, FiberFlags.Placement);
  const isUpdate = hasFiberFlag(fiber.flags, FiberFlags.Update);

  if (fiber.type === "TEXT_ELEMENT") {
    if (isPlacement && fiber.stateNode === null) {
      const textNode = document.createTextNode(fiber.pendingProps.nodeValue);
      fiber.stateNode = textNode;
      console.log(
        `[completeWork] TEXT_ELEMENT → textNode 생성: "${fiber.pendingProps.nodeValue}"`
      );
    }
  }

  // Host 컴포넌트일 때
  else if (typeof fiber.type === "string") {
    // 1) 새롭게 생성되는 컴포넌트인 경우
    if (isPlacement && fiber.stateNode === null) {
      const dom = document.createElement(fiber.type);
      fiber.stateNode = dom;
      console.log(`[completeWork] ${fiber.type} → DOM 생성됨`);
    }

    // 2) 갱신되는 컴포넌트인 경우
    else if (isUpdate) {
      console.log(`[completeWork] <${fiber.type}> → 변경 예정 (props 갱신)`);
    }
  }

  // props 설정
  fiber.memoizedProps = fiber.pendingProps;
}
