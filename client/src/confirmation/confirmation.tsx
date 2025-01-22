import type { ReactElement } from "react";
import Button from "../components/form-controls/button";
import { classes } from "../utils/style-utils";
import styles from "./confirmation.module.css";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export default function Confirmation({ message, onConfirm, onCancel, destructive = false }: Props): ReactElement {
  return (
    <div className={styles.root}>
      <p>{message}</p>
      <div>
        <Button onClick={onCancel}>Cancel</Button>
        <Button className={classes(destructive && styles.destructive)} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
