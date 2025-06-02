import { VirtualNode } from "@/jsx/type.jsx";
import { FiberNode } from "../type.fiber";

export function createFiberNode(virtualNode: VirtualNode): FiberNode {
  return {
    type: virtualNode.type,
    key: virtualNode.key,
    stateNode: null,

    child: null,
    sibling: null,
    return: null,
    alternate: null,

    flags: "Placement",

    pendingProps: virtualNode.props,
    memoizedProps: null,

    memoizedState: null,
    updateQueue: null,
  };
}
