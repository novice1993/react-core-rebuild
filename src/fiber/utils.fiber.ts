import { FiberNode } from "./type.fiber";

/** return 포인터를 체이닝을 추적하면서 Host 컴포넌트를 탐색하여 반환하는 함수 */
export function getHostParent(fiber: FiberNode): HTMLElement | null {
  let parent = fiber.return;

  // 1. 부모 Fiber가 존재하는 경우
  while (parent) {
    // 1-1. HTML Element를 기반으로 한 HostComponent일 경우 포인터 반환
    if (typeof parent.type === "string" && parent.stateNode) {
      return parent.stateNode;
    }

    // 1-2. 아닐 경우 트리 상부로 올라가며 부모 Fiber를 계속 탐색
    parent = parent.return;
  }

  // 2. 부모 Fiber가 존재하지 않는 경우 body 태그 반환 (body를 root 요소로 설정)
  return document.body;
}

/** current - workInProgress fiber를 비교하여 props를 추가, 갱신, 제거하는 함수 */
export function patchProps(
  dom: HTMLElement,
  prevProps: any = {},
  nextProps: any = {}
): void {
  // currnet - wip 비교하여 삭제된 props 제거
  for (const key in prevProps) {
    if (!(key in nextProps)) {
      dom.removeAttribute(key);
    }
  }

  // current - wip 비교하여 새로 추가되거나, 변경된 props 갱신
  for (const key in nextProps) {
    if (prevProps[key] !== nextProps[key]) {
      dom.setAttribute(key, nextProps[key]);
    }
  }
}
