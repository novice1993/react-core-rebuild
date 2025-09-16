import { Effect } from "./hooks/types";

export interface FiberNode {
  type: string | Function;
  key: null | string | number;
  stateNode: HTMLElement | null;

  child: FiberNode | null;
  sibling: FiberNode | null;
  return: FiberNode | null;
  alternate: FiberNode | null;

  flags: "Placement" | "Update" | "Deletion" | number | null;

  memoizedProps: any;
  pendingProps: any;

  memoizedState: any;
  updateQueue: any;

  effects?: Effect[];
}
