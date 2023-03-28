const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, 'client', 'main.js'),
  output: {
    path: path.join(__dirname, "public"),
    filename: 'dacha.js',
    clean: true
  },
  plugins: [new HtmlWebpackPlugin({
    template: path.join(__dirname, 'client', 'index.html'),
    filename: "index.html"
  })],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
}
