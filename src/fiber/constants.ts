export const FiberFlags = {
  NoFlags: 0b0000,
  Placement: 0b0001,
  Update: 0b0010,
  Deletion: 0b0100,
  PassiveEffect: 0b1000,
  LayoutEffect: 0b10000,
} as const;
