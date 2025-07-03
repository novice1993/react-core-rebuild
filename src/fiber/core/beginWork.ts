import { FiberNode } from "../type.fiber";
import { setFiberFlag } from "../utils";
import { FiberFlags } from "../constants";
import { reconcileChildren } from "./reconcileChildren";
import { prepareToUseHooks, finishUsingHooks } from "../hooks/context";

export function beginWork(fiber: FiberNode): FiberNode | null {
  console.log(`[beginWork] 처리 시작: ${fiber.type}`);

  if (fiber.type === "HostRoot") {
    return updateHostRoot(fiber);
  }

  // 함수형 컴포넌트 처리
  if (typeof fiber.type === "function") {
    return updateFunctionComponent(fiber);
  }

  const prevFiber = fiber.alternate;
  const isHostComponent = typeof fiber.type === "string";
  const hasDOM = fiber.stateNode !== null;
  const propsChanged =
    prevFiber && prevFiber.memoizedProps !== prevFiber.pendingProps;

  if (isHostComponent && !hasDOM) {
    fiber.flags = setFiberFlag(fiber.flags, FiberFlags.Placement);
    console.log(`[beginWork] ${fiber.type} → flags = Placement`);
  } else if (isHostComponent && propsChanged) {
    fiber.flags = setFiberFlag(fiber.flags, FiberFlags.Update);
    console.log(`[beginWork] ${fiber.type} → flags = Update`);
  }

  // Host 컴포넌트의 children도 reconcile 처리
  if (isHostComponent) {
    const children = fiber.pendingProps?.children || [];
    reconcileChildren(fiber.alternate, fiber, children);
  }

  return fiber.child;
}

function updateHostRoot(fiber: FiberNode): FiberNode | null {
  const children = fiber.pendingProps?.children || [];
  console.log("[beginWork] HostRoot children:", children);

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
