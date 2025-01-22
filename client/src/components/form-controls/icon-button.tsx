import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactElement } from "react";
import { classes } from "../../utils/style-utils";
import Button from "./button";
import styles from "./form-controls.module.css";

type Props = {
  children: ReactElement;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export default function IconButton({ children, ...forwardProps }: Props): ReactElement {
  return (
    <Button {...forwardProps} className={classes(styles.iconButton, forwardProps.className)}>
      {children}
    </Button>
  );
}
