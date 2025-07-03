import { Hook } from "./types";
import { hookContext } from "./context";

function createInitHookState(): Hook {
  return {
    memoizedState: null,
    queue: { pending: null },
    next: null,
  };
}

export function getNextHook(): Hook {
  let hook: Hook;

  // 1. 첫번쨰 useState 호출인 경우, 새 hook 생성
  if (!hookContext.workInProgressHook) {
    hook = createInitHookState();

    hookContext.currentlyRenderingFiber!.memoizedState = hook;
    hookContext.workInProgressHook = hook;
  }

  // 2. 첫번쨰 호출이 아닌 경우
  else {
    // 다음 hook이 없을 경우 생성
    if (!hookContext.workInProgressHook.next) {
      const next: Hook = createInitHookState();
      hookContext.workInProgressHook.next = next;
    }

    // render 대상이 되는 hook 교체
    hookContext.workInProgressHook = hookContext.workInProgressHook.next;
    hook = hookContext.workInProgressHook;
  }

  return hook;
}
