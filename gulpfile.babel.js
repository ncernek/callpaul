import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
const $ = gulpLoadPlugins();

import path from 'path';
import { spawn } from 'child_process';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import wpConfig from './client/webpack.config.babel.js';


//TODO: track unapplied migrations

gulp.task("webpack:dev", (callback) => {
    buildPack(wpConfig, callback);
});

function buildPack(config, callback){
    webpack(config, (err, stats) => {
        if(err) throw new $.util.PluginError("webpack", err);
        $.util.log("[webpack]", stats.toString({
          colors: true,
          chunks: false
        }));
        callback();
    });

}

gulp.task("serve:dev", ["webpack:dev"], () => {
  spawn('python', [path.join('app', 'manage.py'), 'runserver'], {stdio: 'inherit', detached: true, shell: true});

});

gulp.task("kick", () => {
  console.log("aw yeah... \n KAPOW!!!");
});

gulp.task("webpack-dev-server", (callback) => {
    // Start a webpack-dev-server
    wpConfig.entry.unshift("webpack-dev-server/client?http://localhost:3000/", "webpack/hot/dev-server");
    wpConfig.output.publicPath = "http://localhost:3000/client/build/js/";
    wpConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    wpConfig.plugins.push(new webpack.NoErrorsPlugin());
    var compiler = webpack(wpConfig);

    new WebpackDevServer(compiler, {
        publicPath: wpConfig.output.publicPath,
        hot: true,
        inline: true,
        historyApiFallback: true,
        colors: true,
        stats: {
            chunks: false
        }
        // server and middleware options
    }).listen(3000, "localhost", (err) => {
        if(err) throw new $.util.PluginError("webpack-dev-server", err);
        // Server listening
        $.util.log("[webpack-dev-server]", "Listening on port 3000");

        // keep the server alive or continue?
        // callback();
    });
});
