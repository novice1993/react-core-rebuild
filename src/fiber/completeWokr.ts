import { FiberNode } from "./type.fiber";

export function completeWork(fiber: FiberNode): void {
  // props 설정
  fiber.memoizedProps = fiber.pendingProps;

  // 이전에 DOM이 생성되지 않았을 시, 생성 후 포인터에 주소 값 저장
  if (typeof fiber.type === "string" && fiber.stateNode === null) {
    const dom = document.createElement(fiber.type);
    fiber.stateNode = dom;
  }
}
