import { FiberNode } from "../type.fiber";
import { beginWork } from "./beginWork";

export function performUnitOfWork(fiber: FiberNode): FiberNode | null {
  // 1. beginWork 수행
  const next = beginWork(fiber);

  // 2. 자식 노드가 있으면 자식 참조
  if (next !== null) {
    return next;
  }

  // 3. 자식 노드가 없을 경우 형제 노드 탐색
  return findNextUnitOfWork(fiber);
}

function findNextUnitOfWork(fiber: FiberNode | null): FiberNode | null {
  let node = fiber;

  while (node !== null) {
    // 1. 형제가 있으면 헝제 노드 반환
    if (node.sibling !== null) {
      return node.sibling;
    }

    // 2. 형제가 없으면 부모로 올라가서 부모의 형제 탐색
    node = node.return;
  }

  // 3. 루트까지 올라갈 경우 종료
  return null;
}
