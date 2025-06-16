import { Effect, Hook } from "./types";
import { getNextHook } from "./getNextHook";
import { hookContext } from "./context";

type EffectTag = "Passive" | "Layout";

export function useEffect(
  create: () => void | (() => void),
  deps: any[] | undefined
) {
  updateEffect(create, deps, "Passive");
}

export function useLayoutEffect(
  create: () => void | (() => void),
  deps: any[] | undefined
) {
  updateEffect(create, deps, "Layout");
}

/**
 * 의존성 배열 변경을 체크하여 effect 실행 리스트에 포함 여부를 결정하는 함수
 */
function updateEffect(
  create: () => void | (() => void),
  deps: any[] | undefined,
  tag: EffectTag
) {
  const hook = getNextHook();
  const prevEffect = hook.memoizedState as Effect | null;

  let isDepsChanged = true;

  if (prevEffect && deps && prevEffect.deps) {
    isDepsChanged = isEffectDepsEqual(deps, prevEffect.deps);
  }

  if (isDepsChanged) {
    const effect: Effect = {
      create,
      destroy: prevEffect?.destroy,
      deps: deps ?? null,
      tag,
    };

    // fiber memoizedState 갱신
    hook.memoizedState = effect;

    // commit 후 실행 될 effect 목록에 저장
    const fiber = hookContext.currentlyRenderingFiber;
    if (fiber && !fiber?.effects) fiber.effects = [];
    fiber?.effects?.push(effect);

    if (fiber) {
      if (tag === "Passive") {
        fiber.flags |= 0b0010; // PassiveEffect
      } else {
        fiber.flags |= 0b0100; // LayoutEffect
      }
    }
  }
}

/**
 * useEffect의 의존성 배열에 할당된 값을 얕은 비교하는 함수
 */
function isEffectDepsEqual(nextDeps: any[], prevDeps: any[]) {
  if (nextDeps.length !== prevDeps.length) return false;

  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) return false;
  }

  return true;
}
