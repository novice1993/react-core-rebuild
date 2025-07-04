import { createTextFiber } from "./createTextFiber";
import { createFiberNode } from "./createFiberNode";
import { FiberNode } from "../type.fiber";
import { FiberFlags } from "../constants";

export function reconcileChildren(
  current: FiberNode | null,
  workInProgress: FiberNode,
  children: any[]
): void {
  // mount 상황: false, update 상황: true
  const shouldTrackSideEffects = current !== null;

  

  // 1. update 상황
  if (shouldTrackSideEffects) {
    
    reconcileChildrenArray(current, workInProgress, children);
  }

  // 2. mount 상황
  else {
    
    mountChildrenArray(workInProgress, children);
  }
}

function mountChildrenArray(workInProgress: FiberNode, children: any[]): void {
  let previousFiber: FiberNode | null = null;

  children.forEach((child, index) => {
    let childFiber: FiberNode;

    // 1. 텍스트 노드 처리
    if (typeof child === "string") {
      childFiber = createTextFiber(child, workInProgress);

      // 2. React Element 처리
    } else if (typeof child === "object" && child.type) {
      childFiber = createFiberNode(child);
      childFiber.return = workInProgress;
    }

    // 3. null, undefined, boolean 등은 무시
    else {
      return;
    }

    // child/sibling 연결
    if (index === 0) {
      workInProgress.child = childFiber;
    } else if (previousFiber) {
      previousFiber.sibling = childFiber;
    }

    previousFiber = childFiber;
  });
}

function reconcileChildrenArray(
  current: FiberNode,
  workInProgress: FiberNode,
  children: any[]
): void {
  let oldFiber = current.child; // 기존 Fiber Tree 순회용
  let newIndex = 0; // 새 children 배열 순회용
  let previousNewFiber: FiberNode | null = null; // sibling 연결용

  // 첫 번째 render인 경우 mount로 처리
  if (oldFiber === null) {
    
    mountChildrenArray(workInProgress, children);
    return;
  }

  // 기존 fiber와 새 children을 하나씩 비교
  while (oldFiber !== null && newIndex < children.length) {
    const child = children[newIndex];
    let newFiber: FiberNode | null = null;

    // 1. 재활용 가능 여부 판단
    // 텍스트 노드인 경우
    const isTextReuse =
      oldFiber.type === "TEXT_ELEMENT" && typeof child === "string";
    // Fiber일 경우, key/type이 동일할 때
    const isElementReuse =
      oldFiber.type === getElementType(child) &&
      oldFiber.key === getElementKey(child);
    const canReuse = isTextReuse || isElementReuse;

    // 1-1. 재활용 가능한 경우
    if (canReuse) {
      newFiber = {
        ...oldFiber,
        pendingProps: getElementProps(child),
        alternate: oldFiber,
        return: workInProgress,
        sibling: null,
        flags: FiberFlags.Update,
      };
    }

    // 1-2. 불가능한 경우
    else {
      if (typeof child === "string") {
        newFiber = createTextFiber(child, workInProgress);
      } else if (typeof child === "object" && child.type) {
        newFiber = createFiberNode(child);
        newFiber.return = workInProgress;
      }
    }

    // sibling 연결
    if (newIndex === 0) {
      workInProgress.child = newFiber;
    } else if (previousNewFiber) {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;

    newIndex++;
    oldFiber = oldFiber.sibling;
  }
}

function getElementKey(child: any): string | null {
  return typeof child === "string" ? null : child?.key || null;
}

function getElementType(child: any): string {
  return typeof child === "string" ? "TEXT_ELEMENT" : child?.type;
}

function getElementProps(child: any): any {
  return typeof child === "string" ? { nodeValue: child } : child.props;
}
