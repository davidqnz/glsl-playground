import ObjFileParser from "obj-file-parser";
import type { Result } from "../../../../../common/result";

export default class Mesh {
  vertices: Float32Array;
  indices: Uint32Array;

  constructor(vertices: Float32Array, indices: Uint32Array) {
    this.vertices = vertices;
    this.indices = indices;
  }

  static fromObj(objData: string): Result<Mesh> {
    const objParser = new ObjFileParser(objData);
    const [model] = objParser.parse().models;

    if (!model) return new Error("Failed to parse model.");

    const vertexToIndex = new Map<number, number>();
    const serializedVertices = [];
    let vertexCount = 0;
    const serializedIndices = [];

    for (const face of model.faces) {
      for (const faceVertex of face.vertices) {
        const positionIndex = faceVertex.vertexIndex - 1;
        const normalIndex = faceVertex.vertexNormalIndex - 1;
        const uvIndex = faceVertex.textureCoordsIndex - 1;

        const key = (positionIndex * 894793 + normalIndex) * 298409 + uvIndex;

        if (vertexToIndex.has(key)) {
          serializedIndices.push(vertexToIndex.get(key)!);
          continue;
        }

        const position = model.vertices[positionIndex];
        const normal = model.vertexNormals[normalIndex];
        const uv = model.textureCoords[uvIndex];

        serializedVertices.push(position?.x || 0);
        serializedVertices.push(position?.y || 0);
        serializedVertices.push(position?.z || 0);

        serializedVertices.push(normal?.x || 0);
        serializedVertices.push(normal?.y || 0);
        serializedVertices.push(normal?.z || 0);

        serializedVertices.push(uv?.u || 0);
        serializedVertices.push(uv?.v || 0);

        serializedIndices.push(vertexCount);
        vertexToIndex.set(key, vertexCount);
        vertexCount++;
      }
    }

    const meshVertices = Float32Array.from(serializedVertices);
    const meshIndices = Uint32Array.from(serializedIndices);

    return new Mesh(meshVertices, meshIndices);
  }
}
