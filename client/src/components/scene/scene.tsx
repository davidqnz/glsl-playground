import { vec2 } from "gl-matrix";
import { type CSSProperties, type PointerEvent, type ReactElement, useEffect, useRef, useState } from "react";
import teapot from "../../assets/models/teapot.obj";
import texture from "../../assets/textures/iron.png";
import { useEditorStateContext } from "../../hooks/use-editor-state";
import { Loader } from "../../hooks/use-loader";
import useMeshFromModel from "../../hooks/use-mesh-from-model";
import styles from "./scene.module.css";
import SceneRenderer from "./webgl/scene-renderer";

type Props = {
  style: CSSProperties;
};

export default function Scene({ style }: Props): ReactElement {
  const [mesh] = useMeshFromModel(teapot);
  const [editorState, dispatch] = useEditorStateContext();
  const [pointerDown, setPointerDown] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRenderer>();

  const { vertexSource, fragmentSource } = editorState.program;

  useEffect(() => {
    if (!canvasRef.current) throw new Error("Canvas ref is unexpectedly null!");

    if (!sceneRef.current) {
      const gl = canvasRef.current.getContext("webgl2");
      if (gl === null) throw new Error("Failed to create a webgl2 context.");

      sceneRef.current = new SceneRenderer(gl);
      sceneRef.current.loadTextureAsync(texture);
      sceneRef.current.setRunning(true);
    }

    const errors = sceneRef.current.loadProgram(vertexSource, fragmentSource);
    dispatch({ action: "set-errors", errors: errors });
  }, [vertexSource, fragmentSource]);

  useEffect(() => {
    if (!sceneRef.current || !Loader.isLoaded(mesh)) return;
    sceneRef.current.setMesh(mesh.value);
  }, [mesh]);

  function handleDrag(e: PointerEvent<HTMLCanvasElement>): void {
    if (!pointerDown) return;
    if (!sceneRef.current || !canvasRef.current) return;
    const scene = sceneRef.current;
    const canvas = canvasRef.current;

    const referenceDimension = Math.min(canvas.clientHeight, canvas.clientWidth);
    const dx = (e.movementY / referenceDimension) * Math.PI;
    const dy = (e.movementX / referenceDimension) * Math.PI;
    const deltaRotation = vec2.fromValues(dx, dy);

    const rotation = scene.getEulerAngles();
    vec2.add(rotation, rotation, deltaRotation);
    scene.setEulerAngles(rotation);
  }

  useEffect(() => {
    function handleMouseWheel(e: WheelEvent): void {
      if (!sceneRef.current) return;
      e.preventDefault();

      const distance = sceneRef.current.getCameraDistance();
      const delta = Math.sign(e.deltaY) * Math.sqrt(Math.abs(e.deltaY));
      sceneRef.current.setCameraDistance(distance + (distance / 50) * delta);
    }

    canvasRef.current?.addEventListener("wheel", handleMouseWheel, { passive: false });
    return () => {
      canvasRef.current?.removeEventListener("wheel", handleMouseWheel);
    };
  }, []);

  return (
    <div className={styles.canvasContainer} style={style}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={() => setPointerDown(true)}
        onPointerUp={() => setPointerDown(false)}
        onPointerMove={(e) => handleDrag(e)}
        onPointerLeave={() => setPointerDown(false)}
      />
      {Loader.loadingDidError(mesh) && <span className={styles.error}>Failed to load model :(</span>}
    </div>
  );
}
