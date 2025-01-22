import type { ProgramData } from "../../../common/api-types";
import newFragmentShader from "../assets/shaders/new-fragment.fs?raw";
import newVertexShader from "../assets/shaders/new-vertex.vs?raw";

export function createNewProgram(programId: string): ProgramData {
  return {
    id: programId,
    userId: "",
    title: "New Program",
    vertexSource: newVertexShader,
    fragmentSource: newFragmentShader,
    didCompile: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
}
