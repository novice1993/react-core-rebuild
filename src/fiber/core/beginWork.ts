import { FiberNode } from "../type.fiber";
import { setFiberFlag } from "../utils.fiber";
import { FiberFlags } from "../constants";

export function beginWork(fiber: FiberNode): FiberNode | null {
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

  return fiber.child;
}
