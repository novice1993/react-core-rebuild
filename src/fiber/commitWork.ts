import { FiberNode } from "./type.fiber";

function findHostParent(fiber: FiberNode): HTMLElement | null {
  let parent = fiber.return;

  // 1. 부모 Fiber가 존재하는 경우
  while (parent) {
    // 1-1. HTML Element를 기반으로 한 HostComponent일 경우 포인터 반환
    if (typeof parent.type === "string" && parent.stateNode) {
      return parent.stateNode;
    }

    // 1-2. 아닐 경우 트리 상부로 올라가며 부모 Fiber를 계속 탐색
    parent = parent.return;
  }

  // 2. 부모 Fiber가 존재하지 않는 경우 null 반환
  return null;
}

export function commitWokr(fiber: FiberNode): void {
  if (fiber.flags === "Placement" && fiber.stateNode) {
    // Parent Fiber가 존재하며, HTML 요소 기반일 경우 자식 요소로 삽입
    const parentDOM = findHostParent(fiber);
    if (parentDOM) parentDOM.appendChild(fiber.stateNode);
  }

  // 자식 요소 commit 수행
  if (fiber.child) {
    commitWokr(fiber.child);
  }

  // 형제 요소 commit 수행
  if (fiber.sibling) {
    commitWokr(fiber.sibling);
  }
}
