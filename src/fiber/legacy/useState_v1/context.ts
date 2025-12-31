import type { FiberNode } from "@/fiber/type.fiber";

/** 현재 렌더링 중인 Fiber를 참조하는 포인터 */
let currentlyRenderingFiber: FiberNode | null = null;

/** 현재 렌더링 중인 Fiber를 포인터에 할당하는 함수 */
export function setCurrentFiber(fiber: FiberNode) {
  currentlyRenderingFiber = fiber;
}

/** 현재 렌더링 중인 Fiber를 참조하는 포인터를 반환하는 함수 */
export function getCurrentFiber(): FiberNode {
  if (!currentlyRenderingFiber) {
    throw new Error("No fiber is currently rendering");
  }
  return currentlyRenderingFiber;
}
