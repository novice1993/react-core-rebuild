import { Effect } from "./hooks/types";

export interface FiberNode {
  type: string | Function;
  key: null | string | number;
  stateNode: HTMLElement | Text | null;

  child: FiberNode | null;
  sibling: FiberNode | null;
  return: FiberNode | null;
  alternate: FiberNode | null;

  flags: number;

  memoizedProps: any;
  pendingProps: any;

  memoizedState: any;
  updateQueue: any;

  effects?: Effect[];
}

export interface FiberRoot {
  containerInfo: HTMLElement;
  current: FiberNode;
  finishedWork: FiberNode | null;
}
