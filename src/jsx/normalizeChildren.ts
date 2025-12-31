import { Child, NormalizedChild, VirtualNode } from "./type.jsx";

// 렌더링 가능한 요소인지 판별하는 함수
function isRenderable(child: Child) {
  return child !== null && child !== undefined && typeof child !== "boolean";
}

// 객체일 경우 ReactElement인지 판별하는 함수
function isVirtualNode(obj: any): obj is VirtualNode {
  return (
    obj !== null &&
    typeof obj === "object" &&
    (typeof obj.type === "string" || typeof obj.type === "function") &&
    typeof obj.props === "object"
  );
}

// Object (ReactElement) 일 경우 그대로 반환, Number 타입일 경우 String 타입으로 변환하여 반환하는 함수
function toNormalizeChild(child: Child): NormalizedChild {
  if (isVirtualNode(child)) return child;

  if (typeof child === "object") {
    // VirtualNode가 아닌 일반 객체일 경우 Error throw
    throw new Error(`Invalid object passed as child: ${JSON.stringify(child)}`);
  }

  return String(child);
}

// 컴포넌트에 children props로 전달된 요소를 처리 가능한 요소로 변환하는 함수
export function normalizeChildren(children: Child[]): NormalizedChild[] {
  return children.flat(Infinity).filter(isRenderable).map(toNormalizeChild);
}
