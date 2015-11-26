/**
 * Created by baidu on 15/11/26.
 */

soi.release.task("dev")
    .config({
      md5: false,
      drd: '../build'
    })
    .addRule("*.less", {
      plugin: [soi.plugin.lessjs, {}],
      to: 'static/css/$0.css'
    })
    .addRule("*.js", {
      plugin: [soi.plugin.jshint, {}],
      to: 'static/js/$0.js'
    })
    .postProcess('soi-postprocess-tpler', {
      pack: {
        'static/js/base.js': [
            'base/*.js',
            'projects/*.js'
        ]
      }
    });
