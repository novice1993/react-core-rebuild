import { FiberNode } from "../type.fiber";
import { commitWork } from "./commitWork";
import { hasFiberFlag } from "../utils";
import { FiberFlags } from "../constants";

export function commitUnitOfWork(fiber: FiberNode): void {
  // effects 배열에 있는 Fiber들을 먼저 처리 (주로 Deletion 대상)
  if (fiber.effects) {
    fiber.effects.forEach((effectFiber) => {
      commitWork(effectFiber);
    });
  }

  let node: FiberNode | null = fiber;

  while (node !== null) {
    // Deletion 대상은 이미 effects 배열에서 처리되었으므로 스킵
    if (!hasFiberFlag(node.flags, FiberFlags.Deletion)) {
      commitWork(node);
    }

    if (node.child) {
      node = node.child;
      continue;
    }

    if (node.sibling) {
      node = node.sibling;
      continue;
    }

    // sibling이 있는 부모 탐색
    while (node && node.sibling === null) {
      node = node.return;
    }

    if (node && node !== fiber) {
      node = node.sibling;
    } else {
      break;
    }
  }
}
