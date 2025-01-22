#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec4 aVertexPosition;
in vec4 aVertexNormal;
out vec3 normal;

void main() {
  normal = (uNormalMatrix * aVertexNormal).xyz;
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
