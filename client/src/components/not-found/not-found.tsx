import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { classes } from "../../utils/style-utils";
import styles from "./not-found.module.css";

type Props = {
  className?: string;
};

export default function NotFound({ className }: Props): ReactElement {
  return (
    <div className={classes(styles.container, className)}>
      <div className={styles.card}>
        <p className={styles.title}>404</p>
        <p className={styles.message}>The requested resource was not found.</p>
        <Link to="/" className={styles.link}>
          Go home?
        </Link>
      </div>
    </div>
  );
}
