import { FiberNode } from "../type.fiber";
import { workLoop } from "../core/workLoop";
import { commitUnitOfWork } from "../core/commitUnitOfWork";
import { getGlobalFiberRoot } from "../core/fiberRootContext";

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  console.log(`🚀 [scheduleUpdateOnFiber] 시작, fiber:`, fiber.type);
  const finishedWork = workLoop(fiber);
  console.log(
    `📋 [scheduleUpdateOnFiber] workLoop 완료, finishedWork:`,
    finishedWork?.type
  );
  const fiberRoot = getGlobalFiberRoot();

  if (finishedWork && fiberRoot) {
    console.log(`💾 [scheduleUpdateOnFiber] commit 단계 시작`);
    fiberRoot.finishedWork = finishedWork;

    commitUnitOfWork(finishedWork);

    fiberRoot.current = fiberRoot.finishedWork;
    fiberRoot.finishedWork = null;
    console.log(`✅ [scheduleUpdateOnFiber] commit 단계 완료`);
  } else {
    console.log(
      `❌ [scheduleUpdateOnFiber] commit 단계 스킵 - finishedWork:`,
      !!finishedWork,
      "fiberRoot:",
      !!fiberRoot
    );
  }
}
