const HtmlWebPackPlugin = require("html-webpack-plugin");
//const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader",
            options: { javascriptEnabled: true }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[hash].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
   // new BundleAnalyzerPlugin( analyzerPort: 9999 )
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false
          }
        }
      })
    ],
    concatenateModules: true,
    mangleWasmImports: true,
    removeAvailableModules: true,
    removeEmptyChunks: false,
    flagIncludedChunks: true,
    occurrenceOrder: false,
    usedExports: true,
    noEmitOnErrors: true,
    namedModules: false,
    namedChunks: false,
    sideEffects: true,
    splitChunks: {
      hidePathInfo: true,
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3
    }
  },
  devServer: {
    host: "localhost",
    port: 8081,
    disableHostCheck: true,
    allowedHosts: [".jobhax.com","jobposting-be.jobhax.com", "backend.jobhax.com"],
    compress: true,
    historyApiFallback: true
    //headers: { "content-encoding": "br" }
    //contentBase: [path.join(__dirname, "dist")]
    //     inline: false,
  }
};

{
  /*new CompressionPlugin({
  filename: "[path].br[query]",
  algorithm: "brotliCompress",
  test: /\.(js|css|html|svg)$/,
  compressionOptions: { level: 11 },
  threshold: 10240,
  minRatio: 0.8,
  deleteOriginalAssets: false
})*/
}
