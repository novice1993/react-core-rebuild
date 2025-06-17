import { FiberNode } from "../type.fiber";
import { commitWork } from "./commitWork";

export function commitUnitOfWork(fiber: FiberNode): void {
  let node: FiberNode | null = fiber;

  while (node !== null) {
    commitWork(node);

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
