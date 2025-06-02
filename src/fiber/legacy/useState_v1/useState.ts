import { getCurrentFiber } from "./context";
import { enqueueUpdate } from "./updateQueue";
import { scheduleUpdateOnFiber } from "./scheduler";

export function useState(initialState: any): [any, (next: any) => void] {
  const fiber = getCurrentFiber(); // 현재 render phase를 수행 중인 fiber 반환

  if (fiber.memoizedState === null) {
    fiber.memoizedState = initialState; // 초기 값 설정
  }

  const setState = (newState: any) => {
    enqueueUpdate(fiber, newState);
    scheduleUpdateOnFiber(fiber);
  };

  return [fiber.memoizedState, setState];
}
