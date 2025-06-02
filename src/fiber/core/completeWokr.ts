import { FiberNode } from "../type.fiber";

export function completeWork(fiber: FiberNode): void {
  const isPlacement = fiber.flags === "Placement";
  const isUpdate = fiber.flags === "Update";

  // Host 컴포넌트일 때
  if (typeof fiber.type === "string") {
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

    // props 설정
    fiber.memoizedProps = fiber.pendingProps;
  }

  if (fiber.child) completeWork(fiber.child);
  if (fiber.sibling) completeWork(fiber.sibling);
}
