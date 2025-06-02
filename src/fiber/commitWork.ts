import { FiberNode } from "./type.fiber";
import { getHostParent, patchProps } from "./utils.fiber";

export function commitWork(fiber: FiberNode): void {
  // 1. Placement 대상일 경우 부모 요소에 apeendChild 처리
  if (fiber.flags === "Placement" && fiber.stateNode) {
    const parentDOM = getHostParent(fiber);
    if (parentDOM) {
      parentDOM.appendChild(fiber.stateNode);
      console.log(
        `[commitWork] <${fiber.type}> → append to <${parentDOM.tagName}>`
      );
    }
  }

  // 2. Update 대상일 경우 props 갱신
  if (fiber.flags === "Update" && fiber.stateNode) {
    patchProps(
      fiber.stateNode,
      fiber.alternate?.memoizedProps,
      fiber.memoizedProps
    );
  }

  // 자식 요소 commit 수행
  if (fiber.child) commitWork(fiber.child);
  // 형제 요소 commit 수행
  if (fiber.sibling) commitWork(fiber.sibling);
}
