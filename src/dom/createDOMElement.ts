import { VirtualNode } from "@/jsx/type.jsx";

export function createDOMElement(
  virtualNode: VirtualNode | string
): HTMLElement | Text {
  // 텍스트 노드 처리
  if (typeof virtualNode === "string") {
    return document.createTextNode(virtualNode);
  }

  const { type, props } = virtualNode;

  // HTML 엘리먼트 생성
  const element = document.createElement(type);

  // HTML 엘리멘트 attribute 추가
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    element.setAttribute(key, value);
  }

  // 자식 컴포넌트 배열 생성
  const children = props.children ?? [];
  const childArray = Array.isArray(children) ? children : [children];

  // 자식 컴포넌트 반복문 돌면서 -> 재귀 함수 호출 + 부모 컴포넌트의 자식으로 추가
  for (const child of childArray) {
    const childElement = createDOMElement(child);
    element.appendChild(childElement);
  }

  return element;
}
