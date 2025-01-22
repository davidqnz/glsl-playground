declare module "*.obj" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const url: string;
  export default url;
}

declare module "*?raw" {
  const data: string;
  export default data;
}
