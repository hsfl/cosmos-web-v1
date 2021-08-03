const path = require('path');

const neutrino = require('neutrino');
const react = require('@neutrinojs/react');
const airbnb = require('@neutrinojs/airbnb');
const jest = require('@neutrinojs/jest');
const devServer = require('@neutrinojs/dev-server');
const htmlTemplate = require('@neutrinojs/html-template');
const clean = require('@neutrinojs/clean');
const copy = require('@neutrinojs/copy');
const babelMerge = require('babel-merge');

const webpack = require("webpack");
const Dotenv = require('dotenv-webpack');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  options: {
    root: __dirname,
    output: 'api/dist',
  },
  use: [
    airbnb({
      eslint: {
        baseConfig: {
          rules: {
            'no-bitwise': 0,
            'no-mixed-operators': 0,
          },
          settings: {
            react: {
              version: '16.5',
            },
          },
        }
      }
    }),
    react({
      html: {
        title: 'COSMOS Web',
      },
      publicPath: '/',
      style: {
        // Override the default file extension of `.css` if needed
        test: /\.(css|sass|scss)$/,
        modulesTest: /\.module\.(css|sass|scss)$/,
        loaders: [
          // Define loaders as objects. Note: loaders must be specified in reverse order.
          // ie: for the loaders below the actual execution order would be:
          // input file -> sass-loader -> postcss-loader -> css-loader -> style-loader/mini-css-extract-plugin
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
              ],
            },
          },
        ],
      },
    }),
    jest({
      setupFiles: [
        './test/setupTests.js',
      ],
      moduleNameMapper: {
        "\\.(obj|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
      },
      moduleFileExtensions: ['jsx', 'js'],
    }),
    devServer({
      disableHostCheck: true,
      host: '0.0.0.0',
      watchOptions: {
        ignored: /node_modules/
      }
    }),
    clean(),
    copy({
      patterns: [
        {
          from: 'src/public',
          to: '',
        },
        {
          from: "node_modules/cesium/Build/Cesium",
          to: "cesium",
        },
        {
          from: 'external/',
          to: '',
        }
      ]
    }),
    htmlTemplate({
      template: './src/public/index.html'
    }),
    (neutrino) => {
      neutrino.config.output
        .filename('[name].bundle.js')
        .sourcePrefix('');

      neutrino.config
        .amd({
          // Enable webpack-friendly use of require in Cesium
          toUrlUndefined: true
        });

      neutrino.config.node
        .set('fs', 'empty');

      neutrino.config
        .externals({
          cesium: 'Cesium'
        });

      neutrino.config.module
        .rule('compile')
          .test(/\.(js|jsx)$/)
          .exclude
            .add(/node_modules/)
            .end()
          .use('babel')
          .tap(options =>
            babelMerge(
              {
                plugins: [
                  'styled-jsx/babel'
                ],
              },
              options,
            ),
          );
          
          
        neutrino.config.module
          .rule('file-loader')
          .test(/\.(glb|czml|obj|png)$/)
          .exclude
            .add(/node_modules/)
          .end()
            .use('file-loader')
            .loader('file-loader')
            
        if (process.env.NODE_ENV === 'production') {
          neutrino.config.module
            .rule('strip-pragma-loader')
              .test(/\.js$/)
              .include
                .add(path.resolve(__dirname, cesiumSource))
                .end()
              .use('strip-pragma-loader')
                .loader('strip-pragma-loader')
                .options({
                  pragmas: {
                    debug: false,
                  }
                });
        }

      neutrino.config
        .plugin('Dotenv')
        .use(Dotenv, [{
          defaults: false,
        }])
        .end()
          .plugin('DefinePlugin')
          .use(webpack.DefinePlugin, [{
            CESIUM_BASE_URL: JSON.stringify("/cesium"),
            'process.env.VERSION': JSON.stringify(require("./package.json").version),
          }])
          .end()
            .plugin('AntdDayjs')
              .use(AntdDayjsWebpackPlugin)
    },
  ]
};