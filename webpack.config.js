const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  devtool: "eval-source-map",
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    static: "./dist",
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Interacting with smart contract",
      template: "index.html",
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /^fs$/, contextRegExp: /./ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^path$/, contextRegExp: /./ }),
  ],
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
  },
  output: {
    filename: "[name].bundle.js",
    clean: true,
  },
};
