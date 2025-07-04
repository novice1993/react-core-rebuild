import { Effect, Hook } from "./types";
import { FiberNode } from "../type.fiber";

export function flushLayoutEffect(fiber: FiberNode) {
  let hook = fiber.memoizedState as Hook | null;
  while (hook !== null) {
    if (hook.memoizedEffect && hook.memoizedEffect.tag === "Layout") {
      const effect = hook.memoizedEffect as Effect;
      // 등록된 clean up 함수 실행
      if (effect.destroy) effect.destroy();

      // 콜백함수 실행 + clean up 함수 갱신
      const cleanUp = effect.create();
      if (typeof cleanUp === "function") effect.destroy = cleanUp;
    }
    hook = hook.next;
  }
}

export function flushPassiveEffect(fiber: FiberNode) {
  let hook = fiber.memoizedState as Hook | null;
  while (hook !== null) {
    if (hook.memoizedEffect && hook.memoizedEffect.tag === "Passive") {
      const effect = hook.memoizedEffect as Effect;
      // 등록된 clean up 함수 실행
      if (effect.destroy) effect.destroy();

      // 콜백함수 실행 + clean up 함수 갱신
      const cleanUp = effect.create();
      if (typeof cleanUp === "function") effect.destroy = cleanUp;
    }
    hook = hook.next;
  }
}
