'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var deploy = require('deploy-azure-cdn');

/**
 * gulp plugin for deploying files to azure storage
 */
module.exports = function (opt) {
    var PLUGIN_NAME = 'gulp-deploy-azure-cdn ';

    // upload files all at once, not one by one because we want to get some speed
    // doing it concurrently
    return through.obj(
        function (file, enc, cb) {
            var self = this;
            if (path.basename(file.path)[0] === '_') {
                return cb();
            }
            if (file.isNull()) {
                self.push(file);
                return cb();
            }
            if (file.isStream()) {
                self.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return cb();
            }
            var logger = gutil.log.bind(PLUGIN_NAME);
            try {
                deploy(opt, [file], logger, function (err) {
                    if (err) {
                        this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
                    } else {
                        cb(null, file);
                    }
                })
            } catch (err) {
                this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
            }
        });
};
