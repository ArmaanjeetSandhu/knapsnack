declare module "react-katex" {
  import * as React from "react";

  export interface KatexProps {
    math?: string;
    children?: React.ReactNode;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: any;
    [key: string]: any;
  }

  export class InlineMath extends React.Component<KatexProps> {}
  export class BlockMath extends React.Component<KatexProps> {}
}
