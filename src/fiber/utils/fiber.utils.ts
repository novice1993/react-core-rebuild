import { FiberNode, FiberRoot } from "../type.fiber";

/** return 포인터 체이닝을 추적하면서 Host 컴포넌트를 탐색하여 반환하는 함수 */
export function getHostParent(fiber: FiberNode): HTMLElement | Text | null {
  let parent = fiber.return;

  // 1. 부모 Fiber가 존재하는 경우
  while (parent) {
    // 1-1. HostRoot 처리
    if (parent.type === "HostRoot" && parent.stateNode) {
      // HostRoot의 stateNode는 FiberRoot 객체이며, 그 containerInfo가 실제 DOM 부모입니다.
      const fiberRootInstance = parent.stateNode as FiberRoot;
      return fiberRootInstance.containerInfo;
    }

    // 1-2. HTML Element를 기반으로 한 HostComponent일 경우 포인터 반환
    if (typeof parent.type === "string" && parent.stateNode) {
      // parent.type이 string이므로, stateNode는 HTMLElement 또는 Text여야 합니다.
      return parent.stateNode as HTMLElement | Text; // 명시적 타입 단언
    }

    // 1-3. 아닐 경우 트리 상부로 올라가며 부모 Fiber를 계속 탐색
    parent = parent.return;
  }

  // 2. 부모 Fiber가 존재하지 않는 경우 body 태그 반환 (body를 root 요소로 설정)
  return document.body;
}

/** fiber에 flags를 세팅하는 함수 */
export function setFiberFlag(currentFlags: number, targetFlag: number): number {
  return currentFlags | targetFlag;
}

/** fiber flags 유형을 판별하는 함수 */
export function hasFiberFlag(
  currentFlags: number,
  targetFlag: number
): boolean {
  return (currentFlags & targetFlag) !== 0;
}
