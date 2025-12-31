import { FiberNode } from "../type.fiber";
import { beginWork } from "./beginWork";
import { completeUnitOfWork } from "./completeUnitOfWork";

export function performUnitOfWork(workInProgress: FiberNode): FiberNode | null {
  // 1. beginWork 수행
  const next = beginWork(workInProgress);

  // 2. 자식 노드가 있으면 자식 참조
  if (next !== null) {
    return next;
  }

  // 3. 자식 노드가 없을 경우 completeUnitOfWork 호출
  return completeUnitOfWork(workInProgress);
}
