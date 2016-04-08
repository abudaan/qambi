var path = require('path');

module.exports = {
  entry: './src/fp/test_web.js',
  output: {
    //path: path.join(__dirname, 'build'),
    filename: 'aap.js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: [
            'transform-object-rest-spread',
            'transform-flow-strip-types'
          ]
        }
      }
    ]
  }
};