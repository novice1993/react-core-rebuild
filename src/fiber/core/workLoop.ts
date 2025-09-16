import { FiberNode } from "../type.fiber";
import { performUnitOfWork } from "./performUnitOfWork";

export function workLoop(fiber: FiberNode | null): FiberNode | null {
  let workInProgress: FiberNode | null = fiber;

  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }

  // root fiber 찾아서 반환 (fiber tree 최상위)
  let root = fiber;
  while (root && root.return) {
    root = root.return;
  }

  return root;
}
