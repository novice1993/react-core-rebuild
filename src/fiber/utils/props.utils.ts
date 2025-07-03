import { SUPPORTED_EVENTS } from "../constants";

// 이벤트 핸들러 판별 함수
function isEventHandler(key: string, value: any): boolean {
  return SUPPORTED_EVENTS.has(key.toLowerCase()) && typeof value === "function";
}

// 이벤트 타입 추출 함수 (Ex. onClick → click)
function getEventType(handlerName: string): string {
  return handlerName.toLowerCase().substring(2);
}

/** current - workInProgress fiber를 비교하여 props를 추가, 갱신, 제거하는 함수 */
export function patchProps(
  dom: HTMLElement,
  prevProps: any = {},
  nextProps: any = {}
): void {
  if (!dom || !dom.setAttribute) return;

  // 1. currnet - wip 비교하여 삭제된 props 제거
  for (const key in prevProps) {
    if (!(key in nextProps)) {
      if (isEventHandler(key, prevProps[key])) {
        // 이전 이벤트 리스너 제거
        const eventType = getEventType(key);
        dom.removeEventListener(eventType, prevProps[key]);
        console.log(`[patchProps] 이벤트 제거: ${eventType}`);
      } else {
        // 일반 HTML attribute 제거
        dom.removeAttribute(key);
        console.log(`[patchProps] attribute 제거: ${key}`);
      }
    }
  }

  // 2. current - wip 비교하여 새로 추가되거나, 변경된 props 갱신
  for (const key in nextProps) {
    if (key === "children") continue; // children은 별도 처리

    if (isEventHandler(key, nextProps[key])) {
      // 이벤트 핸들러 처리
      const eventType = getEventType(key);

      // 이전 핸들러와 다르면 교체
      if (prevProps[key] !== nextProps[key]) {
        // 기존 리스너가 있으면 제거
        if (prevProps[key] && typeof prevProps[key] === "function") {
          dom.removeEventListener(eventType, prevProps[key]);
        }

        // 새 리스너 등록
        dom.addEventListener(eventType, nextProps[key]);
        console.log(`[patchProps] 이벤트 등록: ${eventType}`);
      }
    } else {
      // 일반 HTML attribute 처리
      if (prevProps[key] !== nextProps[key]) {
        dom.setAttribute(key, nextProps[key]);
        console.log(`[patchProps] attribute 설정: ${key}=${nextProps[key]}`);
      }
    }
  }
}
