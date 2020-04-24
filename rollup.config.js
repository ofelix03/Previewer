export default {
  input: "./src/previewer.js",
  output: [
    {
      file: "./dist/previewer.umd.js",
      format: "umd",
    },
    {
      file: "./dist/preivewer.es.js",
      format: "es",
    },
    {
      file: "./dist/previewer.amd.js",
      format: "amd",
    },
    {
      file: "./dist/previewer.cjs.js",
      format: "cjs",
    },
  ],
};
