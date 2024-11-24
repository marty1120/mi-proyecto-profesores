const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel')
              ].filter(Boolean)
            },
          },
        ],
      },
    ],
  },
  plugins: [
    process.env.NODE_ENV === 'development' && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
  },
};