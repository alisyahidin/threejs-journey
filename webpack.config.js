const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const generateEntries = () => {
  const scripts = fs.readdirSync(path.join(__dirname, 'src'), { withFileTypes: true })
    .filter(item => item.isDirectory())
    .reduce((value, item) => {
      const output = `${item.name}/main`
      if (!value.hasOwnProperty(output)) {
        value[output] = path.resolve(__dirname, `src/${item.name}/main.ts`)
      }
      return value;
    }, {})

  return scripts
}

generateEntries()
module.exports = {
  mode: 'development',
  entry: generateEntries(),
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
        {
          from: path.resolve(__dirname, 'src/**/*.{html,css,png,svg,jpg,jpeg,gif}'),
          to({ absoluteFilename }) {
            const fileName = absoluteFilename.split('/src/')[1];
            return path.resolve(__dirname, `dist/${fileName}`);
          },
        }
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
      },
    ]
  },
  devtool: "source-map"
};