module.exports = {
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript" // Added TypeScript preset
    ],
    plugins: ["@babel/plugin-transform-class-static-block"]
  };
  