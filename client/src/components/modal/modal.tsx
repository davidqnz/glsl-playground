import type { MouseEvent, ReactElement } from "react";
import styles from "./modal.module.css";

type Props = {
  children: ReactElement;
  open: boolean;
  onClickOut?: () => void;
};

export default function Modal({ children, open, onClickOut }: Props): ReactElement {
  function handleClick(e: MouseEvent<HTMLDivElement>): void {
    if (onClickOut && e.target === e.currentTarget) {
      onClickOut();
    }
  }

  return open ? (
    <div className={styles.backdrop} onClick={handleClick}>
      {children}
    </div>
  ) : (
    <></>
  );
}
