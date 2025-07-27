# React Core 아키텍처 설계 분석

> **2년차 프론트엔드 개발자가 분석한 React 내부 구조 및 설계 원리**

## 🏛️ 전체 아키텍처 개요

React Core는 크게 4개의 레이어로 구성되어 있습니다:

```
┌─────────────────────────────────────────┐
│             Application Layer           │  ← 사용자 컴포넌트
├─────────────────────────────────────────┤
│              JSX Layer                  │  ← createElement, Virtual DOM
├─────────────────────────────────────────┤
│             Fiber Layer                 │  ← Reconciliation, Hooks
├─────────────────────────────────────────┤
│              DOM Layer                  │  ← 실제 DOM 조작
└─────────────────────────────────────────┘
```

## 📁 디렉토리 구조 설계

```
src/
├── jsx/                    # JSX 처리 레이어
│   ├── createElement.ts    # JSX → Virtual DOM 변환
│   ├── normalizeChildren.ts # children 정규화
│   └── type.jsx.ts        # JSX 타입 정의
├── fiber/                  # Fiber 아키텍처 핵심
│   ├── core/              # 렌더링 파이프라인
│   │   ├── beginWork.ts   # Render Phase 시작
│   │   ├── workLoop.ts    # 작업 스케줄링
│   │   ├── commitWork.ts  # Commit Phase 실행
│   │   └── reconcileChildren.ts # 자식 재조정
│   ├── hooks/             # Hook 시스템
│   │   ├── useState.ts    # 상태 관리 Hook
│   │   ├── useEffect.ts   # 부수 효과 Hook
│   │   └── context.ts     # Hook 컨텍스트 관리
│   ├── scheduler/         # 스케줄러
│   └── utils/             # 유틸리티 함수
└── ReactDOM.ts            # 최상위 렌더링 API
```

**설계 원칙:**
- **관심사의 분리**: 각 레이어가 명확한 책임을 가짐
- **의존성 방향**: 상위 레이어만 하위 레이어를 참조
- **확장성**: 새로운 기능 추가 시 기존 코드 수정 최소화

## 🔄 렌더링 파이프라인 설계

### 1. Trigger (트리거)
```typescript
// 상태 변경 → 업데이트 스케줄링
const dispatch = (action) => {
  enqueueUpdate(hook.queue, action);
  scheduleUpdateOnFiber(fiber);  // 트리거 발생
};
```

### 2. Render Phase (렌더 단계)
```typescript
// 동기적으로 처리되는 작업 (현재 구현)
function workLoop(fiber: FiberNode | null) {
  let workInProgress = fiber;
  
  while (workInProgress !== null) {
    // 각 Fiber 노드를 하나씩 처리
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

**주요 작업:**
- 컴포넌트 실행 및 새로운 Virtual DOM 생성
- 이전 Fiber 트리와 비교 (Reconciliation)
- 변경이 필요한 노드에 플래그 설정

### 3. Commit Phase (커밋 단계)
```typescript
// 동기, 중단 불가능한 작업
function commitWork(fiber: FiberNode) {
  // DOM 변경사항 일괄 적용
  if (hasFiberFlag(fiber.flags, FiberFlags.Placement)) {
    parentDOM.appendChild(fiber.stateNode);
  }
  
  // Effect 실행
  if (hasFiberFlag(fiber.flags, FiberFlags.PassiveEffect)) {
    queueMicrotask(() => flushPassiveEffect(fiber));
  }
}
```

**주요 작업:**
- DOM 변경사항 실제 적용
- Effect 실행 (useEffect, useLayoutEffect)
- 이벤트 핸들러 업데이트

## 🎣 Hook 시스템 설계

### Hook 저장 구조
```typescript
// Fiber 노드마다 Hook 체인 관리
FiberNode {
  memoizedState: Hook | null  // 첫 번째 Hook을 가리킴
}

Hook {
  memoizedState: any     // Hook의 실제 값
  queue: UpdateQueue     // 업데이트 큐
  next: Hook | null      // 다음 Hook 포인터
}
```

### Hook 실행 흐름
```
1. prepareToUseHooks() → Hook 컨텍스트 초기화
2. useState() → getNextHook() → Hook 체인에서 다음 Hook 반환
3. finishUsingHooks() → Hook 컨텍스트 정리
```

**설계상 제약 사항:**
- Hook 호출 순서가 렌더링마다 동일해야 함
- 조건부 Hook 호출 금지 (Hook 체인 구조 때문)
- 컴포넌트 최상위에서만 호출 가능

### useState 상태 업데이트 설계
```typescript
// 순환 연결 리스트로 구현된 업데이트 큐
UpdateQueue {
  pending: Update | null  // 가장 마지막에 추가된 업데이트
}

Update {
  action: any           // 새로운 값 또는 업데이터 함수
  next: Update | null   // 다음 업데이트
}
```

**업데이트 큐 처리:**
1. 여러 `setState` 호출이 순환 연결 리스트에 쌓임
2. 다음 렌더링 사이클에서 모든 업데이트를 순차 처리
3. 최종 상태만 계산하여 리렌더링

## 🔄 이중 버퍼링 (Double Buffering) 설계

```
Current Tree (화면에 표시 중)    Work-in-Progress Tree (작업 중)
      ┌─────┐                           ┌─────┐
      │  A  │ ←─── alternate ────→     │  A' │
      └─────┘                           └─────┘
         │                                 │
      ┌─────┐                           ┌─────┐
      │  B  │ ←─── alternate ────→     │  B' │
      └─────┘                           └─────┘
```

**동작 과정:**
1. **Render Phase**: Work-in-Progress 트리에서 모든 작업 수행
2. **Commit Phase**: 완성된 트리를 Current로 교체
3. **교체 완료**: 사용자는 중간 상태를 볼 수 없음

**장점:**
- 렌더링 중에도 UI가 끊기지 않음
- 에러 발생 시 이전 상태로 롤백 가능
- 안정적인 렌더링 기반 제공

## 🏃‍♂️ Reconciliation 알고리즘 설계

### 기본 원리
```typescript
function reconcileChildren(current, workInProgress, children) {
  if (current === null) {
    // Mount: 모든 자식을 새로 생성
    mountChildrenArray(workInProgress, children);
  } else {
    // Update: 기존과 새로운 자식들을 비교
    reconcileChildrenArray(current, workInProgress, children);
  }
}
```

### Key 기반 최적화
```typescript
// 효율적인 리스트 업데이트
const existingChildren = new Map();

// 1. 기존 자식들을 Map에 저장 (key → fiber)
let existingChild = current.child;
while (existingChild !== null) {
  const key = existingChild.key !== null ? existingChild.key : existingChild.index;
  existingChildren.set(key, existingChild);
  existingChild = existingChild.sibling;
}

// 2. 새로운 자식들과 매칭
for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  const key = newChild.key !== null ? newChild.key : i;
  
  if (existingChildren.has(key)) {
    // 재사용 가능
    const existingFiber = existingChildren.get(key);
    // ... 업데이트 로직
  } else {
    // 새로 생성
    const newFiber = createFiberNode(newChild);
    // ... 생성 로직
  }
}
```

**시간 복잡도:**
- Key 없는 경우: O(n²) → O(n)으로 개선
- Key 있는 경우: O(n) 최적화된 매칭

## 🎛️ Effect 시스템 설계

### Effect 타입별 실행 타이밍
```typescript
// useLayoutEffect: DOM 변경 직후 동기 실행
if (hasFiberFlag(fiber.flags, FiberFlags.LayoutEffect)) {
  flushLayoutEffect(fiber);  // 즉시 실행
}

// useEffect: DOM 변경 후 비동기 실행
if (hasFiberFlag(fiber.flags, FiberFlags.PassiveEffect)) {
  queueMicrotask(() => {    // 다음 틱에 실행
    flushPassiveEffect(fiber);
  });
}
```

### 의존성 배열 비교 알고리즘
```typescript
function isEffectDepsEqual(nextDeps: any[], prevDeps: any[]) {
  if (nextDeps.length !== prevDeps.length) return false;
  
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {  // 얕은 비교
      return false;
    }
  }
  
  return true;
}
```

**설계 결정 사항:**
- **얕은 비교 사용**: 성능상 이유로 깊은 비교 제외
- **Object.is 사용**: NaN, -0 등의 특수 케이스 처리
- **클린업 함수**: 이전 Effect의 destroy 함수 저장 및 실행

## 🏗️ Fiber 노드 설계

### Fiber 노드 구조
```typescript
interface FiberNode {
  // 식별자
  type: string | Function;      // 컴포넌트 타입
  key: string | number | null;  // 리스트에서의 고유 키
  
  // 트리 구조
  child: FiberNode | null;      // 첫 번째 자식
  sibling: FiberNode | null;    // 다음 형제
  return: FiberNode | null;     // 부모 (역방향 포인터)
  
  // 이중 버퍼링
  alternate: FiberNode | null;  // 다른 트리의 대응 노드
  
  // 상태 관리
  memoizedState: any;           // Hook 체인 또는 컴포넌트 상태
  memoizedProps: any;           // 이전 props
  pendingProps: any;            // 새로운 props
  
  // 작업 관리
  flags: number;                // 수행할 작업 플래그
  stateNode: any;               // 실제 DOM 노드
}
```

### 트리 순회 알고리즘
```typescript
// DFS(깊이 우선 탐색) 기반 순회
function performUnitOfWork(workInProgress: FiberNode): FiberNode | null {
  // 1. 현재 노드 작업 수행
  const next = beginWork(workInProgress);
  
  if (next !== null) {
    return next;  // 자식이 있으면 자식으로
  }
  
  // 2. 자식이 없으면 형제 또는 부모의 형제로
  let node: FiberNode | null = workInProgress;
  
  while (node !== null) {
    completeUnitOfWork(node);  // 완료 작업 수행
    
    if (node.sibling !== null) {
      return node.sibling;     // 형제로 이동
    }
    
    node = node.return;        // 부모로 올라감
  }
  
  return null;  // 순회 완료
}
```

## 🎯 성능 최적화 전략

### 1. 비트 플래그 활용
```typescript
// 효율적인 작업 상태 관리
const FiberFlags = {
  NoFlags: 0b0000,        // 0
  Placement: 0b0001,      // 1
  Update: 0b0010,         // 2
  Deletion: 0b0100,       // 4
  PassiveEffect: 0b1000,  // 8
  LayoutEffect: 0b10000,  // 16
};

// 플래그 체크: O(1)
const hasFlag = (flags: number, flag: number) => (flags & flag) !== 0;
```

### 2. 메모리 최적화
```typescript
// 이중 버퍼링을 통한 객체 재사용
function createWorkInProgress(current: FiberNode): FiberNode {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 새로 생성
    workInProgress = { ...current };
  } else {
    // 기존 객체 재사용
    workInProgress.flags = FiberFlags.NoFlags;
    workInProgress.child = null;
    workInProgress.sibling = null;
  }
  
  return workInProgress;
}
```

### 3. 순환 연결 리스트 업데이트 큐
```typescript
// 효율적인 업데이트 큐 관리
export function enqueueUpdate(queue: UpdateQueue, action: any) {
  const update: Update = { action, next: null };

  if (queue.pending === null) {
    update.next = update;  // 자기 자신을 가리키는 원형 구조
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }

  queue.pending = update;
}
```

## 🔍 현재 구현의 한계와 개선 방향

### 현재 구현된 기능
- ✅ 기본적인 Fiber 아키텍처
- ✅ 이중 버퍼링 시스템
- ✅ useState, useEffect, useLayoutEffect
- ✅ 순환 연결 리스트 업데이트 큐
- ✅ 기본적인 Reconciliation

### 미구현 기능 (향후 확장 계획)
- ⏳ **우선순위 스케줄링**: 중요한 업데이트 우선 처리
- ⏳ **배치 업데이트**: 여러 상태 변경 묶어서 처리
- ⏳ **시간 분할**: 렌더링 작업을 여러 프레임에 분산
- ⏳ **Suspense**: 비동기 컴포넌트 로딩 상태 관리
- ⏳ **Context API**: 전역 상태 관리 시스템

### 학습 목적의 단순화
현재 구현은 교육 목적으로 단순화되었지만, React의 핵심 개념들을 충분히 체험할 수 있도록 설계되었습니다:

1. **동기적 렌더링**: 실제 React의 비동기 렌더링 대신 단순한 동기 처리
2. **단순한 스케줄링**: 복잡한 우선순위 대신 즉시 실행
3. **기본적인 최적화**: 고급 최적화 기법보다는 핵심 구조에 집중

이러한 단순화를 통해 React의 기본 원리를 명확하게 이해할 수 있었습니다.

---

**작성자**: 2년차 프론트엔드 개발자  
**작성일**: 2024년 2월  
**참고**: React 18 공식 문서, React Fiber 아키텍처 논문