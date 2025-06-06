import { Update, UpdateQueue } from "./types";

/** update queue에 업데이트 내역을 등록하는 함수 */
export function enqueueUpdate(queue: UpdateQueue, action: any) {
  const update: Update = { action, next: null };

  // 1. 만약 update queue가 비어있다면, 자기 자신을 가리키는 원형 연결 리스트 구성
  if (queue.pending === null) {
    update.next = update;
  }

  // 2. 기존에 추가된 업데이트가 있을 경우, 새 업데이트를 리스트의 맨 뒤 요소로 삽입
  else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }

  // 마지막으로 삽입된 update를 pending에 할당
  queue.pending = update;
}

export function processUpdateQueue(queue: UpdateQueue, prevState: any): any {
  const pending = queue.pending; // 가장 마지막에 추가된 업데이트
  if (!pending) return prevState;

  let update = pending.next; // 가장 처음 추가된 업데이트
  let newState = prevState;

  do {
    // 함수형 업데이트 여부 판별
    newState =
      typeof update?.action === "function"
        ? update.action(newState)
        : update?.action;

    update = update?.next!;

    // 최초 업데이트로 돌아올 경우 졸료
  } while (update !== pending.next);

  queue.pending = null; // 업데이트 큐 초기화
  return newState;
}
