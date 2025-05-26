import { FiberNode } from "./type.fiber";

export function beginWork(fiber: FiberNode): void {
  if (typeof fiber.type === "string" && !fiber.stateNode) {
    fiber.flags = "Placement";
    console.log(`[beginWork] ${fiber.type} → flags = Placement`);
  }

  if (fiber.child) beginWork(fiber.child);

  if (fiber.sibling) beginWork(fiber.sibling);
}
