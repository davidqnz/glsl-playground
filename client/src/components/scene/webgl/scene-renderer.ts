import { mat4, vec2 } from "gl-matrix";
import type Mesh from "./mesh";
import { type ProgramCompilationErrors, type ProgramInfo, compileProgram } from "./shaders";

export default class SceneRenderer {
  private gl: WebGL2RenderingContext;

  private mesh?: Mesh;
  private program?: WebGLProgram;
  private programInfo?: ProgramInfo;

  private running: boolean = false;
  private eulerAngles: vec2 = vec2.create();
  private cameraDistance: number = 4;

  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
  private texture: WebGLTexture;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) throw new Error("Failed to create gl buffer.");
    this.vertexBuffer = vertexBuffer;

    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) throw new Error("Failed to create gl buffer.");
    this.indexBuffer = indexBuffer;

    const texture = gl.createTexture();
    if (!texture) throw new Error("Failed to create gl texture.");
    this.texture = texture;

    this.initializeTexture();
  }

  private render(): void {
    const gl = this.gl;

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.mesh && this.program && this.programInfo) {
      const fieldOfView = (45 * Math.PI) / 180;
      const aspect = gl.canvas.width / gl.canvas.height;
      const zNear = 0.1;
      const zFar = 150.0;

      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

      const modelViewMatrix = mat4.create();
      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -this.cameraDistance]);

      const rotationMatrix = mat4.create();
      mat4.rotateX(rotationMatrix, rotationMatrix, this.eulerAngles[0]);
      mat4.rotateY(rotationMatrix, rotationMatrix, this.eulerAngles[1]);
      mat4.multiply(modelViewMatrix, modelViewMatrix, rotationMatrix);

      const normalMatrix = mat4.create();
      mat4.invert(normalMatrix, modelViewMatrix);
      mat4.transpose(normalMatrix, normalMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

      this.setUpVertexAttributes();

      gl.useProgram(this.program);
      this.setUpUniforms(projectionMatrix, modelViewMatrix, normalMatrix);

      // Render the mesh
      gl.drawElements(gl.TRIANGLES, this.mesh.indices.length, gl.UNSIGNED_INT, 0);
    }

    // Continue render loop if we're still running
    if (this.running) requestAnimationFrame(this.render.bind(this));
  }

  private setUpVertexAttributes(): void {
    if (!this.programInfo) return;
    const gl = this.gl;

    const positionAttributeInfo = this.programInfo.attributes.get("aVertexPosition");
    if (positionAttributeInfo) {
      gl.enableVertexAttribArray(positionAttributeInfo.location);
      gl.vertexAttribPointer(positionAttributeInfo.location, 3, gl.FLOAT, false, 32, 0);
    }

    const normalAttributeInfo = this.programInfo.attributes.get("aVertexNormal");
    if (normalAttributeInfo) {
      gl.enableVertexAttribArray(normalAttributeInfo.location);
      gl.vertexAttribPointer(normalAttributeInfo.location, 3, gl.FLOAT, true, 32, 12);
    }

    const uvAttributeInfo = this.programInfo.attributes.get("aTextureCoord");
    if (uvAttributeInfo) {
      gl.enableVertexAttribArray(uvAttributeInfo.location);
      gl.vertexAttribPointer(uvAttributeInfo.location, 2, gl.FLOAT, false, 32, 24);
    }
  }

  private setUpUniforms(projectionMatrix: mat4, modelViewMatrix: mat4, normalMatrix: mat4): void {
    if (!this.programInfo) return;
    const gl = this.gl;

    const projectionMatrixUniformInfo = this.programInfo.uniforms.get("uProjectionMatrix");
    if (projectionMatrixUniformInfo) {
      gl.uniformMatrix4fv(projectionMatrixUniformInfo.location, false, projectionMatrix);
    }

    const modelViewMatrixUniformInfo = this.programInfo.uniforms.get("uModelViewMatrix");
    if (modelViewMatrixUniformInfo) {
      gl.uniformMatrix4fv(modelViewMatrixUniformInfo.location, false, modelViewMatrix);
    }

    const normalMatrixUniformInfo = this.programInfo.uniforms.get("uNormalMatrix");
    if (normalMatrixUniformInfo) {
      gl.uniformMatrix4fv(normalMatrixUniformInfo.location, false, normalMatrix);
    }

    const textureSampler = this.programInfo.uniforms.get("uTextureSampler");
    if (textureSampler) {
      gl.uniform1i(textureSampler.location, 0);
    }
  }

  private initializeTexture(): void {
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // Textures have to be loaded asynchronously, so we initialize the texture with a single black pixel while the
    // actual texture is loading.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  }

  async loadTextureAsync(url: string): Promise<void> {
    const gl = this.gl;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        imageBitmap.width,
        imageBitmap.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageBitmap,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    } catch (error) {
      console.error(error);
    }
  }

  loadProgram(vertexShaderSource: string, fragmentShaderSource: string): ProgramCompilationErrors | undefined {
    const result = compileProgram(this.gl, vertexShaderSource, fragmentShaderSource);
    if (!result.program) return result.errors;

    if (this.program) this.gl.deleteProgram(this.program);
    this.program = result.program;
    this.programInfo = result.programInfo;
  }

  setMesh(mesh: Mesh): void {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    this.mesh = mesh;
  }

  setRunning(running: boolean): void {
    if (running && !this.running) {
      // Start the render loop
      requestAnimationFrame(this.render.bind(this));
    }
    this.running = running;
  }

  getEulerAngles(): vec2 {
    return vec2.copy(vec2.create(), this.eulerAngles);
  }

  setEulerAngles(eulerAngles: vec2): void {
    // Gimbal lock the incoming rotation
    eulerAngles[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, eulerAngles[0]));
    vec2.copy(this.eulerAngles, eulerAngles);
  }

  getCameraDistance(): number {
    return this.cameraDistance;
  }

  setCameraDistance(distance: number): void {
    this.cameraDistance = Math.max(0.1, Math.min(distance, 50));
  }
}
