import { VirtualNode } from "./jsx/type.jsx";
import { createFiberRoot } from "./fiber/core/createFiberRoot.js";
import { updateContainer } from "./fiber/core/updateContainer.js";

export function render(element: VirtualNode, container: HTMLElement): void {
  // 1. 기존 FiberRoot 탐색
  let fiberRoot = (container as any)._renderRootContainer;

  // 2. 존재하지 않을 경우 생성
  if (!fiberRoot) {
    fiberRoot = createFiberRoot(container);
    (container as any)._renderRootContainer = fiberRoot;
  }

  updateContainer(element, fiberRoot);
}
