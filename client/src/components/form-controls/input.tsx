import type { DetailedHTMLProps, InputHTMLAttributes, ReactElement } from "react";
import { classes } from "../../utils/style-utils";
import styles from "./form-controls.module.css";

type Props = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export default function Input(props: Props): ReactElement {
  const extendedClassName = classes(styles.control, styles.input, props.className);

  return <input {...props} className={extendedClassName} />;
}
