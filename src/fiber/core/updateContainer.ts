import { VirtualNode } from "@/jsx/type.jsx";
import { FiberRoot } from "../type.fiber";
import { scheduleUpdateOnFiber } from "../scheduler/scheduleUpdateOnFiber";

export function updateContainer(
  element: VirtualNode,
  fiberRoot: FiberRoot
): void {
  const hostRootFiber = fiberRoot.current;
  hostRootFiber.pendingProps = { children: [element] };
  scheduleUpdateOnFiber(hostRootFiber);
}
