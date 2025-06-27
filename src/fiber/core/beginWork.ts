import { FiberNode } from "../type.fiber";
import { setFiberFlag } from "../utils.fiber";
import { FiberFlags } from "../constants";
import { reconcileChildren } from "./reconcileChildren";

export function beginWork(fiber: FiberNode): FiberNode | null {
  console.log(`[beginWork] 처리 시작: ${fiber.type}`);

  if (fiber.type === "HostRoot") {
    return updateHostRoot(fiber);
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
