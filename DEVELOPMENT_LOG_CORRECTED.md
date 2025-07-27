# React Core 개발 일지

> **2년차 프론트엔드 개발자의 React 구현 여정 기록**

## 📅 개발 일정 및 마일스톤

### Week 1-2: 기초 설계 및 JSX 구현
- [x] 프로젝트 구조 설계
- [x] createElement 함수 구현
- [x] Virtual DOM 타입 정의
- [x] children 정규화 로직

### Week 3-4: Fiber 아키텍처 기반 구축
- [x] FiberNode 타입 설계
- [x] FiberRoot 생성 로직
- [x] 기본 렌더링 파이프라인

### Week 5-6: Hook 시스템 구현
- [x] useState Hook 구현
- [x] Hook 체인 관리 시스템
- [x] 상태 업데이트 큐 처리

### Week 7-8: Effect 시스템 & 최적화
- [x] useEffect, useLayoutEffect 구현
- [x] 이중 버퍼링 시스템
- [x] Reconciliation 알고리즘
- [x] 성능 최적화 및 테스트

## 🛠️ 주요 개발 과정

### 1. JSX → Virtual DOM 변환 구현

**초기 접근법:**
```typescript
// 첫 번째 시도 - 너무 단순함
function createElement(type, props, ...children) {
  return { type, props, children };
}
```

**문제점:**
- children이 배열 안에 또 배열이 있는 중첩 구조
- null, undefined, boolean 값들이 렌더링에 영향
- key props 분리 안됨

**개선된 구현:**
```typescript
function createElement(type, props, ...children) {
  const { key = null, ...restProps } = props || {};
  
  return {
    type,
    key,
    props: {
      ...restProps,
      children: normalizeChildren(children), // 정규화 추가
    },
  };
}

function normalizeChildren(children) {
  return children
    .flat()
    .filter(child => child != null && typeof child !== 'boolean')
    .map(child => 
      typeof child === 'object' ? child : String(child)
    );
}
```

**학습 포인트:**
- JSX 변환 과정에서의 edge case 처리 중요성
- 타입 안전성을 위한 정규화 과정 필요성

### 2. Fiber 아키텍처 구현

**가장 큰 도전: 트리 순회 알고리즘**

처음에는 일반적인 DFS 재귀로 접근했지만, React는 스택 오버플로우를 방지하기 위해 반복문을 사용한다는 것을 깨달았습니다.

```typescript
// 첫 번째 시도 - 재귀 (문제점: 스택 오버플로우 위험)
function renderFiber(fiber) {
  const children = runComponent(fiber);
  
  children.forEach(child => {
    renderFiber(child); // 깊은 트리에서 스택 오버플로우
  });
}

// 개선된 접근법 - 반복문
function workLoop(workInProgress) {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  const next = beginWork(fiber); // 자식 처리
  
  if (next) return next; // 자식이 있으면 자식으로
  
  // 자식이 없으면 형제나 부모의 형제로
  let node = fiber;
  while (node) {
    completeUnitOfWork(node);
    if (node.sibling) return node.sibling;
    node = node.return;
  }
  
  return null;
}
```

**핵심 깨달음:**
- React의 Fiber 구조는 연결 리스트 형태의 트리
- 중단 가능한 렌더링을 위해서는 반복문 기반 순회가 필수
- `child`, `sibling`, `return` 포인터로 트리 전체 순회 가능

### 3. Hook 시스템 구현의 어려움

**첫 번째 도전: Hook 상태 저장 위치**

```typescript
// 잘못된 접근 - 전역 변수 사용
let currentHookIndex = 0;
let currentHooks = [];

function useState(initialState) {
  const index = currentHookIndex++;
  
  if (currentHooks[index] === undefined) {
    currentHooks[index] = initialState;
  }
  
  return [currentHooks[index], (newValue) => {
    currentHooks[index] = newValue;
    // 리렌더링 로직
  }];
}
```

**문제점:**
- 컴포넌트별로 Hook이 분리되지 않음
- 동시 렌더링 시 상태 꼬임
- Hook 순서 변경 시 상태 유실

**올바른 접근법:**
```typescript
// Fiber 노드마다 Hook 체인 관리
interface Hook {
  memoizedState: any;
  queue: UpdateQueue;
  next: Hook | null;
}

// 컴포넌트별 Hook 컨텍스트
const hookContext = {
  currentlyRenderingFiber: null,
  currentHook: null,
  workInProgressHook: null,
};

function useState(initialState) {
  const hook = getNextHook(); // 현재 Fiber의 Hook 체인에서 가져오기
  
  if (hook.memoizedState === null) {
    hook.memoizedState = initialState;
  } else {
    hook.memoizedState = processUpdateQueue(hook.queue, hook.memoizedState);
  }
  
  const dispatch = (action) => {
    enqueueUpdate(hook.queue, action);
    scheduleUpdateOnFiber(hookContext.currentlyRenderingFiber);
  };
  
  return [hook.memoizedState, dispatch];
}
```

**학습 포인트:**
- Hook은 컴포넌트(Fiber) 인스턴스에 속해야 함
- 링크드 리스트로 Hook 순서 관리
- 클로저를 활용한 안전한 상태 관리

### 4. 이중 버퍼링 구현

**개념 이해의 어려움:**

처음에는 "왜 두 개의 트리가 필요한가?"를 이해하지 못했습니다.

```typescript
// 잘못된 이해 - 단일 트리에서 직접 수정
function updateComponent(fiber) {
  fiber.props = newProps; // 직접 수정 시 렌더링 중 깜빡임
  fiber.stateNode.textContent = newText;
}
```

**올바른 구현:**
```typescript
function createWorkInProgress(current) {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 새로운 work-in-progress 트리 생성
    workInProgress = {
      ...current,
      alternate: current,
    };
    current.alternate = workInProgress;
  }
  
  // 작업용 트리 초기화
  workInProgress.flags = NoFlags;
  workInProgress.child = null;
  workInProgress.sibling = null;
  
  return workInProgress;
}

// 모든 작업이 완료된 후 한 번에 교체
function commitRoot(finishedWork) {
  root.current = finishedWork; // 원자적 교체
}
```

**핵심 깨달음:**
- 렌더링 중에는 기존 트리 유지 (사용자 경험)
- 새로운 트리에서 모든 작업 수행
- 완료 후 한 번에 교체 (깜빡임 방지)

## 🐛 주요 트러블슈팅

### 문제 1: useEffect 무한 루프

**발생한 문제:**
```typescript
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1); // 무한 루프!
  }, [count]);
}
```

**원인 분석:**
- useEffect가 count 변경 시마다 실행
- Effect 내부에서 count를 다시 변경
- 무한 렌더링 사이클 발생

**해결 과정:**
1. 의존성 배열 비교 로직 검증
2. Effect 실행 타이밍 조사
3. 클린업 함수 미실행 문제 발견

```typescript
// 수정된 useEffect 구현
function useEffect(create, deps) {
  const hook = getNextHook();
  const prevEffect = hook.memoizedEffect;
  
  let isDepsChanged = true;
  
  if (prevEffect && deps && prevEffect.deps) {
    isDepsChanged = !isEffectDepsEqual(deps, prevEffect.deps);
  }
  
  if (isDepsChanged) {
    // 이전 Effect 클린업 실행
    if (prevEffect && prevEffect.destroy) {
      prevEffect.destroy();
    }
    
    const effect = {
      create,
      destroy: null,
      deps,
      tag: 'Passive'
    };
    
    hook.memoizedEffect = effect;
    fiber.flags |= PassiveEffect;
  }
}
```

### 문제 2: 조건부 렌더링 시 Hook 순서 변경

**발생한 문제:**
```typescript
function Component({ showExtra }) {
  const [name, setName] = useState("John");
  
  if (showExtra) {
    const [age, setAge] = useState(25); // 조건부 Hook!
  }
  
  const [email, setEmail] = useState("john@email.com");
}
```

**에러 메시지:**
```
"Hook 호출 순서가 이전 렌더링과 다릅니다."
```

**원인 분석:**
- Hook이 링크드 리스트로 저장됨
- 조건부 Hook으로 인해 순서 변경
- 이전 Hook과 매칭 실패

**해결책:**
```typescript
function getNextHook() {
  if (isFirstRender) {
    // 새로운 Hook 생성
    const hook = {
      memoizedState: null,
      queue: null,
      next: null
    };
    
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    
    workInProgressHook = hook;
  } else {
    // 기존 Hook 재사용
    if (currentHook === null) {
      currentHook = currentlyRenderingFiber.alternate.memoizedState;
    } else {
      currentHook = currentHook.next;
    }
    
    if (currentHook === null) {
      throw new Error('Hook 호출 순서가 이전 렌더링과 다릅니다.');
    }
    
    workInProgressHook = { ...currentHook };
  }
  
  return workInProgressHook;
}
```

### 문제 3: 메모리 누수 발생

**발생한 문제:**
- 컴포넌트 언마운트 후에도 메모리 사용량 증가
- Effect 클린업 함수 미실행
- 이벤트 리스너 해제 안됨

**해결 과정:**

1. **Effect 클린업 시스템 구현:**
```typescript
function unmountEffects(fiber) {
  let hook = fiber.memoizedState;
  
  while (hook !== null) {
    if (hook.memoizedEffect && hook.memoizedEffect.destroy) {
      hook.memoizedEffect.destroy(); // 클린업 실행
    }
    hook = hook.next;
  }
}
```

2. **Fiber 노드 정리:**
```typescript
function commitDeletion(fiber) {
  // Effect 클린업
  unmountEffects(fiber);
  
  // DOM 제거
  if (fiber.stateNode && fiber.stateNode.parentNode) {
    fiber.stateNode.parentNode.removeChild(fiber.stateNode);
  }
  
  // 자식 노드들도 재귀적으로 정리
  let child = fiber.child;
  while (child !== null) {
    commitDeletion(child);
    child = child.sibling;
  }
}
```

## 📈 성능 최적화 과정

### 1. 렌더링 성능 측정

**성능 측정 도구 구현:**
```typescript
function measureRenderTime(fiber) {
  const start = performance.now();
  
  const result = beginWork(fiber);
  
  const end = performance.now();
  console.log(`[${fiber.type}] 렌더링 시간: ${end - start}ms`);
  
  return result;
}
```

**발견한 병목점:**
- 불필요한 객체 생성
- 반복적인 DOM 쿼리
- 중복 계산

### 2. 최적화 적용

**이중 버퍼링을 통한 객체 재사용:**
```typescript
// 기존 Fiber 노드 재사용
function createWorkInProgress(current) {
  let workInProgress = current.alternate;
  
  if (!workInProgress) {
    workInProgress = { ...current };  // 새로 생성
  } else {
    // 기존 객체 재사용하여 GC 압박 감소
    workInProgress.flags = NoFlags;
    workInProgress.child = null;
    workInProgress.sibling = null;
  }
  
  return workInProgress;
}
```

**비트 플래그 최적화:**
```typescript
// 이전: 여러 불린 값으로 상태 관리
fiber.needsUpdate = true;
fiber.needsPlacement = true;
fiber.needsDeletion = false;

// 개선: 비트 플래그로 통합
fiber.flags = Placement | Update; // 0b0011

// 체크도 빠름
const needsWork = (flags & (Placement | Update)) !== 0;
```

**순환 연결 리스트 업데이트 큐:**
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

## 🎓 학습한 핵심 개념들

### 1. 자료구조 활용

**연결 리스트의 활용:**
- Fiber 트리: child → sibling → return 포인터
- Hook 체인: next 포인터로 연결
- 업데이트 큐: 순환 연결 리스트

**트리 순회 패턴:**
- DFS(깊이 우선) vs BFS(너비 우선)
- 재귀 vs 반복문 (스택 오버플로우 방지)
- 중단 가능한 순회 구현

### 2. 함수형 프로그래밍 개념

**클로저 활용:**
```typescript
function createDispatch(fiber, queue) {
  return function dispatch(action) {
    // fiber와 queue에 접근 가능 (클로저)
    enqueueUpdate(queue, action);
    scheduleUpdateOnFiber(fiber);
  };
}
```

**불변성 유지:**
```typescript
// 상태 업데이트 시 항상 새로운 객체 반환
function updateState(currentState, action) {
  if (typeof action === 'function') {
    return action(currentState);
  }
  return action;
}
```

### 3. 동시성 프로그래밍

**마이크로태스크 활용:**
```typescript
// useEffect는 비동기 실행
queueMicrotask(() => {
  flushPassiveEffect(fiber);
});

// useLayoutEffect는 동기 실행
flushLayoutEffect(fiber);
```

**현재 구현의 단순화:**
현재 구현에서는 복잡한 배치 업데이트나 우선순위 스케줄링 대신, 단순한 즉시 실행 방식을 사용했습니다:

```typescript
// 단순화된 스케줄링 (현재 구현)
function scheduleUpdateOnFiber(fiber) {
  const fiberRoot = getRootFiber(fiber);
  const workInProgress = createWorkInProgress(fiberRoot.current);
  const finishedWork = workLoop(workInProgress);  // 즉시 실행
  
  if (finishedWork) {
    commitUnitOfWork(finishedWork);
  }
}
```

## 🤔 아쉬운 점과 개선 방향

### 1. 구현하지 못한 기능들

- **배치 업데이트**: 여러 상태 변경을 묶어서 처리
- **우선순위 스케줄링**: 중요한 업데이트 우선 처리
- **시간 분할**: 렌더링 작업을 여러 프레임에 나누어 처리
- **Suspense**: 비동기 컴포넌트 로딩 상태 관리
- **Context API**: 전역 상태 관리
- **Portal**: 다른 DOM 트리에 렌더링
- **Error Boundary**: 에러 처리 컴포넌트

### 2. 현재 구현의 한계

- **동기적 렌더링**: 실제 React의 비동기 렌더링 대신 동기 처리
- **단순한 스케줄링**: 복잡한 우선순위 대신 즉시 실행
- **기본적인 최적화**: 고급 최적화 기법 부족

### 3. 코드 품질 개선

- **타입 안전성**: 더 엄격한 TypeScript 타입 적용
- **에러 처리**: 더 세밀한 에러 상황 대응
- **테스트 커버리지**: 엣지 케이스 테스트 확대

## 💡 핵심 깨달음

### 1. 라이브러리 설계의 복잡성

React 같은 라이브러리가 단순해 보이지만, 내부적으로는 수많은 최적화와 엣지 케이스 처리가 필요하다는 것을 깨달았습니다.

### 2. 성능과 개발자 경험의 균형

편리한 API 뒤에는 복잡한 내부 구현이 숨어있으며, 성능과 사용성 사이의 트레이드오프가 항상 존재한다는 것을 배웠습니다.

### 3. 점진적 학습의 중요성

처음부터 완벽한 구현을 시도하기보다는, 작은 기능부터 점진적으로 구현해나가는 것이 더 효과적임을 경험했습니다.

### 4. 실제 구현과 이론의 차이

문서로만 이해했던 개념들을 직접 구현해보면서, 실제로는 더 많은 고려사항과 복잡성이 존재한다는 것을 체험했습니다.

## 🚀 향후 계획

1. **배치 업데이트 시스템**: 여러 상태 변경을 효율적으로 묶어서 처리하는 시스템 구현
2. **우선순위 스케줄링**: 중요한 업데이트를 우선 처리하는 스케줄러 구현
3. **Suspense 구현**: 비동기 데이터 로딩 패턴 학습 및 구현
4. **성능 프로파일링 도구**: 개발자 도구 구현
5. **다른 프레임워크 학습**: Vue.js, Svelte 내부 구조 분석
6. **오픈소스 기여**: 실제 React 프로젝트에 기여

---

**총 개발 시간**: 약 120시간 (주말 및 평일 저녁 활용)  
**주요 참고 자료**: React 공식 문서, React Fiber 아키텍처 논문, JavaScript 고급 서적  
**개발 환경**: TypeScript, Vite, Vitest, ESLint