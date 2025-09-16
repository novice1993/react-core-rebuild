export interface VirtualNode {
  type: string | Function;
  key: string | number | null;
  props: {
    [key: string]: any;
    children: NormalizedChild[];
  };
}

export type Child = VirtualNode | string | number | boolean | null | undefined;

export type NormalizedChild = VirtualNode | string;
