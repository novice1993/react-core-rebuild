export interface Update {
  action: any;
  next: Update | null; // 다음 업데이트를 가리키는 포인터
}

export interface UpdateQueue {
  pending: Update | null; // 가장 최근에 enqueue 된 업데이트를 가리키는 포인터
}

export interface Hook {
  memoizedState: any; // 상태 값
  queue: UpdateQueue; // 상태 갱신 작업을 담는 큐
  next: Hook | null; // 다음 훅을 가리키는 포인터
}

export interface Effect {
  create: () => void | (() => void);
  destroy: (() => void) | null | undefined;
  deps: any[] | null;
  tag: "Passive" | "Layout";
}
