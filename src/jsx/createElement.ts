import { Child, VirtualNode } from "./type.jsx";
import { normalizeChildren } from "./normalizeChildren";

export function createElement(
  type: string,
  props: Record<string, any> | null,
  ...children: Child[]
): VirtualNode {
  const { key = null, ...restProps } = props || {};

  return {
    type,
    key,
    props: {
      ...restProps,
      children: normalizeChildren(children),
    },
  };
}
