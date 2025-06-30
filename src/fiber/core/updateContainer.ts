import { VirtualNode } from "@/jsx/type.jsx";
import { FiberNode, FiberRoot } from "../type.fiber";
import { scheduleUpdateOnFiber } from "../scheduler/scheduleUpdateOnFiber";

export function updateContainer(
  element: VirtualNode,
  fiberRoot: FiberRoot
): void {
  const current = fiberRoot.current;

  const workInProgress: FiberNode = {
    ...current,
    pendingProps: { children: [element] },
    alternate: current,
    child: null,
    sibling: null,
    return: null,
  };

  scheduleUpdateOnFiber(workInProgress);
}
