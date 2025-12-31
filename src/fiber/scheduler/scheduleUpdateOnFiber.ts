import { FiberNode, FiberRoot } from "../type.fiber";
import { workLoop } from "../core/workLoop";
import { commitUnitOfWork } from "../core/commitUnitOfWork";
import { FiberFlags } from "../constants";

// Fiber 트리 상단으로 올라가 FiberRootNode를 찾는 헬퍼 함수
function getRootFiber(fiber: FiberNode | null): FiberRoot {
  let node = fiber;

  // 1. return 포인터를 따라서 최상단 노드까지 거슬러 올라감
  while (node && node.return) {
    node = node.return;
  }

  // 2. 최상단 노드의 stateNode가 참조 중인 root Fiber 반환
  if (node && node.type === "HostRoot" && node.stateNode) {
    return node.stateNode as FiberRoot;
  }

  throw new Error(
    "FiberRoot를 찾을 수 없습니다. Fiber 트리가 올바르게 연결되지 않았습니다."
  );
}

/**
 * 이중 버퍼링을 위해 work-in-progress Fiber를 생성하거나 재활용하는 함수
 * @param current 현재 Fiber 트리
 * @returns work-in-progress Fiber
 */
function createWorkInProgress(current: FiberNode): FiberNode {
  let workInProgress = current.alternate;

  // workInProgress 트리가 없는 경우 (초기 렌더링)
  if (workInProgress === null) {
    workInProgress = {
      ...current,
      alternate: current,
    };

    current.alternate = workInProgress;
  }

  workInProgress.pendingProps = current.pendingProps;
  workInProgress.flags = FiberFlags.NoFlags;
  workInProgress.child = null;
  workInProgress.sibling = null;

  return workInProgress;
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // 어떤 Fiber Node를 인자로 전달받든 간에, Root Fiber를 참조하게 설정
  const fiberRoot = getRootFiber(fiber);

  const workInProgress = createWorkInProgress(fiberRoot.current);
  const finishedWork = workLoop(workInProgress);

  if (finishedWork && fiberRoot) {
    fiberRoot.finishedWork = finishedWork;

    commitUnitOfWork(finishedWork);
    fiberRoot.current = fiberRoot.finishedWork;
    fiberRoot.finishedWork = null;
  } else {
    console.log(`❌ [scheduleUpdateOnFiber] commit 단계 스킵`);
  }
}
