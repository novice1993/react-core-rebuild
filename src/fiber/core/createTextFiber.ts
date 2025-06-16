import { FiberNode } from "../type.fiber";
import { FiberFlags } from "../constants";

const TEXT_ELEMENT = "TEXT_ELEMENT";

export function createTextFiber(text: string, parent: FiberNode): FiberNode {
  return {
    type: TEXT_ELEMENT,
    key: null,
    stateNode: null,

    child: null,
    sibling: null,
    return: parent,
    alternate: null,

    flags: FiberFlags.Placement,

    pendingProps: { nodeValue: text },
    memoizedProps: null,

    memoizedState: null,
    updateQueue: null,
  };
}
