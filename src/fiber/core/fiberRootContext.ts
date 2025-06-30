import { FiberRoot } from "../type.fiber";

export const fiberRootContext = {
  current: null as FiberRoot | null,
};

export function setGlobalFiberRoot(fiberRoot: FiberRoot): void {
  fiberRootContext.current = fiberRoot;
}

export function getGlobalFiberRoot(): FiberRoot | null {
  return fiberRootContext.current;
}
