module.exports = {
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript", // Added TypeScript preset
      'module:metro-react-native-babel-preset',
      "@react-native/babel-preset"   
    ],
    plugins: ["@babel/plugin-transform-class-static-block"]
  };
  