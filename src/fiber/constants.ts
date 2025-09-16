/**
 * Fiber 노드의 작업 상태를 나타내는 비트 플래그
 * 렌더링 과정에서 어떤 작업이 필요한지 표시
 */
export const FiberFlags = {
  NoFlags: 0b0000, // 작업 없음
  Placement: 0b0001, // DOM에 새로 추가
  Update: 0b0010, // props 업데이트
  Deletion: 0b0100, // DOM에서 제거
  PassiveEffect: 0b1000, // useEffect 실행
  LayoutEffect: 0b10000, // useLayoutEffect 실행
} as const;

/**
 * React에서 지원하는 이벤트 핸들러 목록
 * props 처리 시 이벤트와 일반 속성을 구분하기 위해 사용
 */
export const SUPPORTED_EVENTS = new Set([
  // 마우스 이벤트
  "onclick",
  "ondblclick",
  "onmousedown",
  "onmouseup",
  "onmouseover",
  "onmouseout",
  "onmousemove",

  // 키보드 이벤트
  "onkeydown",
  "onkeyup",
  "onkeypress",

  // 폼 이벤트
  "onchange",
  "oninput",
  "onsubmit",
  "onfocus",
  "onblur",

  // 기타 중요 이벤트
  "onload",
  "onerror",
  "onscroll",
]);
