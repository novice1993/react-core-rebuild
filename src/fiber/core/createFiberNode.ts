import { VirtualNode } from "@/jsx/type.jsx";
import { FiberNode } from "../type.fiber";
import { FiberFlags } from "../constants";

export function createFiberNode(virtualNode: VirtualNode): FiberNode {
  return {
    type: virtualNode.type,
    key: virtualNode.key,
    stateNode: null,

    child: null,
    sibling: null,
    return: null,
    alternate: null,

    flags: FiberFlags.Placement,

    pendingProps: virtualNode.props,
    memoizedProps: null,

    memoizedState: null,
    updateQueue: null,
  };
}
