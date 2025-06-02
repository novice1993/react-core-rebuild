import { createTextFiber } from "./createTextFiber";
import { createFiberNode } from "./createFiberNode";
import { VirtualNode } from "@/jsx/type.jsx";
import { FiberNode } from "../type.fiber";

export function createFiberTree(
  virtualNode: VirtualNode,
  parent: FiberNode | null
): FiberNode {
  // Fiber Node 생성
  const fiber = createFiberNode(virtualNode);

  // 부모 Fiber의 참조 저장
  fiber.return = parent;

  const children = virtualNode.props?.children ?? [];

  // 이전 sibling Fiber 를 추적하는 포인터
  let preFiber: FiberNode | null = null;

  // Fiber의 children 을 담은 배열 순회
  children.forEach((childNode, index) => {
    let childFiber: FiberNode;

    // Text 노드일 경우 별도 처리
    if (typeof childNode === "string") {
      childFiber = createTextFiber(childNode, fiber);
    }

    // ReactElement일 경우 재귀를 통하여 하부 트리 구성
    else {
      childFiber = createFiberTree(childNode, fiber);
    }

    // 첫번째 자식 요소일 경우 child 요소의 value로 지정
    if (index === 0) {
      fiber.child = childFiber;

      // 이외의 경우 sibling 요소의 value로 지정
    } else if (preFiber) {
      preFiber.sibling = childFiber;
    }

    // 현재 생성된 Fiber를 preFiber로 지정
    preFiber = childFiber;
  });

  return fiber;
}
