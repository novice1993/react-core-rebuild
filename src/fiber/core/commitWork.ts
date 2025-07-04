import { FiberNode, FiberRoot } from "../type.fiber"; // FiberRoot 타입 임포트 추가
import { getHostParent, patchProps, hasFiberFlag } from "../utils";
import { flushLayoutEffect, flushPassiveEffect } from "../hooks/flushEffects";
import { FiberFlags } from "../constants";

export function commitWork(fiber: FiberNode): void {
  // 1-1. Placement 대상일 경우 부모 요소에 apeendChild 처리
  if (hasFiberFlag(fiber.flags, FiberFlags.Placement) && fiber.stateNode) {
    const parentDOM = getHostParent(fiber);
    // parentDOM이 HTMLElement인 경우에만 appendChild 호출
    if (parentDOM instanceof HTMLElement) {
      parentDOM.appendChild(fiber.stateNode as HTMLElement | Text); // fiber.stateNode가 DOM 노드임을 단언
      
    }
  }

  // 1-2. Update 대상일 경우 기존 DOM 재사용
  else if (hasFiberFlag(fiber.flags, FiberFlags.Update) && fiber.stateNode) {
    // 텍스트 노드 업데이트
    if (fiber.type === "TEXT_ELEMENT") {
      (fiber.stateNode as Text).nodeValue = fiber.pendingProps.nodeValue; // Text 타입으로 단언
      
    }
    
  }

  // 2. Update 대상일 경우 props 갱신 (HTMLElement만)
  // fiber.stateNode가 HTMLElement 인스턴스인 경우에만 patchProps 호출
  if (fiber.stateNode instanceof HTMLElement && fiber.type !== "TEXT_ELEMENT") {
    patchProps(
      fiber.stateNode,
      fiber.alternate?.memoizedProps,
      fiber.memoizedProps
    );
  }

  if (fiber.effects?.length) {
    // LayoutEffect 동기 실행
    if (hasFiberFlag(fiber.flags, FiberFlags.LayoutEffect)) {
      flushLayoutEffect(fiber.effects);
    }

    // PassiveEffect 비동기 실행
    if (hasFiberFlag(fiber.flags, FiberFlags.PassiveEffect)) {
      queueMicrotask(() => {
        flushPassiveEffect(fiber.effects!);
      });
    }
  }
}
