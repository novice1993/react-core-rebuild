import { FiberNode } from "../type.fiber";
import { Hook } from "./types";

// 현재 렌더링 중인 fiber, hook 추적용 포인터를 담은 객체
export const hookContext = {
  currentlyRenderingFiber: null as FiberNode | null,
  workInProgressHook: null as Hook | null,
};

export function prepareToUseHooks(fiber: FiberNode) {
  hookContext.currentlyRenderingFiber = fiber;
  hookContext.workInProgressHook = fiber.memoizedState;
}
