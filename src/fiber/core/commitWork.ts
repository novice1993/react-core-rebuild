import { FiberNode } from "../type.fiber";
import { getHostParent, patchProps } from "../utils.fiber";
import { flushLayoutEffect, flushPassiveEffect } from "../hooks/flushEffects";
import { hasFiberFlag } from "../utils.fiber";
import { FiberFlags } from "../constants";

export function commitWork(fiber: FiberNode): void {
  // 1-1. Placement 대상일 경우 부모 요소에 apeendChild 처리
  if (hasFiberFlag(fiber.flags, FiberFlags.Placement) && fiber.stateNode) {
    const parentDOM = getHostParent(fiber);
    if (parentDOM) {
      parentDOM.appendChild(fiber.stateNode);
      console.log(
        `[commitWork] <${fiber.type}> → append to <${parentDOM.tagName}>`
      );
    }
  }

  // 1-2. Update 대상일 경우 기존 DOM 재사용
  else if (hasFiberFlag(fiber.flags, FiberFlags.Update) && fiber.stateNode) {
    // 텍스트 노드 업데이트
    if (fiber.type === "TEXT_ELEMENT") {
      fiber.stateNode.textContent = fiber.pendingProps.nodeValue;
      console.log(
        `[commitWork] TEXT_ELEMENT → 내용 변경: "${fiber.pendingProps.nodeValue}"`
      );
    }
    console.log(`[commitWork] <${fiber.type}> → 기존 DOM 재사용`);
  }

  // 2. Update 대상일 경우 props 갱신
  if (hasFiberFlag(fiber.flags, FiberFlags.Update) && fiber.stateNode) {
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
