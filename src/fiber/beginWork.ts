import { FiberNode } from "./type.fiber";

export function beginWork(fiber: FiberNode): void {
  const prevFiber = fiber.alternate;

  const isHostComponent = typeof fiber.type === "string";
  const hasDOM = fiber.stateNode !== null;
  const propsChanged =
    prevFiber && prevFiber.memoizedProps !== prevFiber.pendingProps;

  if (isHostComponent && !hasDOM) {
    fiber.flags = "Placement";
    console.log(`[beginWork] ${fiber.type} → flags = Placement`);
  } else if (isHostComponent && propsChanged) {
    fiber.flags = "Update";
    console.log(`[beginWork] ${fiber.type} → flags = Update`);
  }

  if (fiber.child) beginWork(fiber.child);
  if (fiber.sibling) beginWork(fiber.sibling);
}
