import { createTextFiber } from "./createTextFiber";
import { createFiberNode } from "./createFiberNode";
import { FiberNode } from "../type.fiber";
import { FiberFlags } from "../constants";

/**
 * React Reconciliation 엔진 - 자식 요소들을 비교하고 업데이트
 *
 * 주의: 현재 구현은 학습 목적으로 단순화되었으며, React 실제 구현과 다름
 * React 실제 구현: 두 패스 알고리즘 (key 없는 요소 순차 매칭 → key 있는 요소 Map 매칭)
 * 현재 구현: 모든 요소에 임시 키 생성 후 단일 Map으로 매칭
 */
export function reconcileChildren(
  current: FiberNode | null,
  workInProgress: FiberNode,
  children: any[]
): void {
  const shouldTrackSideEffects = current !== null;

  if (shouldTrackSideEffects) {
    // Update 상황: 기존 fiber와 새 children 비교하여 재사용/생성/삭제 결정
    reconcileChildrenArray(current, workInProgress, children);
  } else {
    // Mount 상황: 모든 children을 새로 생성
    mountChildrenArray(workInProgress, children);
  }
}

/**
 * Mount 단계: 모든 자식 요소를 새로 생성
 * - 기존 fiber가 없으므로 모든 요소가 Placement 대상
 * - sibling 연결을 통해 자식 체인 구성
 */
function mountChildrenArray(workInProgress: FiberNode, children: any[]): void {
  let previousFiber: FiberNode | null = null;

  children.forEach((child, index) => {
    let childFiber: FiberNode;

    // 1. 텍스트 노드 생성
    if (typeof child === "string") {
      childFiber = createTextFiber(child);
    }
    // 2. React Element 생성
    else if (typeof child === "object" && child.type) {
      childFiber = createFiberNode(child);
    }
    // 3. null, undefined, boolean 등은 렌더링에서 제외
    else {
      return;
    }

    // 부모 노드 연결
    childFiber.return = workInProgress;

    // 자식 체인 연결: 첫 번째는 child, 나머지는 sibling
    if (index === 0) {
      workInProgress.child = childFiber;
    } else if (previousFiber) {
      previousFiber.sibling = childFiber;
    }

    previousFiber = childFiber;
  });
}

/**
 * Update 단계: 기존 fiber와 새 children 비교하여 최적화된 업데이트 수행
 *
 * 알고리즘:
 * 1. 기존 fiber들을 Map에 저장 (임시 키 사용)
 * 2. 새 children을 순회하며 재사용 가능한 fiber 찾기
 * 3. 재사용 불가능한 경우 새 fiber 생성
 * 4. Map에 남은 fiber들은 삭제 대상으로 표시
 *
 * 주의: React 실제 구현과 다른 점
 * - React: key 없는 요소는 index 기반 직접 매칭
 * - 현재: 모든 요소에 `type-index` 형태의 임시 키 생성 후 Map 매칭
 */
function reconcileChildrenArray(
  current: FiberNode,
  workInProgress: FiberNode,
  newChildren: any[]
): void {
  // Step 1: 기존 fiber들을 Map에 저장 (재사용 대상 pool 생성)
  const oldChildrenMap = buildOldFiberMap(current);

  // Step 2: 새 children 처리 및 fiber 재사용/생성 결정
  const { connectedFibers, updatedMap } = processNewChildren(
    newChildren,
    oldChildrenMap,
    workInProgress
  );

  // Step 2c: 새 fiber 체인을 workInProgress에 연결
  connectNewFibers(connectedFibers, workInProgress);

  // Step 3: 재사용되지 않은 기존 fiber들을 삭제 대상으로 표시
  markRemainingFibersForDeletion(updatedMap, workInProgress);
}

/**
 * Step 1: 기존 fiber들을 Map에 저장하는 헬퍼 함수
 */
function buildOldFiberMap(current: FiberNode): Map<string | number, FiberNode> {
  const oldChildrenMap = new Map<string | number, FiberNode>();
  let oldFiber = current.child;
  let oldIndex = 0;

  while (oldFiber !== null) {
    const mapKey =
      oldFiber.key !== null
        ? oldFiber.key
        : `${oldFiber.type || "unknown"}-${oldIndex}`;

    oldChildrenMap.set(mapKey, oldFiber);
    oldFiber = oldFiber.sibling;
    oldIndex++;
  }

  return oldChildrenMap;
}

/**
 * Step 2: 새 children 처리 및 fiber 재사용/생성 결정하는 헬퍼 함수
 */
function processNewChildren(
  newChildren: any[],
  oldChildrenMap: Map<string | number, FiberNode>,
  workInProgress: FiberNode
): {
  connectedFibers: FiberNode[];
  updatedMap: Map<string | number, FiberNode>;
} {
  const connectedFibers: FiberNode[] = [];

  newChildren.forEach((child, index) => {
    const newFiber = createOrReuseFiber(
      child,
      index,
      oldChildrenMap,
      workInProgress
    );
    if (newFiber) {
      connectedFibers.push(newFiber);
    }
  });

  return { connectedFibers, updatedMap: oldChildrenMap };
}

/**
 * 개별 child에 대해 fiber를 생성하거나 재사용하는 헬퍼 함수
 */
function createOrReuseFiber(
  child: any,
  index: number,
  oldChildrenMap: Map<string | number, FiberNode>,
  workInProgress: FiberNode
): FiberNode | null {
  let newFiber: FiberNode | null = null;

  // 새 child의 키 생성 (기존 fiber와 매칭하기 위함)
  const key =
    getElementKey(child) ||
    (typeof child === "string"
      ? `TEXT_ELEMENT-${index}`
      : `${getElementType(child)}-${index}`);

  const oldFiberFromMap = oldChildrenMap.get(key);

  // Step 2a: 재사용 가능한 경우 (key와 type이 모두 일치)
  if (oldFiberFromMap && oldFiberFromMap.type === getElementType(child)) {
    newFiber = {
      ...oldFiberFromMap,
      stateNode: oldFiberFromMap.stateNode, // DOM 노드 재사용
      pendingProps: getElementProps(child),
      alternate: oldFiberFromMap, // 이중 버퍼링을 위한 참조
      return: workInProgress,
      sibling: null, // 새로운 sibling 체인에서 재설정
      flags: FiberFlags.Update, // 업데이트 플래그 설정
    };
    oldChildrenMap.delete(key); // 재사용된 fiber는 삭제 대상에서 제외
  }
  // Step 2b: 새로 생성해야 하는 경우
  else {
    if (typeof child === "string") {
      newFiber = createTextFiber(child);
      newFiber.return = workInProgress;
    } else if (typeof child === "object" && child.type) {
      newFiber = createFiberNode(child);
      newFiber.return = workInProgress;
    }

    if (newFiber) {
      newFiber.flags = FiberFlags.Placement; // 새 DOM 생성 플래그
    }
  }

  return newFiber;
}

/**
 * Step 2c: 새로 생성된 fiber들을 sibling 체인으로 연결하는 헬퍼 함수
 */
function connectNewFibers(
  fibers: FiberNode[],
  workInProgress: FiberNode
): void {
  let previousNewFiber: FiberNode | null = null;

  fibers.forEach((fiber, index) => {
    if (index === 0) {
      workInProgress.child = fiber;
    } else if (previousNewFiber) {
      previousNewFiber.sibling = fiber;
    }
    previousNewFiber = fiber;
  });
}

/**
 * Step 3: 재사용되지 않은 기존 fiber들을 삭제 대상으로 표시하는 헬퍼 함수
 */
function markRemainingFibersForDeletion(
  remainingOldFibers: Map<string | number, FiberNode>,
  workInProgress: FiberNode
): void {
  remainingOldFibers.forEach((fiberToDelete) => {
    fiberToDelete.flags = FiberFlags.Deletion;
    workInProgress.effects = workInProgress.effects || [];
    workInProgress.effects.push(fiberToDelete);
  });
}

/**
 * Helper Functions: React Element에서 정보 추출
 */

/**
 * React Element의 key prop 추출
 * @param child React Element 또는 텍스트
 * @returns key 값 또는 null
 */
function getElementKey(child: any): string | null {
  return typeof child === "string" ? null : child?.key || null;
}

/**
 * React Element의 type 추출
 * @param child React Element 또는 텍스트
 * @returns 컴포넌트 타입 또는 "TEXT_ELEMENT"
 */
function getElementType(child: any): string {
  return typeof child === "string" ? "TEXT_ELEMENT" : child?.type;
}

/**
 * React Element의 props 추출
 * @param child React Element 또는 텍스트
 * @returns props 객체
 */
function getElementProps(child: any): any {
  return typeof child === "string" ? { nodeValue: child } : child.props;
}
