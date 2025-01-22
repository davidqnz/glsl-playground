import type { ReactElement, ReactNode } from "react";
import { classes } from "../../utils/style-utils";
import styles from "./tabs.module.css";

type TabBarProps = {
  children: ReactNode;
};

export default function TabBar({ children }: TabBarProps): ReactElement {
  return <div className={styles.tabBar}>{children}</div>;
}

type TabProps = {
  title: string;
  active: boolean;
  error: boolean;
  onClick: () => void;
};

export function Tab({ title, active, error, onClick }: TabProps): ReactElement {
  return (
    <div className={classes(styles.tab, active && styles.active, error && styles.error)} onClick={onClick}>
      {title}
    </div>
  );
}
