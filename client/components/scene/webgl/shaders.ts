export enum ShaderType {
  Vertex = "vertex-shader",
  Fragment = "fragment-shader",
}

type ProgramCompilationResult =
  | { program: WebGLProgram; programInfo: ProgramInfo; errors?: undefined }
  | { program?: undefined; programInfo?: undefined; errors: ProgramCompilationErrors };

export type ProgramCompilationErrors = {
  vertexShaderErrors: Array<CompilationError>;
  fragmentShaderErrors: Array<CompilationError>;
  linkerErrors: Array<LinkerError>;
};

interface AttributeInfo extends WebGLActiveInfo {
  location: number;
}
interface UniformInfo extends WebGLActiveInfo {
  location: WebGLUniformLocation;
}
export type ProgramInfo = { attributes: Map<string, AttributeInfo>; uniforms: Map<string, UniformInfo> };

type ShaderCompilationResult =
  | { shader: WebGLShader; compilerErrors?: undefined }
  | { shader?: undefined; compilerErrors: Array<CompilationError> };

enum ErrorType {
  Error = "ERROR",
  Warning = "WARNING",
}

export type CompilationError = {
  errorType: ErrorType;
  columnNumber: number;
  lineNumber: number;
  message: string;
};

export type LinkerError = {
  message: string;
};

export function compileProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): ProgramCompilationResult {
  const errors: ProgramCompilationErrors = {
    vertexShaderErrors: [],
    fragmentShaderErrors: [],
    linkerErrors: [],
  };

  const vertexShaderResult = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShaderResult.shader) errors.vertexShaderErrors = vertexShaderResult.compilerErrors;

  const fragmentShaderResult = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShaderResult.shader) errors.fragmentShaderErrors = fragmentShaderResult.compilerErrors;

  if (!vertexShaderResult.shader || !fragmentShaderResult.shader) {
    return { errors };
  }

  const vertexShader = vertexShaderResult.shader;
  const fragmentShader = fragmentShaderResult.shader;

  const program = gl.createProgram();
  if (program === null) throw new Error("Failed to create shader program.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const rawErrors = gl.getProgramInfoLog(program) as string;
    gl.deleteProgram(program);
    const parsedErrors = parseLinkerError(rawErrors);
    errors.linkerErrors = parsedErrors;
    return { errors };
  }

  // Now that we've successfully linked the program, free the shader objects
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  const programInfo = loadProgramInfo(gl, program);

  return { program, programInfo };
}

function loadProgramInfo(gl: WebGL2RenderingContext, program: WebGLProgram): ProgramInfo {
  const attributes = new Map<string, AttributeInfo>();
  const numberOfAttributes: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numberOfAttributes; i++) {
    const activeInfo = gl.getActiveAttrib(program, i);
    if (activeInfo === null) throw new Error(`Failed to get attribute information at location ${i}`);

    // Since we've just successfully queried information about this attribute, it had better have a location...
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const location = gl.getAttribLocation(program, activeInfo.name)!;
    const withLocation = { ...activeInfo, location } as AttributeInfo;
    attributes.set(activeInfo.name, withLocation);
  }

  const uniforms = new Map<string, UniformInfo>();
  const numberOfUniforms: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < numberOfUniforms; i++) {
    const activeInfo = gl.getActiveUniform(program, i);
    if (activeInfo === null) throw new Error(`Failed to get uniform information at location ${i}`);

    // See note on previous assertion.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const location = gl.getUniformLocation(program, activeInfo.name)!;
    const withLocation = { ...activeInfo, location } as UniformInfo;
    uniforms.set(activeInfo.name, withLocation);
  }

  return { attributes, uniforms };
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): ShaderCompilationResult {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error("Failed to create shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const rawErrors = gl.getShaderInfoLog(shader) as string;
    gl.deleteShader(shader);
    return { compilerErrors: parseCompilerErrors(rawErrors) };
  }

  return { shader };
}

function parseCompilerErrors(error: string): Array<CompilationError> {
  const lines = error.split(/\n/).slice(0, -1); // The last line ends with a \n\u0000 that we don't want to parse;

  const parsedErrors: Array<CompilationError> = [];
  for (const error of lines) {
    const match = error.match(/(ERROR|WARNING): (\d+):(\d+): (.*)/);

    if (!match) {
      console.log(`Failed to parse compiler error line: ${error}`);
      continue;
    }

    // We know how many capture groups there were. Typescript does not.
    const [, errorType, column, line, message] = match as [string, string, string, string, string];

    parsedErrors.push({
      errorType: errorType === "ERROR" ? ErrorType.Error : ErrorType.Warning,
      columnNumber: Number.parseInt(column),
      lineNumber: Number.parseInt(line),
      message,
    });
  }

  return parsedErrors;
}

function parseLinkerError(error: string): Array<LinkerError> {
  const lines = error.split(/\n/).slice(0, -1); // The last line ends with a \n\u0000 that we don't want to parse;

  const parsedErrors: Array<LinkerError> = [];
  for (const error of lines) {
    parsedErrors.push({ message: error });
  }

  return parsedErrors;
}
