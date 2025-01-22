import MenuIcon from "@mui/icons-material/Menu";
import { type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
import Button from "../form-controls/button";
import styles from "./menu.module.css";

type MenuProps = {
  children: ReactNode;
};

export default function Menu({ children }: MenuProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function handleDocumentClick(e: MouseEvent): void {
    if (!(e.target instanceof Node)) return;
    if (rootRef.current && !rootRef.current.contains(e.target)) {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener("click", handleDocumentClick);
      return () => document.removeEventListener("click", handleDocumentClick);
    }
  }, [open]);

  return (
    <div ref={rootRef} className={styles.container}>
      <Button className={styles.hamburgerButton} onClick={() => setOpen((p) => !p)}>
        <MenuIcon fontSize="large" />
      </Button>
      {open && <div className={styles.menu}>{children}</div>}
    </div>
  );
}

type MenuItemProps = {
  children: ReactNode;
  onClick?: () => void;
};

export function MenuItem({ children, onClick }: MenuItemProps): ReactElement {
  return (
    <div className={styles.menuItem} onClick={onClick}>
      {children}
    </div>
  );
}

export function MenuDivider(): ReactElement {
  return <div className={styles.menuDivider} />;
}

type MenuTitleProps = {
  children: ReactNode;
};

export function MenuTitle({ children }: MenuTitleProps): ReactElement {
  return <div className={styles.menuTitle}>{children}</div>;
}
