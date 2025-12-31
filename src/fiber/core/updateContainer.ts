import { VirtualNode } from "@/jsx/type.jsx";
import { FiberRoot } from "../type.fiber";
import { scheduleUpdateOnFiber } from "../scheduler/scheduleUpdateOnFiber";

export function updateContainer(
  element: VirtualNode,
  fiberRoot: FiberRoot
): void {
  const current = fiberRoot.current;

  // HostRoot Fiber의 pendingProps에 최상위 컴포넌트를 설정
  current.pendingProps = { children: [element] };
  scheduleUpdateOnFiber(current);
}
