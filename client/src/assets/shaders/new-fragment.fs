#version 300 es

precision highp float;

in vec3 normal;
out vec4 fragment_color;

// Base material color.
const vec3 materialColor = vec3(1.0, 1.0, 1.0);

// Ambient lighting factors.
const vec3 ambientLightColor = vec3(1.0, 1.0, 1.0);
const float ambientIntensity = 0.2;

// Diffuse lighting factors.
const vec3 diffuseLightColor = vec3(1.0, 1.0, 1.0);
const vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));

void main() {
  vec3 ambient = ambientLightColor * ambientIntensity;

  float diffuseIntensity = max(dot(normal, lightDirection), 0.0);
  vec3 diffuse = diffuseLightColor * diffuseIntensity;

  fragment_color = vec4((ambient + diffuse) * materialColor, 1.0);
}
