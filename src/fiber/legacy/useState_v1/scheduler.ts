import { beginWork } from "@/fiber/core/beginWork";
import { completeWork } from "@/fiber/core/completeWokr";
import { commitWork } from "@/fiber/core//commitWork";
import type { FiberNode } from "@/fiber/type.fiber";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  beginWork(fiber);
  completeWork(fiber);
  commitWork(fiber);
}
