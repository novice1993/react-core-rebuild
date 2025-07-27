# React Core Rebuild - 학습용 React 구현 프로젝트

> **2년차 프론트엔드 개발자의 React 내부 구조 이해를 위한 학습 프로젝트**

## 📌 프로젝트 개요

React를 사용하면서 항상 궁금했던 것들이 있었습니다. "useState는 어떻게 상태를 기억할까?", "Virtual DOM은 정확히 어떻게 동작할까?", "컴포넌트가 리렌더링되는 과정은 어떻게 될까?" 등등...

이런 궁금증을 해결하기 위해 React의 핵심 기능들을 직접 구현해보는 프로젝트를 시작했습니다. 물론 실제 React처럼 완벽하지는 않지만, 주요 개념들을 이해하고 실제로 동작하는 수준까지 구현해보았습니다.

## 🎯 학습 목표

- **React Fiber 아키텍처** 이해하기
- **Hook 시스템** 동작 원리 파악하기  
- **Virtual DOM** 과 **Reconciliation** 과정 체험하기
- **이중 버퍼링** 최적화 기법 학습하기
- JavaScript/TypeScript 깊이 있는 활용법 익히기

## 🚀 주요 구현 기능

### 1. JSX & createElement
```typescript
// JSX 문법을 Virtual DOM 객체로 변환
const element = createElement("h1", { className: "title" }, "Hello World");
// 결과: { type: "h1", props: { className: "title", children: ["Hello World"] } }
```

**학습 포인트:**
- JSX가 실제로는 함수 호출로 변환된다는 것을 체험
- props와 children 정규화 과정 구현

### 2. Fiber 아키텍처 구현
```typescript
interface FiberNode {
  type: string | Function;
  stateNode: HTMLElement | Text | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  return: FiberNode | null;
  alternate: FiberNode | null;  // 이중 버퍼링용
}
```

**학습 포인트:**
- React 16+의 핵심인 Fiber 구조 이해
- 연결 리스트 형태의 트리 구조 활용
- work-in-progress와 current 트리의 이중 버퍼링

### 3. Hook 시스템

#### useState 구현
```typescript
function useState<T>(initialState: T) {
  const hook = getNextHook();
  
  if (hook.memoizedState === null) {
    hook.memoizedState = initialState;
  } else {
    hook.memoizedState = processUpdateQueue(hook.queue, hook.memoizedState);
  }

  const dispatch = (action) => {
    enqueueUpdate(hook.queue, action);
    scheduleUpdateOnFiber(fiber);
  };

  return [hook.memoizedState, dispatch];
}
```

**학습 포인트:**
- Hook이 Fiber 노드에 연결된 링크드 리스트로 관리된다는 것
- 상태 업데이트 큐 시스템의 동작 방식
- 클로저를 활용한 상태 관리

#### useEffect 구현
```typescript
function useEffect(create, deps) {
  const hook = getNextHook();
  const prevEffect = hook.memoizedEffect;
  
  // 의존성 배열 얕은 비교
  const isDepsChanged = !isEffectDepsEqual(deps, prevEffect?.deps);
  
  if (isDepsChanged) {
    fiber.flags |= FiberFlags.PassiveEffect;
  }
}
```

**학습 포인트:**
- Effect 실행 타이밍 제어 (동기 vs 비동기)
- 의존성 배열 비교 알고리즘
- 클린업 함수 관리 방식

### 4. 렌더링 파이프라인

#### Render Phase (비동기, 중단 가능)
```typescript
function workLoop(fiber: FiberNode | null) {
  let workInProgress = fiber;
  
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

#### Commit Phase (동기, 중단 불가)
```typescript
function commitWork(fiber: FiberNode) {
  if (hasFiberFlag(fiber.flags, FiberFlags.Placement)) {
    parentDOM.appendChild(fiber.stateNode);
  }
  if (hasFiberFlag(fiber.flags, FiberFlags.Update)) {
    patchProps(fiber.stateNode, oldProps, newProps);
  }
}
```

**학습 포인트:**
- 렌더링을 작은 단위로 나누어 처리하는 방식
- DOM 변경사항을 한 번에 적용하는 최적화
- 비트 플래그를 활용한 효율적인 상태 관리

## 🔧 기술적 도전과 해결 과정

### 1. Hook 순서 문제 해결
**문제:** Hook은 항상 같은 순서로 호출되어야 하는데, 이를 어떻게 보장할까?

**해결:** 
- Fiber 노드마다 Hook 링크드 리스트 관리
- 렌더링 시작 시 Hook 인덱스 초기화
- 조건부 Hook 호출 시 에러 메시지 제공

### 2. 이중 버퍼링 구현
**문제:** 렌더링 중에도 사용자 인터랙션이 끊기지 않으려면?

**해결:**
- current 트리와 work-in-progress 트리 분리
- 모든 작업을 work-in-progress에서 수행
- 완료 후 한 번에 current로 교체

### 3. Effect 실행 타이밍
**문제:** useEffect와 useLayoutEffect의 실행 타이밍을 어떻게 구분할까?

**해결:**
- 비트 플래그로 Effect 타입 구분
- useLayoutEffect: 동기적으로 즉시 실행
- useEffect: queueMicrotask로 비동기 실행

## 📊 성능 최적화 기법

### 1. 재조정(Reconciliation) 최적화
```typescript
// key를 활용한 효율적인 리스트 업데이트
function reconcileChildrenArray(current, workInProgress, children) {
  const existingChildren = mapRemainingChildren(current);
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const key = child.key || i;
    
    if (existingChildren.has(key)) {
      // 기존 Fiber 재사용
      const existing = existingChildren.get(key);
      // ... 재사용 로직
    } else {
      // 새 Fiber 생성
      const newFiber = createFiberNode(child);
      // ... 생성 로직
    }
  }
}
```

### 2. 메모리 사용량 최적화
- Object Pool 패턴으로 Fiber 노드 재사용
- 불필요한 객체 생성 최소화
- 약한 참조(WeakMap) 활용으로 메모리 누수 방지

## 🧪 실제 동작 테스트

프로젝트에는 구현한 기능들이 실제로 동작하는지 확인할 수 있는 테스트 환경이 포함되어 있습니다:

```typescript
function ComplexCounter() {
  const [count, setCount] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log(`✨ useEffect: count가 ${count}으로 변경됨`);
  }, [count]);

  useLayoutEffect(() => {
    console.log(`🎨 useLayoutEffect: textInput 변경됨`);
  }, [textInput]);

  return createElement(
    "div",
    {},
    createElement("p", {}, `카운트: ${count}`),
    createElement("button", { onclick: () => setCount(count + 1) }, "+1"),
    // ... 더 많은 UI 요소들
  );
}
```

## 📚 배운 점들

### 1. React의 설계 철학 이해
- **선언적 UI**: 상태에 따른 UI 결과만 기술하면 된다
- **단방향 데이터 플로우**: 예측 가능한 상태 관리
- **컴포넌트 합성**: 작은 컴포넌트들의 조합으로 복잡한 UI 구성

### 2. 성능 최적화의 중요성
- **배치 업데이트**: 여러 상태 변경을 한 번에 처리
- **가상화**: 메모리 사용량과 렌더링 성능의 균형
- **예측 가능한 최적화**: 개발자가 이해할 수 있는 명확한 규칙

### 3. JavaScript/TypeScript 활용 능력 향상
- **클로저 활용**: Hook 상태 관리
- **연결 리스트**: Fiber 트리 구조
- **비트 연산**: 플래그 관리
- **타입 시스템**: 안전한 코드 작성

## 🔮 향후 개선 계획

1. **Suspense 구현**: 비동기 컴포넌트 로딩 처리
2. **Context API**: 전역 상태 관리 시스템
3. **개발자 도구**: React DevTools 같은 디버깅 환경
4. **SSR 지원**: 서버 사이드 렌더링 기능
5. **성능 프로파일링**: 렌더링 성능 측정 도구

## 🛠️ 기술 스택

- **언어**: TypeScript
- **빌드 도구**: Vite
- **테스트**: Vitest
- **린팅**: ESLint
- **타입 체킹**: TypeScript Compiler

## 📋 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 테스트 실행
npm run test

# 빌드
npm run build
```

## 💭 프로젝트 후기

이 프로젝트를 통해 React가 단순히 "상태가 바뀌면 화면이 바뀌는" 라이브러리가 아니라, 수많은 최적화와 설계 고민이 담긴 정교한 시스템이라는 것을 깨달았습니다. 

특히 Hook 시스템을 직접 구현해보면서, 왜 Hook을 조건부로 사용하면 안 되는지, 왜 컴포넌트 최상단에서만 사용해야 하는지 등의 규칙들이 단순한 제약이 아니라 내부 구현의 필연적인 결과라는 것을 이해하게 되었습니다.

앞으로도 이런 "밑바닥부터 구현해보기" 방식으로 다른 라이브러리나 프레임워크들의 내부 구조를 학습해보고 싶습니다.

---

**개발 기간**: 2024년 1월 ~ 2월 (약 2개월)  
**개발자**: 2년차 프론트엔드 개발자  
**GitHub**: [프로젝트 링크]