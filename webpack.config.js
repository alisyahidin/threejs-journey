const path = require('path');
const fs = require('fs');
const CopyPlugin = require("copy-webpack-plugin");

const generateEntries = () => {
  const files = fs.readdirSync(path.join(__dirname, 'src'), { withFileTypes: true })
    .filter(item => item.isDirectory())

  const scripts = files.reduce((value, item) => {
    if (!value.hasOwnProperty(item.name)) {
      value[item.name] = path.resolve(__dirname, `src/${item.name}/main.ts`)
    }
    return value;
  }, {})

  const html = files.map(item => ({
    from: path.resolve(__dirname, `src/${item.name}/index.html`),
    to: path.resolve(__dirname, `dist/${item.name}.html`),
  }))

  const css = files.map(item => ({
    from: path.resolve(__dirname, `src/${item.name}/style.css`),
    to: path.resolve(__dirname, `dist/${item.name}.css`),
  }))

  return { scripts, html, css }
}

generateEntries()
module.exports = {
  mode: 'development',
  entry: generateEntries().scripts,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devServer: {
    static: './dist',
    hot: true,
    watchFiles: [
      'src/**'
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        ...generateEntries().html,
        ...generateEntries().css
      ],
    }),
  ],
  resolve: {
    alias: {
      three: path.resolve('./node_modules/three')
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
};