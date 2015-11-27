/**
 * Created by baidu on 15/11/26.
 */



soi.release.task("dev")
    .config({
      md5: false,
      drd: '../build',
      mapTo: '../build/map.json',
      replace: {
          from: '__NAVBAR__',
          to: function($0, $1) {

          }
      }
    })
    .addRule(/(.*)\.less$/, {
      use: [{
        plugin: soi.plugin.lessjs,
        config: {}
      }, {
        plugin: soi.plugin.css,
        config: {}
      }],
      to: 'static/css/$0.css'
    })
    .addRule("**", {
        use: [{
            plugin: soi.plugin.uglify,
            config: {}
        }],
        to: 'static/css/$0.css'
    })



    .postProcess('soi-postprocess-tpler', {
      pack: {
        'static/js/base.js': [
            'base/*.js',
            'projects/*.js'
        ]
      }
    });

