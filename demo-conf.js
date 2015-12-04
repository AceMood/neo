/**
 * Created by baidu on 15/11/26.
 * @sample
 * plugin list:
 * 1. css (built-in)
 * 2. less (built-in)
 * 3. uglify (built-in)
 * 4. md5 (built-in)
 * 5. replacer (built-in)
 * 6. packager
 * 7. tpl-loader (3rd)
 */

soi.deploy.task('dev',
    {
        receiver: 'http://cp01-zhida-jieru.epc.baidu.com:8343/receiver',
        dir: '/home/work/webroot/templates/templates/eva_merchant_zhangshen/',
        cacheTo: '../build/.cache',
        scandirs: ['.']
    })
    .addRule('**')
        .use('replacer', {
            from: '__NAVBAR__',
            to: function($0, $1) {
                if ($0 === '__NAVBAR__') {
                    return 'zhida.baidu.com'
                }
            }
        })
    .addRule(/(.*)\/(.*)\.less/)
        .use('less')
        .to('static/merchant/$1/$2.css')
    .addRule(/(.*)\/(.*)\.js/)
        .to('static/merchant/$1/$2.css')
    .addRule('*.tpl')
        .use('plugin-tplloader', {
            left: '{{',
            right: '}}'
        });


soi.release.task('dev',
    {
        to: '../dist/',
        mapTo: '../build/map.json',
        cacheTo: '../build/.cache',
        scandirs: ['.']
    })
    .addRule('**')
        .use('replacer', {
            from: '__NAVBAR__',
            to: function($0, $1) {
                if ($0 === '__NAVBAR__') {
                    return 'zhida.baidu.com'
                }
            }
        })
    .addRule(/(.*)\.less$/)
        .use('less', {})
        .use('css')
        .use('md5')
    .addRule('lib/*.js')
        .use('cmdwrapper', {
            define: '__d',
            usestrict: false,
            commentdoc: ''
        })
        .use('uglify', {
            debug: false,
            curl: true,
            eqeqeq: false
        })
        .use('depsResolver')
        .use('md5', {
            length: 9,
            noname: true,
            encoding: 'base64'
        })
        .to('static/js/')
    .addRule(/merchant\/(.*)\/.*\.js$/)
        .use('packager', {
            'static/js/base.js': [
                'base/*.js'
            ],
            'static/js/lib.js': [
                'lib/*.js'
            ]
        })
    .addRule('*.tpl')
        .use('plugin-tplloader', {
            left: '{{',
            right: '}}'
        })
    .end()
    .flush();

