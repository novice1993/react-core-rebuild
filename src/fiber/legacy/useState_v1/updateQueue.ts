import type { FiberNode } from "@/fiber/type.fiber";

interface Update {
  payload: any;
  next: Update | null;
}

/** Update Queue에 state setter 함수 추가 */
export function enqueueUpdate(fiber: FiberNode, newState: any) {
  const update: Update = {
    payload: newState,
    next: null,
  };

  let queue = fiber.updateQueue;
  if (!queue) {
    queue = { shared: { pending: null } };
    fiber.updateQueue = queue;
  }

  const pending = queue.shared.pending;
  if (!pending) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }

  queue.shared.pending = update;
}

/** Update Queue를 순회하며 state 갱신  */
export function processUpdateQueue(fiber: FiberNode) {
  const queue = fiber.updateQueue;
  if (!queue) return fiber.memoizedState;

  let baseState = fiber.memoizedState;
  let pending = queue.shared.pending;

  if (pending !== null) {
    const first = pending.next;
    let update = first;
    do {
      baseState = update.payload;
      update = update.next;
    } while (update !== first);
    queue.shared.pending = null;
  }

  return baseState;
}
