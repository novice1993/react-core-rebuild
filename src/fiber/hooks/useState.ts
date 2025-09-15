import { getNextHook } from "./getNextHook";
import { enqueueUpdate, processUpdateQueue } from "./updateQueue";
import { scheduleUpdateOnFiber } from "../scheduler/scheduleUpdateOnFiber";
import { hookContext } from "./context";

export function useState<T>(
  initialState: T
): [T, (action: T | ((prev: T) => T)) => void] {
  const hook = getNextHook();

  // 1. 최초 호출인 경우 -> 초기 값 할당
  if (hook.memoizedState === null) {
    hook.memoizedState = initialState;
  }

  // 2. 최초 호출이 아닌 경우 -> 업데이트 반영
  else {
    hook.memoizedState = processUpdateQueue(hook.queue, hook.memoizedState);
  }

  // 상태 갱신 함수
  const dispatch = (action: T | ((prev: T) => T)) => {
    enqueueUpdate(hook.queue, action);
    scheduleUpdateOnFiber(hookContext.currentlyRenderingFiber!);
  };

  return [hook.memoizedState, dispatch];
}
