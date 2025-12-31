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
  // 1-2. Deletion 대상일 경우 DOM에서 제거
  else if (hasFiberFlag(fiber.flags, FiberFlags.Deletion)) {
    unmountEffects(fiber);
    commitDeletion(fiber);
  }
  // 1-3. Update 대상일 경우 기존 DOM 재사용
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

  // LayoutEffect 동기 실행
  if (hasFiberFlag(fiber.flags, FiberFlags.LayoutEffect)) {
    flushLayoutEffect(fiber);
  }

  // PassiveEffect 비동기 실행
  if (hasFiberFlag(fiber.flags, FiberFlags.PassiveEffect)) {
    queueMicrotask(() => {
      flushPassiveEffect(fiber);
    });
  }
}

function commitDeletion(fiber: FiberNode) {
  let node: FiberNode | null = fiber;

  while (node !== null) {
    // 현재 노드의 DOM 제거
    if (node.stateNode) {
      const parentDOM = getHostParent(node);
      if (
        parentDOM instanceof HTMLElement &&
        node.stateNode instanceof HTMLElement
      ) {
        // DOM에서 이미 제거되었는지 확인
        if (parentDOM.contains(node.stateNode)) {
          parentDOM.removeChild(node.stateNode);
        }
      }
    }

    // 자식으로 이동
    if (node.child) {
      node = node.child;
      continue;
    }

    // 형제로 이동
    if (node.sibling) {
      node = node.sibling;
      continue;
    }

    // 부모로 백트래킹하면서 형제가 있는 부모 찾기
    while (node && node.sibling === null) {
      node = node.return;
      if (node === fiber) break; // 시작점에 도달하면 종료
    }

    if (node && node !== fiber) {
      node = node.sibling;
    } else {
      break;
    }
  }
}

/**
 * Fiber와 그 자식, 형제 Fiber들을 순회하며 이펙트의 destroy 함수를 호출합니다.
 */
function unmountEffects(fiber: FiberNode | null) {
  if (fiber === null) return;

  let node: FiberNode | null = fiber;

  while (node !== null) {
    // 현재 Fiber의 이펙트 destroy 함수 호출
    let hook = node.memoizedState;
    while (hook !== null) {
      if (hook.memoizedEffect && hook.memoizedEffect.destroy) {
        hook.memoizedEffect.destroy();
      }
      hook = hook.next;
    }

    // 자식으로 이동
    if (node.child) {
      node = node.child;
      continue;
    }

    // 형제로 이동
    if (node.sibling) {
      node = node.sibling;
      continue;
    }

    // 부모로 백트래킹하면서 형제가 있는 부모 찾기
    while (node && node.sibling === null) {
      node = node.return;
      if (node === fiber) break; // 시작점에 도달하면 종료
    }

    if (node && node !== fiber) {
      node = node.sibling;
    } else {
      break;
    }
  }
}
