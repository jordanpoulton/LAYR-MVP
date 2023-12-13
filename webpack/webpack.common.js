const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

// eslint-disable-next-line no-undef
module.exports = {
  entry: {
    popup: path.join(srcDir, "popup", "index.js"),
    background: path.join(srcDir, "background", "index.js"),
    content_script: path.join(srcDir, "contentScripts", "index.js"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
    clean: true,
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
