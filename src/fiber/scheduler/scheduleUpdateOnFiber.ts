import { FiberNode } from "../type.fiber";
import { workLoop } from "../core/workLoop";
import { commitUnitOfWork } from "../core/commitUnitOfWork";
import { getGlobalFiberRoot } from "../core/fiberRootContext";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  const finishedWork = workLoop(fiber);
  const fiberRoot = getGlobalFiberRoot();

  if (finishedWork && fiberRoot) {
    fiberRoot.finishedWork = finishedWork;

    commitUnitOfWork(finishedWork);

    fiberRoot.current = fiberRoot.finishedWork;
    fiberRoot.finishedWork = null;
  }
}
