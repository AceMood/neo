/**
 * @provides Router
 * @module
 * @file 应用的整体Route / 暴露window.router给整个应用
 * @author zhangshen04
 */

'use strict';


return Backbone.Router.extend({
    routes : {
        ''              : 'renderDeskTopView',
        'explore'       : 'renderModuleListView',
        'develop/*path' : 'renderIDEView',
        'develop'       : 'renderIDEView',
        'codereview'    : 'renderCodeReviewView',
        'online'        : 'renderOnlineView',
        'management'    : 'renderManagementView',
        'help'          : 'renderHelpView',
        'task'          : 'renderTaskView',
        'statistic'     : 'renderStatisticView',
        'tpllogs'       : 'renderTplLogsView',
        'score'         : 'renderScoreView',
        'yixiu'         : 'renderYixiuView',
        'standard'      : 'renderStandardTemplateView'
    },

    initialize: function() {
        var _this      = this,
            deskView   = this.deskView = new DesktopView(this.$main);
        this.username  = null;
        this.$main     = $('body');

        var def1 = $.Deferred(),
            def2 = $.Deferred();
        this.def = def2; // Global Deferred Object

        // 筹备图标的数据，并绑定点击事件
        _this.arr = require('./iconconfig');

        // 权限检查
        api.get('/user/auth').done(function(data) {
            if (!data) {

                var aul = new AuthorityLostView();
                _this.$main.html(aul.$el);
            } else {
                def1.resolve();
            }
        });
    },

    /**
     * 触发点击图标跳转的操作
     * @param {string} path
     * @private
     */
    _triggerIconClickEvent: function(path) {
        $.each(this.arr, function(index, v) {
            if (v.hash === path) {
                v.icon.trigger('click');
            }
        });
    },

    renderDeskTopView: function() {
        this.deskView.show();
        this.$main.append(this.deskView.$el);
        $.each(this.arr, function(index, v) {
            if (v.win) {
                v.win.min();
            }
        });
    }
});
