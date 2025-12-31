import { Hook } from "./types";
import { hookContext } from "./context";

function createInitHookState(): Hook {
  return {
    memoizedState: null,
    queue: { pending: null },
    next: null,
    memoizedEffect: null,
  };
}

export function getNextHook(): Hook {
  let hook: Hook;

  // 1. 업데이트 시: 이전 Hook의 상태를 복제
  if (hookContext.currentHook) {
    hook = {
      memoizedState: hookContext.currentHook.memoizedState,
      queue: hookContext.currentHook.queue,
      next: null, // next는 새로 연결해야 하므로 null로 초기화
      memoizedEffect: hookContext.currentHook.memoizedEffect, // memoizedEffect 복사
    };
    // 읽기 포인터를 다음으로 이동
    hookContext.currentHook = hookContext.currentHook.next;
  }
  // 2. 첫 렌더링(Mount) 시: 새로운 Hook을 생성
  else {
    hook = createInitHookState();
  }

  // --- 새로운 Hook 리스트(workInProgress)에 연결 ---
  if (!hookContext.workInProgressHook) {
    // 첫 번째 Hook인 경우, Fiber의 memoizedState에 직접 연결
    hookContext.currentlyRenderingFiber!.memoizedState = hook;
    hookContext.workInProgressHook = hook;
  } else {
    // 이후 Hook들은 next 포인터로 연결
    hookContext.workInProgressHook.next = hook;
    hookContext.workInProgressHook = hook;
  }

  return hook;
}
