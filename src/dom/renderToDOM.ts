import { createDOMElement } from "./createDOMElement";
import { VirtualNode } from "@/jsx/type.jsx";

export function renderToDOM(
  virtunalNode: VirtualNode | string,
  container: HTMLElement
): void {
  const dom = createDOMElement(virtunalNode);
  container.appendChild(dom);
}
