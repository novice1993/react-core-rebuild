import { FiberNode, FiberRoot } from "../type.fiber";
import { FiberFlags } from "../constants";

export function createFiberRoot(container: HTMLElement): FiberRoot {
  const hostRootFiber: FiberNode = {
    type: "HostRoot",
    key: null,
    stateNode: null,

    child: null,
    sibling: null,
    return: null,
    alternate: null,

    flags: FiberFlags.NoFlags,

    pendingProps: null,
    memoizedProps: null,

    memoizedState: null,
    updateQueue: null,
  };

  const fiberRoot: FiberRoot = {
    containerInfo: container,
    current: hostRootFiber,
    finishedWork: null,
  };

  hostRootFiber.stateNode = fiberRoot as any;

  return fiberRoot;
}
