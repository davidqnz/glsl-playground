import type { ReactElement } from "react";
import Button from "../form-controls/button";
import styles from "./info-card.module.css";

type Props = {
  onDismiss: () => void;
};

export default function InfoCard({ onDismiss }: Props): ReactElement {
  return (
    <div className={styles.card}>
      <h2>Shader Inputs</h2>
      The following inputs are currently supported. A valid program can use any subset of them. More coming soon.
      <section>
        <h3>Uniforms</h3>
        <section>
          <p>
            <span className={styles.code}>uniform mat4 uProjectionMatrix</span>
          </p>
          <p>
            <span className={styles.code}>uniform mat4 uModelViewMatrix</span>
          </p>
          <p>
            <span className={styles.code}>uniform mat4 uNormalMatrix</span>
          </p>
          <p>
            <span className={styles.code}>uniform sampler2D uTextureSampler</span>
          </p>
        </section>
        <h3>Vertex Attributes</h3>
        <section>
          <p>
            <span className={styles.code}>attribute vec3 aVertexPosition</span>
          </p>
          <p>
            <span className={styles.code}>attribute vec3 aVertexNormal</span>
          </p>
          <p>
            <span className={styles.code}>attribute vec2 aTextureCoord</span>
          </p>
          Keep in mind that if you're using <span className={styles.code}>#version 300 es</span> like in the example
          program, you will want to use the
          <span className={styles.code}>in</span>&nbsp;/&nbsp;<span className={styles.code}>out</span> keywords rather
          than&nbsp;
          <span className={styles.code}>attribute</span>.
        </section>
      </section>
      <Button className={styles.button} onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
