import { FiberNode, FiberRoot } from "../type.fiber";
import { workLoop } from "../core/workLoop";
import { commitUnitOfWork } from "../core/commitUnitOfWork";

/**
 * 이중 버퍼링을 위해 work-in-progress Fiber를 생성하거나 재활용하는 함수
 * @param current 현재 Fiber 트리
 * @returns work-in-progress Fiber
 */
function createWorkInProgress(current: FiberNode): FiberNode {
  let workInProgress = current.alternate;

  // 1. workInProgress 트리가 없는 경우 (초기 렌더링)
  if (workInProgress === null) {
    workInProgress = {
      ...current,
      alternate: current,
      // 초기 렌더링 시에는 updateContainer에서 설정한 pendingProps를 사용
      pendingProps: current.pendingProps,
      flags: 0,
      child: null,
      sibling: null,
    };
    current.alternate = workInProgress;
  }
  // 2. workInProgress 트리가 있는 경우 (상태 업데이트)
  else {
    // 상태 업데이트 시에는 마지막으로 완료된 memoizedProps를 기반으로 작업을 시작
    // current의 stateNode를 workInProgress로 복사하여 DOM 참조를 유지합니다.
    workInProgress.stateNode = current.stateNode;
    workInProgress.pendingProps = current.pendingProps;
    // 작업에 들어가기 전, effect flag와 자식/형제 포인터를 초기화
    workInProgress.flags = 0;
    workInProgress.child = null;
    workInProgress.sibling = null;
  }

  return workInProgress;
}

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

export function scheduleUpdateOnFiber(fiber: FiberNode) {
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
