import { FiberNode } from "../type.fiber";
import { setFiberFlag } from "../utils";
import { FiberFlags } from "../constants";
import { reconcileChildren } from "./reconcileChildren";
import { prepareToUseHooks, finishUsingHooks } from "../hooks/context";

export function beginWork(workInProgress: FiberNode): FiberNode | null {
  if (workInProgress.type === "HostRoot") {
    return updateHostRoot(workInProgress);
  }

  // 함수형 컴포넌트 처리
  if (typeof workInProgress.type === "function") {
    return updateFunctionComponent(workInProgress);
  }

  // Host 컴포넌트 처리 (HTML 요소)
  if (typeof workInProgress.type === "string") {
    return updateHostComponent(workInProgress);
  }

  // 텍스트 노드 처리
  if (workInProgress.type === "TEXT_ELEMENT") {
    return null; // 텍스트 노드는 자식이 없으므로 항상 null
  }

  return null;
}

function updateHostRoot(fiber: FiberNode): FiberNode | null {
  const children = fiber.pendingProps?.children || [];

  reconcileChildren(fiber.alternate, fiber, children);
  return fiber.child;
}

function updateFunctionComponent(fiber: FiberNode): FiberNode | null {
  // hook context 설정
  prepareToUseHooks(fiber);

  // 컴포넌트 실행
  const Component = fiber.type as Function;
  const children = Component(fiber.pendingProps);

  // children 처리
  const childrenArray = Array.isArray(children) ? children : [children];
  reconcileChildren(fiber.alternate, fiber, childrenArray);

  // context 처리
  finishUsingHooks();

  return fiber.child;
}

function updateHostComponent(workInProgress: FiberNode): FiberNode | null {
  const prevFiber = workInProgress.alternate;
  const hasDOM = workInProgress.stateNode !== null;
  const propsChanged =
    prevFiber && prevFiber.memoizedProps !== workInProgress.pendingProps;

  if (!hasDOM) {
    workInProgress.flags = setFiberFlag(
      workInProgress.flags,
      FiberFlags.Placement
    );
  } else if (propsChanged) {
    workInProgress.flags = setFiberFlag(
      workInProgress.flags,
      FiberFlags.Update
    );
  }

  // Host 컴포넌트의 children도 reconcile 처리
  const children = workInProgress.pendingProps?.children || [];
  reconcileChildren(workInProgress.alternate, workInProgress, children);

  return workInProgress.child;
}
