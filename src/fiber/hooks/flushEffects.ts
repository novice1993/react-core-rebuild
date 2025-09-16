import { Effect } from "./types";

export function flushLayoutEffect(effects: Effect[]) {
  effects.forEach((effect) => {
    if (effect.tag === "Layout") {
      // 등록된 clean up 함수 실행
      if (effect.destroy) effect.destroy();

      // 콜백함수 실행 + clean up 함수 갱신
      const cleanUp = effect.create();
      if (typeof cleanUp === "function") effect.destroy = cleanUp;
    }
  });
}

export function flushPassiveEffect(effects: Effect[]) {
  effects.forEach((effect) => {
    if (effect.tag === "Passive") {
      // 등록된 clean up 함수 실행
      if (effect.destroy) effect.destroy();

      // 콜백함수 실행 + clean up 함수 갱신
      const cleanUp = effect.create();
      if (typeof cleanUp === "function") effect.destroy = cleanUp;
    }
  });
}
