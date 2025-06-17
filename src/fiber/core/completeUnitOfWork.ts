import { FiberNode } from "../type.fiber";
import { completeWork } from "./completeWork";

export function completeUnitOfWork(fiber: FiberNode): FiberNode | null {
  let node: FiberNode | null = fiber;

  do {
    // 1. 현재 노드에 대해 completeWork 수행
    completeWork(node);

    // 2. 형제 노드가 있으면 형제 노드 반환
    const siblingNode = node.sibling;
    if (siblingNode !== null) return siblingNode;

    // 3. 형제 노드가 없으면 부모 노드로 이동
    node = node.return;
  } while (node !== null);

  return null;
}
