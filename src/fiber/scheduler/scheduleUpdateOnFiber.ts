import { FiberNode } from "../type.fiber";
import { workLoop } from "../core/workLoop";
import { commitUnitOfWork } from "../core/commitUnitOfWork";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  workLoop(fiber);
  commitUnitOfWork(fiber);
}
