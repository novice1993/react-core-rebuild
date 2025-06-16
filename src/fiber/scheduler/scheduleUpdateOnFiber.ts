import { FiberNode } from "../type.fiber";
import { workLoop } from "../core/workLoop";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  workLoop(fiber);
}
