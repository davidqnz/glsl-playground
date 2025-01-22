import type { CSSProperties, ReactElement, ReactNode } from "react";
import styles from "./toolbar.module.css";

type ToolbarProps = {
  style?: CSSProperties;
  children: [ReactElement, ReactElement];
};

export default function Toolbar({ style, children }: ToolbarProps): ReactElement {
  const leftGroup = children.find((c) => c.type === ToolbarLeftGroup);
  const rightGroup = children.find((c) => c.type === ToolbarRightGroup);

  return (
    <div className={styles.toolbar} style={style}>
      {leftGroup}
      {rightGroup}
    </div>
  );
}

type ToolbarLeftGroupProps = {
  className?: string;
  children?: ReactNode;
};

export function ToolbarLeftGroup({ className, children }: ToolbarLeftGroupProps): ReactElement {
  return <div className={className}>{children}</div>;
}

type ToolbarRightGroupProps = {
  className?: string;
  children?: ReactNode;
};

export function ToolbarRightGroup({ className, children }: ToolbarRightGroupProps): ReactElement {
  return <div className={className}>{children}</div>;
}
