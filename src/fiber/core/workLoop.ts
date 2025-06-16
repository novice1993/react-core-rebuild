import { FiberNode } from "../type.fiber";
import { performUnitOfWork } from "./performUnitOfWork";

export function workLoop(fiber: FiberNode | null): void {
  let workInProgress: FiberNode | null = fiber;

  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
