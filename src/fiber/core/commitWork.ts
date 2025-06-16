import { FiberNode } from "../type.fiber";
import { getHostParent, patchProps } from "../utils.fiber";
import { flushLayoutEffect, flushPassiveEffect } from "../hooks/flushEffects";
import { hasFiberFlag } from "../utils.fiber";
import { FiberFlags } from "../constants";

export function commitWork(fiber: FiberNode): void {
  // 1. Placement 대상일 경우 부모 요소에 apeendChild 처리
  if (hasFiberFlag(fiber.flags, FiberFlags.Placement) && fiber.stateNode) {
    const parentDOM = getHostParent(fiber);
    if (parentDOM) {
      parentDOM.appendChild(fiber.stateNode);
      console.log(
        `[commitWork] <${fiber.type}> → append to <${parentDOM.tagName}>`
      );
    }
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

  // 자식 요소 commit 수행
  if (fiber.child) commitWork(fiber.child);
  // 형제 요소 commit 수행
  if (fiber.sibling) commitWork(fiber.sibling);
}
