const path = require("path");

module.exports = {
  entry: {
    newtab: path.join(__dirname, "../src/newtab/index.tsx"),
    options: path.join(__dirname, "../src/options/index.tsx"),
    popup: path.join(__dirname, "../src/popup/index.tsx"),
    eventPage: path.join(__dirname, "../src/eventPage.ts")
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        exclude: /node_modules/,
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader?name=[name].[ext]&outputPath=iconfont/&publicPath=./'
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass")//使用dart-sass代替node-sass
            }
             // Compiles Sass to CSS
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  }
};
