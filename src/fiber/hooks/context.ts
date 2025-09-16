import { FiberNode } from "../type.fiber";
import { Hook } from "./types";

// 현재 렌더링 중인 fiber, hook 추적용 포인터를 담은 객체
export const hookContext = {
  currentlyRenderingFiber: null as FiberNode | null,
  workInProgressHook: null as Hook | null, // 쓰기용 포인터 (새로운 Hook 리스트)
  currentHook: null as Hook | null, // 읽기용 포인터 (이전 Hook 리스트)
};

export function prepareToUseHooks(fiber: FiberNode) {
  hookContext.currentlyRenderingFiber = fiber;

  // 업데이트 시, 이전 트리(current)의 Hook 리스트를 참조하기 위해 설정
  const current = fiber.alternate;
  if (current) {
    hookContext.currentHook = current.memoizedState;
  } else {
    hookContext.currentHook = null;
  }

  // 새로운 Hook 리스트를 만들기 위해 포인터를 초기화
  hookContext.workInProgressHook = null;
}

export function finishUsingHooks() {
  hookContext.currentlyRenderingFiber = null;
  hookContext.workInProgressHook = null;
  hookContext.currentHook = null;
}
