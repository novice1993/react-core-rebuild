import { FiberNode } from "../type.fiber";
import { beginWork } from "../core/beginWork";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  beginWork(fiber);
}
