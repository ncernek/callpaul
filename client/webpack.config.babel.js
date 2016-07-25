//require our dependencies
import path from 'path';
import webpack from 'webpack';
import BundleTracker from 'webpack-bundle-tracker';
import _ from 'lodash';

const VERBOSE = _.includes(process.argv, '--verbose');
const DEBUG = !_.includes(process.argv, '--release') && !(process.env.NODE_ENV === 'production');
const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1',
];
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  __DEV__: DEBUG,
};
const TARGET = DEBUG ? 'build' : 'dist';

module.exports = {
    //the base directory (absolute path) for resolving the entry option
    context: __dirname,
    //the entry point we created earlier. Note that './' means
    //your current directory. You don't have to specify the extension  now,
    //because you will specify extensions later in the `resolve` section
    entry: ['./src/index'],

    cache: DEBUG,
    debug: DEBUG,

     stats: {
        colors: true,
        reasons: DEBUG,
        hash: VERBOSE,
        version: VERBOSE,
        timings: true,
        chunks: VERBOSE,
        chunkModules: VERBOSE,
        cached: VERBOSE,
        cachedAssets: VERBOSE,
    },

    output: {
        //where you want your compiled bundle to be stored
        path: path.join(__dirname, TARGET, 'js/'),
        publicPath: "/assets/js/",
        //naming convention webpack should use for your files
        filename: '[name]-[hash].js',
    },
  //output: {
  //  path: __dirname,
  //  publicPath: '/',
  //  filename: 'bundle.js'
  //},

  externals:  DEBUG ? { jquery: "jQuery"  } : false,

  plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        //tells webpack where to store data about your bundles.
        new BundleTracker({path: path.join(__dirname, TARGET)}),
        //makes jQuery available in every module
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        }),
        new webpack.DefinePlugin({ ...GLOBALS, 'process.env.BROWSER': true }),
        ...(!DEBUG ? [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
            compress: {
              // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
              screw_ie8: true,

              // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
              warnings: VERBOSE,
            },
          }),
          new webpack.optimize.AggressiveMergingPlugin(),
        ] : [])
    ],

    module: {
        preLoaders: [
          {
              test: /\.jsx?$/,
              loader: "eslint-loader",
              exclude: /node_modules/
          }
        ],
        loaders: [
            //a regexp that tells webpack use the following loaders on all
            //.js and .jsx files
            {
                test: /\.jsx?$/,
                //we definitely don't want babel to transpile all the files in
                //node_modules. That would take a long time.
                exclude: /node_modules/,
                //use the babel loader
                loader: 'babel-loader',
                query: {
                    //specify that we will be dealing with React code
                    presets: ['react']
                }
            },{
                test: /\.(scss|css)$/,
                exclude: /\.global\.(scss|css)$/,
		            loaders: [
                  'style-loader',
                  `css-loader?${DEBUG ? 'sourceMap&' : 'minimize&'}modules&localIdentName=` +
                  `${DEBUG ? '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]'}`,
                  'postcss-loader?parser=postcss-scss',
                ],
            },{
                test: /\.global\.(scss|css)$/,
                loaders: [
                  'style-loader',
                  `css-loader?${DEBUG ? 'sourceMap' : 'minimize'}`,
                  'postcss-loader?parser=postcss-scss',
                ],
            },{
                test: /\.json$/,
                loader: 'json-loader',
            }, {
                test: /\.txt$/,
                loader: 'raw-loader',
            }, {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
                loader: 'url-loader?limit=10000',
            }, {
                test: /\.(eot|ttf|wav|mp3)$/,
                loader: 'file-loader',
            }
        ]
    },

    resolve: {
        //tells webpack where to look for modules
        modulesDirectories: ['node_modules'],
        //extensions that should be used to resolve modules
        extensions: ['', '.js', '.jsx']
    },

    postcss: function plugins(bundler) {
        return [
          require('postcss-import')({ addDependencyTo: bundler }),
          require('precss')(),
          require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS }),
        ];
      },

    devtool: DEBUG ? 'cheap-module-eval-source-map' : false,

    devServer: {
        stats: 'errors-only'
    }
};
