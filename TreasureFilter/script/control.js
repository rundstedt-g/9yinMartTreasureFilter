//去除空格
String.prototype.trim = function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

//基础方法
String.prototype.format = function(O){
    var s = this.replace(/\@\{(\w+)\}/g, function(t, _o){
        var str = O[_o];
        if( str === 0 ){
            return '0';
        }else if( str === undefined || str === null ){
            return '';
        }else if( str === 'null' ){
            return String( O[_o] );
        }else{
            return O[_o];
        }
    });
    return s;
};

//删除所有HTML标签
String.prototype.htmlEncode = function() {
    return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&#34;").replace(/\'/g,"&#39;");
};

function selectHandler(obj) {
    // selectElem: selectElem,
    // list: tagsList,
    // isSearch: true,
    // multiple: true
    this.open = false;
    this.elem = obj.selectElem;
    this.data = obj.list;
    this.source = [];
    this.isSerach = this.isSearch || false;
    this.multiple = this.multiple || false;
    this.max = obj.max || 10;
    this.zIndex = 1000;
    this.selectedMax = 0;
    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.callback = obj.callback;
    this.mode = $([
        '<div class="select-warp" id="selectWarp" style="display: none;">',
        // '   <div><input type="text" placeholder="请输入搜索关键字..." /></div>',
        '   <ul class="select-list"></ul>',
        '</div>'
    ].join('')),
        this.ulBox = this.mode.find('.select-list');
    // 界面初始化
    this.init()
}

selectHandler.prototype = {
    init: function () {
        var _this = this;
        _this.mode.css({
            zIndex: _this.zIndex
        })
        $('body').append(_this.mode);
        $(document).bind('click', function(){
            this.open = false;
            _this.mode.hide();
        });
        _this.mode.bind('click', function(){
            return false
        });
    },
    loop: function() {
        for (var i = 0; i < this.source.length; i++) {
            this.createLi(this.source[i]);
        }
    },
    findeIndex: function(data, key) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === key) {
                return i;
            }
        }
        return -1;
    },
    setPosition: function () {
        var offset = this.elem.offset();
        var scrollTop = $(document).scrollTop();
        var scrollLeft = $(document).scrollLeft();
        this.width = this.elem.outerWidth(true);
        this.left = parseInt( offset.left ) - scrollLeft;
        this.top = parseInt( offset.top + this.elem.outerHeight(true) ) - scrollTop;
        this.mode.css({
            width: this.width + 'px',
            top: this.top + 'px',
            left: this.left + 'px'
        })
    },
    changeSelected: function(data, index) {
        data[index].selected = !data[index].selected;
        if (data[index].selected) {
            this.selectedMax++;
            return true
        } else {
            this.selectedMax--;
            return false
        }
    },
    createLi: function (item){
        var temp = $('<li>@{name}<i></i></li>'.format(item));
        var _this = this;
        temp.bind('click', function(){
            _this.selected(item)
        });
        if (item.selected) {
            temp.find('i').addClass('selected');
        } else {
            temp.find('i').removeClass('selected');
        }
        this.ulBox.append(temp);
    },
    show: function (obj) {
        this.open = true;
        if (!this.source.length) {
            this.clear();
            this.source.length = 0;
            this.selectedMax = 0;
            for ( var i = 0; i < this.data.length; i++ ) {
                var item = this.data[i];
                var idx = this.findeIndex(obj, item.id);
                if (idx !== -1) {
                    this.selectedMax++;
                }
                this.source.push({
                    id: item.id,
                    name: item.name,
                    selected: idx !== -1 ? true : false
                });
            }
            this.loop();
        }
        this.setPosition();
        this.mode.show();
    },
    selected: function(item) {
        if ( item.selected || this.selectedMax < this.max) {
            var index = this.findeIndex(this.source, item.id);
            var flag = this.changeSelected(this.source, index);
            this.clear();
            this.loop();
            this.callback && this.callback({
                selected: flag,
                data: item
            });
        } else {
            alert('超过可选数量');
        }
        this.setPosition();
    },
    hide: function (){
        this.open = false;
        this.source.length = 0;
        this.clear();
        this.mode.hide();
    },
    checkOpen: function () {
        return this.open
    },
    serach: function() {

    },
    clear: function () {
        this.ulBox.empty();
    }
}

var Page = function(){
    this.host = document.location.protocol + '//' + document.location.hostname + '/';
    this.hostName = document.location.protocol + '//' + document.location.hostname + '/9yin/';
    this.hostNameAnonymous = document.location.protocol + '//' + document.location.hostname + '/9yin/anonymous/';
    this.pageUrl = document.location.protocol + '//' + document.location.hostname + '/resources/9yin/';
    this.pageData = null;
    this.isOpen = false;
    this.pageParam = {};
    this.modeTpl = {};
    this.init();
};

Page.prototype = {
    init: function(){
        var _self = this;
        //页面加载完成获取HTML模板
        var tplList = document.getElementsByTagName('script');
        for( var i = 0, tempTpl; tempTpl = tplList[i++]; ){
            if( tempTpl.getAttribute('type') === 'template/htmlMode' ){
                var cId = tempTpl.getAttribute('id'),
                    mode = tempTpl.innerHTML.trim();
                _self.modeTpl[ cId ] = mode;
            }
        }
        // 清除servername
        // this.cookie('serverName');
        //顶部快速访问菜单
        this.quickMenu();
    },
    userInfo: null,
    pageHash: null,
    setStyle: function (index, len) {
        var offset = 8;
        var colors = ['#74609F', '#C3538B', '#8C7833', '#725F97', '#C3538B'];
        var str = "background-color:"+ colors[index] + "; right: -"+ ((len || 0)*offset) + "px;";
        return str
    },
    bindEvent: function( elem, event, fn, data ){
        elem.bind( event, function( e ){
            if( e.target.tagName.toLocaleLowerCase() !== 'a' || e.target.target !== '_blank' ){
                e.preventDefault();
                e.stopPropagation();
            }
            fn.call({
                data: data,
                elem: elem,
                event: e
            });
        } );
    },
    queryUser: function( callback, anonymous ){
        var _self = this;
        _self.ajax({
            url: _self.hostName + 'queryUser.do'
        },function( data ){
            var result = data[0];
            if (result.flag) {
                if (anonymous) {
                    location.replace('./goodsPage.html#selling');
                } else {
                    _self.userInfo = result;
                    var useName = $('<em title="'+ result.casId +'">'+ ( result.casId.length < 15 ? result.casId.substring(0, 15) : result.casId ) +'</em><p><span>当前服务器:&nbsp;&nbsp;'+ result.serverName + '</span><a hef="javascript:;">切服</a></p>')
                    $('.user-name').html(useName);
                    $('.logout').bind('click',function(){
                        location.replace( _self.hostName + 'logout.do' );
                    });
                    if ($.isFunction(callback)) {
                        callback.call(_self, result);
                    }
                    _self.changeServerHandler()
                    useName.find('a').bind('click', function(){
                        var _btn = $('.change-server-warp');
                        if (_btn.hasClass('vHide')) {
                            _btn.removeClass('vHide');
                            _self.isOpen = true
                        } else {
                            _btn.addClass('vHide');
                            _self.isOpen = false
                        }
                        return false
                    })
                }
            } else {
                if (anonymous) {
                    callback && callback();
                } else {
                    var url = location.href,
                        returnUrl = encodeURIComponent(url.substring(url.indexOf('9yin/') + 5));
                    document.cookie = "returnUrl=" + returnUrl;
                    document.location.href = _self.host + 'resources/9yin/toServerList.html'
                }
            }
        })
    },
    changeServerHandler: function() {
        var _self = this;
        var newServerId = '';
        var getGameServerHandler = function( parentId, callback ){
            page.ajax( {
                url: page.hostName + 'getGameServer.do',
                ajaxData: {
                    serverId: parentId
                }
            }, function( dataInfo ){
                callback && callback( dataInfo );
            } );
        };
        var serveHandler = (function(){
            var areaData,serversData,con = $('.serveCon'),areaSelected,serverSelected,mode,serviceUrl;
            var fSHow,setServer;
            var oBtn = $('.login-btn').addClass('disabled'),
                serverBlock = $('.server-block').hide();
            oBtn.unbind().bind('click',function(){
                if (oBtn.hasClass('disabled')) {
                    return false
                }
                //切服操作
                _self.ajax( {
                    url: page.hostName + 'changeUserServer.do?p='+serviceUrl
                }, function(data){
                    if (data[0].flag) {
                        _self.cookie('_olts_server_id_', newServerId)
                        $('input,select').val('');
                        location.reload()
                    } else {
                        alert('切换失败，请重试!')
                    }
                })
                return false
            });
            $('body').unbind().bind('click', function(e){
                var event =  $(e.target)
                if (!event.parents('.change-server-warp').get(0) && !event.hasClass('change-server-warp')) {
                    $('.change-server-warp').addClass('vHide')
                    _self.isOpen = false
                }
            });
            $('.cancel-btn').unbind().bind('click', function(){
                $('.change-server-warp').addClass('vHide')
                _self.isOpen = false
            });
            setServer = function(){
                var encryption = '';
                var data = Array.prototype.shift.call( arguments );
                var setLoginUrl = function( data ){
                    encryption = 'gameId=' + data.gameId + '&areaId=' + data.gareaId + '&serverId=' + data.id + '&areaName=' + data.areaName + '&serverName=' + data.serverName;
                    serviceUrl =  codeAbc(encryption);
                    newServerId = data.id
                };
                if ( data.parentId == '' || data.parentId == '0') {
                    setLoginUrl( data )
                } else {
                    getGameServerHandler( data.parentId, function( dataInfo ){
                        setLoginUrl( dataInfo[0].obj );
                    });
                }
            };
            fSHow = function(){
                oBtn.addClass('disabled') && serverBlock.show();
                areaData = this.data;
                serversData = areaData.gameServers;
                elem = this.elem;
                mode = page.modeTpl['serveMode'];
                con.empty();
                elem.addClass('selected') && areaSelected && areaSelected != elem && areaSelected.removeClass('selected');
                areaSelected = elem;
                if( serversData.length < 1 ){
                    con.append( $(mode.format( { serverName: '暂无服务器' } )).addClass('disabled') );
                }else{
                    for( var i = 0, len = serversData.length; i < len; i++ ){
                        var tempData = serversData[i],
                            elem = $( mode.format( tempData ) );
                        (function( elem, area, server ){
                            elem.unbind().bind('click',function(){
                                elem.addClass('selected') && serverSelected && serverSelected != elem  && serverSelected.removeClass('selected');
                                page.cookie( '_olts_defaultServer', server.id );
                                page.cookie( '_olts_defaultArea', server.gareaId );
                                serverSelected = elem;
                                setServer( server );
                                oBtn.removeClass('disabled');
                            });
                        })( elem, areaData, tempData);
                        con.append( elem );
                    }
                    //默认选择第一服
                    con.find('li').first().click();
                }
            }

            return {
                show: fSHow
            }
        })();
        _self.ajax( {
            url: _self.hostName + 'loadServerList.do',
            ajaxData: {
                gameId: '10'
            }
        }, function(){
            var oAreaCon = $('.areaCon').empty();
            _self.setHtmlMode({
                maxNum: 99,
                con: oAreaCon,
                mode: 'areaMode',
                data: _self.pageData[0],
                bindEvent: [
                    { tag: 'li', event: 'click', handler: serveHandler.show  }
                ],
                callback: function(){
                    // $('#areaCon').find('li[data-garea-id="'+ defaultArea +'"]').click();
                }
            });
        })
    },
    topMenuLink: function( _self, callback ){
        //快速菜单执行事件
        $('.menu-list li a').unbind().bind('click',function(){
            if( location.pathname.indexOf( this.pathname ) != -1 ){
                callback && callback( this.href.split('#')[1] )
            }
        });
    },
    //所有异步请求都需要检查是否身份过期
    sessionStatus: function( jqXHR ){
        var sessionstatus = jqXHR.getResponseHeader('sessionstatus'),
            timeoutUrl = jqXHR.getResponseHeader('timeoutUrl');
        if ( sessionstatus === 'logining' ) {
            location.replace( 'goodsPage.html#selling' );
        }else if( sessionstatus === 'error' ){
            location.replace( 'unlogin_error.html' );
        }else if( sessionstatus !== null ){
            var url = location.href,
                returnUrl = encodeURIComponent(url.substring(url.indexOf('9yin/') + 5));
            document.cookie = "returnUrl=" + returnUrl;
            if (timeoutUrl) {
                document.location.href = timeoutUrl + "?u=" + returnUrl
            }
        }
    },
    //通用模板解析器
    setHtmlMode: function(){
        var opts = Array.prototype.shift.call( arguments),
            _self = this,
            data = opts.data || [],
            con = opts.con || [],
            modeId = opts.mode,
            maxNum = data.length > opts.maxNum ? opts.maxNum : data.length,
            pageClick = opts.pageClick || false,
            callback = opts.callback || false,
            pageInfo = opts.pageInfo || {},
            isPagination = opts.pagination || false,
            fixField = opts.fixField || false,
            bindEvent = opts.bindEvent || [],
            pageCon = opts.pageCon,
            elemList = [];
        con.empty(); //清空上次数据
        for( var i = 0; i < maxNum; i++ ){
            var tempData = data[i];
            if( isPagination && pageInfo ){
                tempData.__index_mode = i;
            }
            var modeData = this.modeTpl[modeId];
            for( var j = 0, jLen = fixField.length; j < jLen; j++  ){
                var tempFixField = fixField[j],
                    handler = $.isFunction( tempFixField.handler ) ? tempFixField.handler : _self[tempFixField.handler];
                if( tempFixField.isFixField ){
                    //_self指向Page  当前数据   需要格式化的内容   判断依据
                    tempData[tempFixField.field+'_bak'] = handler.call( _self, tempData, fixField[j], tempFixField.isFixField );
                }else{
                    tempData[tempFixField.field+'_bak'] = handler.call( _self, tempData[ tempFixField.field ], tempData );
                }
            }
            var elem = $( modeData.format( tempData ) );
            for( var n in bindEvent ){
                var tempEvent = bindEvent[n];
                if( elem.find(tempEvent.tag).get(0) ){
                    _self.bindEvent( elem.find(tempEvent.tag), tempEvent.event, tempEvent.handler, tempData );
                }else if( elem[0].tagName.toLocaleLowerCase() == tempEvent.tag ){
                    _self.bindEvent( elem, tempEvent.event, tempEvent.handler, tempData );
                }
            }
            con.append( elem );
            elemList.push( elem.data( 'data', tempData ) );
        }
        if( isPagination ){
            _self.pageList( pageInfo, pageClick, pageCon );
        }
        callback && callback( elemList );
    },
    //绑定数据
    upDataHandler: (function(){
        var fInit,
            fUpData,
            fAllUpData,
            fGetData,
            handlerList = {},
            sourceHandler = function(){
                this.elem = $( Array.prototype.shift.call( arguments ) );
                this.value = Array.prototype.shift.call( arguments );
            };
        sourceHandler.prototype.getValue = function(){
            return this.value;
        };
        sourceHandler.prototype.setValue = function(){
            var value = Array.prototype.shift.call( arguments );
            this.value = value;
            this.elem.val( value ).text( value );
        };

        fInit = function(){
            var elem = Array.prototype.shift.call( arguments ),
                elemList = elem.find('[id]'),
                data = Array.prototype.shift.call( arguments );
            for( var i = 0; i < elemList.length; i++  ){
                var fName = elemList[i].id;
                handlerList[fName] = new sourceHandler( elemList[i], data[fName] );
            }
        };

        fAllUpData = function(){
            var data = Array.prototype.shift.call( arguments );
            for( var n in handlerList ){
                for( var i = 0; i < data.length; i++ ){
                    handlerList[n].setValue( data[i][n] );
                }
            }
        };

        fUpData = function(){
            var data = Array.prototype.shift.call( arguments),
                key = Array.prototype.shift.call( arguments);
            handlerList[key].setValue( data[key] );
        };

        fGetData = function(){
            var key = Array.prototype.shift.call( arguments);
            return handlerList[key].getValue();
        };

        return {
            init: fInit,
            allData : fAllUpData,
            upData : fUpData,
            getData: fGetData
        }
    })(),
    parseHmtlMode: function(options) {
        var defaults = {
            data: [],
            mode: '',
            keys: []
        }
            , opts = $.extend({}, defaults, options)
            , result = [];
        opts.data = $.isArray(opts.data) ? opts.data : [opts.data];
        $.each(opts.data, function(index, curObject) {
            var tempHtml = opts.mode;
            if (!!opts.maximum && index == opts.maximum) {
                return false
            }
            $.each(opts.keys, function(k) {
                tempHtml = tempHtml.replace(new RegExp(opts.keys[k],'i'), curObject[opts.keys[k].slice(2, -2)])
            });
            result.push(tempHtml)
        });
        return result
    },
    pageList : function( options, callback, pageCon ){
        var _self = this,
            defaults = {
                elements: pageCon || $('.page_list'),
                totalPages: 0,
                pageIndex: 0,
                maxLinkCount: 5
            },
            opts = $.extend({}, defaults, options),
            paging = opts.elements,
            totalPages = opts.totalPages,
            pageId = opts.pageId,
            maxLinkCount = opts.maxLinkCount,
            endPage = Math.min(totalPages, Math.max(1, pageId - parseInt(maxLinkCount / 2)) + maxLinkCount - 1),
            startPage = Math.max(1, endPage - maxLinkCount + 1),
            pageNumber = startPage,
            pagingHtml = [];
        if ( totalPages === 1 || !totalPages) {
            paging.hide();
            return false;
        }
        if (pageId != 1) {
            pagingHtml.push('<a class="page_link arrow_r" pageIndex="1" href="javascript:void(0);">首页</a>');
            pagingHtml.push('<a class="page_link arrow_r" pageIndex="' + (pageId - 1) + '" href="javascript:void(0);">上一页</a>');
        }
        for (; pageNumber <= endPage; pageNumber += 1) {
            pagingHtml.push('<a ' + (pageNumber == pageId ? 'class="selected"' : 'class="page_link" pageIndex="' + pageNumber + '"') + ' href="javascript:void(0);">' + pageNumber + '</a>')
        }
        if( totalPages >= maxLinkCount && pageId != totalPages ){
            pagingHtml.push('<span>...</span>');
        }
        if (totalPages != pageId) {
            pagingHtml.push('<a class="page_link arrow_l" pageIndex="' + (pageId + 1) + '" href="javascript:void(0);">下一页</a>');
            pagingHtml.push('<a class="page_link arrow_l" pageIndex="' + totalPages + '" href="javascript:void(0);">尾页</a>')
        }
        pagingHtml.push('<span>共' + totalPages + '页</span>');
        pagingHtml.push('<div class="jump">到第<input type="text" id="jumpto" value="" />页<a class="go_index"></a></div>');
        paging.html(pagingHtml.join('')).show();

        paging.find('a').unbind('click').bind('click', function(event) {
            var target = event.target,
                currentElem = $(target),
                pageNumber = 0;
            if ( currentElem.is('a:not(.selected)') ) {
                pageNumber = currentElem.attr('pageIndex') || paging.find('#jumpto').val();
                if ($.isFunction(callback)) {
                    _self.pageParam.pageIndex = pageNumber;
                    callback && callback();
                }
            }
        }).end().find('input').unbind('keydown').bind('keydown',function(event) {
            if (event.target.id == 'jumpto' && event.which == 13) {
                _self.pageParam.pageIndex = this.value || 1;
                callback && callback();
            }
        })
    },
    formatPrice: function( number, digits) {
        if( number === null ){
            return '0';
        }
        var digits = typeof digits == 'Number' ? digits : 2,
            price = String(number.toFixed( digits )),
            re = /(-?\d+)(\d{3})/;
        if( number > 0 ){
            while (re.test(price)) {
                price = price.replace(re, '$1,$2')
            }
        }else{
            price = '0.00';
        }
        return price
    },
    formatPower: function( number ) {
        var price = String(number),
            re = /(-?\d+)(\d{4})/;
        while (re.test(price)) {
            price = price.replace(re, '$1,$2')
        }
        return price
    },
    formatSilver: function( data, field, isExt ) {
        var _this = this;
        var handler = function( number ){
            var value = _this.formatPrice( number , 0).split(','),
                firstVal = 0,
                unit = ['文', '两', '锭'],
                result = '';
            do {
                firstVal = parseInt(value.shift(), 10);
                result = firstVal ? result.concat(firstVal + unit[value.length] || '') : result
            } while (value.length);
            return result
        }
        if( data && !field && !isExt ){
            return handler( data );
        }else if( data[ isExt.key ] === isExt.value ){
            return handler( data[field.field] );
        }else{
            return data[field.field];
        }
    },
    time: function(expireTime){
        var day = 0, hour = 0, minute = 0, second = 0;
        if(expireTime > 0){
            day = Math.floor(expireTime / (60 * 60 * 24));
            hour = Math.floor(expireTime / (60 * 60)) - (day * 24);
            minute = Math.floor(expireTime / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(expireTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        return [day+'天',hour+'时',minute+'分',second+'秒'].join('');
    },
    countDown: function(expireTime,id, obj, one){
        var fn = arguments.callee;
        if (one) {
            if (!arguments.callee.timer) {
                arguments.callee.timer = {};
            }
            if (id in arguments.callee.timer) {
                clearTimeout(arguments.callee.timer[id])
            } else {
                arguments.callee.timer[id] = null;
            }
        }
        $('#'+id).text(obj.time(expireTime));
        arguments.callee.timer[id] = setTimeout(function(){
            expireTime--;
            fn(expireTime,id, obj)
        },1000);
    },
    formatPowerValue: function( number ){
        var value = this.formatPower( number , 0).split(','),
            firstVal = 0,
            unit = ['万', '亿','兆'],
            result = '';
        do {
            firstVal = parseInt(value.shift(), 10);
            result = firstVal ? result.concat(firstVal + unit[value.length] || '') : result
        } while (value.length);
        return result
    },
    formatItemDesc: function( data, field, isExt ){
        if( data[ isExt.key ] === isExt.value ){
            var Guild = data.guild.split('&'),
                iconPath = data.iconPath == undefined ? data.itemIconPath : data.iconPath,
                rolesDiv = "<div class='reolesDesc'>",
                rolesName = data.itemName || data.itemName,
                rolesIcon = '<img align="right" width="90" style="background-color:#2C281E" height="90" src=' + iconPath + ' alt= ' + rolesName + '>',
                rolesGender = '性别:' + data.gender,
                rolesGrade = '等级:' + (data.gradeName === null ? '' : (/\d+/.test(data.grade) ? (data.gradeName === undefined ? data.grade : data.gradeName) : (data.grade === null ? '' : data.grade))),
                rolesGuild = '门派:' + Guild[0],
                rolesPower = '势力:' + (data.power ? data.power : '无'),
                reolesDesc = rolesDiv + rolesName + '<br />' + rolesGender + '<br />' + rolesGrade + '<br />' + rolesGuild + '<br />' + rolesPower + '<br />' + rolesIcon + '</div>';
            data.itemDesc = reolesDesc;
            // data.itemName = data.sellerRole || data.itemSellerRole
        }
    },
    formatUnitPrice: function( number, data ){
        var price = ( typeof(data.price) == "number" || typeof( data.N_PRICE ) == 'number' ) ?
            ( data.N_PRICE || data.price ) :
            ( data.N_PRICE.replace(/,/gi, '') || data.price.replace(/,/gi, '') );
        if (data.itemType == '2199' || data.S_ITEM_TYPE == '2199' ) {
            var itemAmountUnit = ( ( data.itemAmount || data.N_ITEM_AMOUNT ) / 1000000 );
            var unitPrice = price / itemAmountUnit;
            if (unitPrice < 0.01) {
                return this.formatPrice(unitPrice, 3).split(',') + " 元/锭"
            } else {
                return this.formatPrice(unitPrice, 2).split(',') + " 元/锭"
            }
        } else {
            var itemAmountUnit = ( data.itemAmount || data.N_ITEM_AMOUNT );
            var unitPrice = price / itemAmountUnit;
            if (unitPrice < 0.01) {
                return this.formatPrice(unitPrice, 3).split(',') + " 元"
            } else {
                return this.formatPrice(unitPrice, 2).split(',') + " 元"
            }
        }
    },
    ajax: function( param, callback, loadingHandler ){
        var _self = this;
        var opts = $.extend({}, param );
        var serverId = _self.getCookie('serverId');
        var gameId = _self.getCookie('gameId');
        if( loadingHandler ){
            loadingHandler.begin();
        }else{
            _self.ajaxLoadingBegin();
        }
        if (opts.anonymous) {
            opts.ajaxData = $.extend(true, {
                serverId: serverId,
                gameId: gameId
            }, opts.ajaxData)
        }
        $.ajax({
            type: opts.type || 'get',
            url: opts.url,
            dataType: opts.dataType || 'json',
            data: opts.ajaxData,
            timeout: 120000,
            cache: false,
            success: function( dataAjax, textStatus, jqXHR ) {
                if (!param.anonymous) {
                    _self.sessionStatus( jqXHR );
                }
                if( loadingHandler ){
                    loadingHandler.end();
                }else{
                    _self.ajaxLoadingEnd();
                }
                _self.pageData = dataAjax;
                callback && callback( dataAjax );
            },
            complete: function( jqXHR ){
                _self.sessionStatus( jqXHR, callback );
                //_self.ajaxLoadingEnd();
            },
            error: this.ajaxError
        })
    },
    ajaxError: function(){
        //alert('服务器繁忙,请稍后!');
    },
    ajaxLoadingBegin: function( elem ){
        if( !$('.mark').get(0) ){
            $('body').append( $('<div class="mark loading"><div></div></div>') );
        }
        var mark = $('.mark');
        mark.show();
    },
    ajaxLoadingEnd: function(){
        $('.mark').hide();
    },
    subCatagory: function( callback ){
        var _self = this,
            oCon = $('#goodsMenu'),
            allSub = $('<div class="goods-all">当前选择:<h3>全部分类</h3></div>'),
            muenuItem = '<div class="menu-item"><h3>@{name}</h3><ul></ul></div>',
            itemMode = '<li>@{catagoryDesc}</li>',
            allSubCon = allSub.find('h3'),
            goodsSort = $('.goods-sort'),
            goodsSortTextCon = goodsSort.find('span'),
            goodsSortCon = goodsSort.find('ul'),
            sortMap = {
                '默认排序': 'default',
                '时间': 'D_PUBLICITY_END_DATE',
                '价格': 'N_PRICE',
                '单价': 'unitPrice',
                '等级': 'N_GRADE'
            };

        //排序
        for( var n in sortMap ){
            var sortTemp = $('<li>'+n+'</li>');
            (function( elem, name, key ){
                elem.bind('click',function(){
                    goodsSortCon.find('li').removeClass();
                    var msg;
                    if( !_self.pageParam.sortWay ){
                        _self.pageParam.sortWay = 'asc';
                        elem.addClass('asc');
                    }
                    if( _self.pageParam.sortWay == 'asc' ){
                        msg ='由高到低';
                        _self.pageParam.sortWay = 'desc';
                        elem.addClass('desc');
                    }else if( _self.pageParam.sortWay == 'desc' ){
                        msg ='由低到高';
                        _self.pageParam.sortWay = 'asc';
                        elem.addClass('asc');
                    }
                    _self.pageParam.sortField = key;
                    delete _self.pageParam.pageIndex;
                    if( key == 'default' ){
                        delete _self.pageParam.sortField;
                        delete _self.pageParam.sortWay;
                        msg = '';
                        elem.removeClass('asc desc');
                    }
                    goodsSortTextCon.text( name + msg );
                    goodsSortCon.hide();
                    callback && callback();
                });
            })( sortTemp, n, sortMap[n] );
            goodsSortCon.append( sortTemp );
        };

        goodsSortTextCon.bind('click',function(){
            goodsSortCon.show();
            return false;
        });

        $('body').bind('click',function(){
            goodsSortCon.hide();
        });

        allSub.bind('click',function(){
            allSubCon.text( '全部分类' );
            _self.pageParam.typeNameParam && delete _self.pageParam.typeNameParam;
            _self.pageParam.filterItem && delete _self.pageParam.filterItem;
            delete _self.pageParam.pageIndex;
            callback && callback();
        });
        //加入全部按钮
        oCon.append( allSub );
        _self.ajax({
            url: _self.hostName + 'findAllGoodsSubcatagory.do'
        }, function( data ){
            var data = data[0] || {},
                map = {
                    'role':{name:'角色类',code: '4'},
                    'equip':{name:'装备类',code: '1'},
                    'cheats':{name:'秘籍类',code:'3'},
                    'other':{name:'其他类',code:'9'}
                };
            //filterItem 1 装备类 3秘籍类 4角色类 9其他类
            //typeNameParam
            for( var n in map ){
                var oMenuItem = $( muenuItem.format({ name: map[n].name })),
                    oItemList = oMenuItem.find('ul');
                var tempData = data[n];
                (function( con, subCon, code, name ){
                    con.hover(function(){
                        con.find('h3').addClass('selected');
                        subCon.show();
                    },function(){
                        con.find('h3').removeClass('selected');
                        subCon.hide();
                    }).bind('click',function(){
                        _self.pageParam.typeNameParam && delete _self.pageParam.typeNameParam;
                        _self.pageParam.filterItem = code;
                        allSubCon.text( name );
                        $(this).find('h3').addClass('selected');
                        callback && callback();
                    });
                })( oMenuItem, oItemList, map[n].code, map[n].name );
                for( var j = 0, len = tempData.length; j < len; j++ ){
                    var oItem = $( itemMode.format( tempData[j] ) );
                    (function( elem, data ){
                        if( n == 'role' ){
                            data.typeCode += '&role';
                        }
                        elem.bind('click',function(){
                            _self.pageParam['typeNameParam'] = data.typeCode;
                            delete _self.pageParam.pageIndex;
                            delete  _self.pageParam.filterItem;
                            allSubCon.text( data.catagoryDesc );
                            callback && callback();
                            return false;
                        });
                    })( oItem, tempData[j] );
                    oItemList.append( oItem );
                }
                oCon.append( oMenuItem );
            }
        });
    },
    search: function( callback ){
        var searchCon = $('.search_con'),
            searchInput = searchCon.find('input'),
            searchBtn = searchCon.find('button'),
            setKeywords = function( isSetKeywords ){
                var keywords = $.trim( searchInput.val()),
                    defaultValue = searchInput.attr('defaultValue');
                delete page.pageParam.itemName;
                delete page.pageParam.id;
                if( defaultValue != keywords && keywords ){
                    if( /^\d*$/.test( keywords ) ){
                        page.pageParam.id = keywords;
                    }else{
                        page.pageParam.itemName = keywords;
                    }
                }
                if( !isSetKeywords ){
                    callback && callback();
                }
            };
        searchBtn.bind('click',function(){
            setKeywords();
        });
        searchInput.bind('keydown',function( e ){
            if( e.keyCode === 13 ){
                setKeywords();
            }
        }).bind('change',function(){
            setKeywords( true );
        }).bind('blur',function(){
            var keywords = $.trim( searchInput.val() );
            if( !keywords ){
                searchInput.removeClass('focus').addClass('blur');
            }
        }).bind('focus',function(){
            searchInput.removeClass('blur').addClass('focus');
        });
    },
    //顶部快速访问菜单
    quickMenu: function(){
        var topMenuList = $('.top-menu > ul > li');
        topMenuList.hover( function(){
            $( this).find('ul').show();
        }, function(){
            $( this).find('ul').hide();
        } );
    },
    //获取URL参数
    getUrlParam: function(name, url) {
        var str = url || window.location.search || window.location.hash,
            result = null;
        if (!name || str === '') {
            return result
        }
        result = str.match(new RegExp('(^|&|[\?#])' + name + '=([^&]*)(&|$)'));
        return result === null ? result : decodeURIComponent(result[2])
    },
    //查询支付宝账号
    // 代码修改 如果支付宝被冻结后，选择不绑定支付，需要显示余额账户
    payAccount: function( callback, yueCallback  ) {
        var _self = this;
        _self.ajax({
            url: this.hostName + 'payAccount.do'
        }, function( data ){
            var data = data[0] || {},
                flag = data.flag;
            if (flag === true) {
                callback && callback( data );
            } else {
                _self.bindPayAccount(false, yueCallback);
            }
        });
    },
    //余额账户
    myPayAccount: function(callback) {
        this.ajax({
            url: this.host + 'balance/getAccountForMe.do'
        }, function( data ){
            var data = data || {};
            callback && callback( data )
        })
    },
    //发送验证码
    verifySms: function( callback ){
        this.ajax({
            url: this.hostName + 'realSendMobileSms.do'
        }, function( data ){
            var data = data[0] || {},
                flag = data.flag,
                skip = data.skip,
                mobile = data.mobile || {};
            if (flag === true) {
                callback && callback(mobile);
            } else if (flag === false && skip === true) {
                var mode = $([
                    '<div class="bmp_pop_mark">',
                    '   <div class="bmp_pop" id="payAccountMsg">',
                    '       <h3>提示<i class="bmp_pop_close"></i></h3>',
                    '       <div class="payAccount-msg textCenter">',
                    '           <b>您的帐号未绑定手机，可以点击下面的链接到达相应页面绑定。</b>',
                    '           <br /><span class="red-text">提示：</span>绑定成功后可以在上架或提款时修改支付帐户信息，同时也需要提供手机验证码。绑定的支付帐户必须是真实有效的，否则您可能无法正常提款。</p>',
                    '           <p><a class="red-text" href="http://security.woniu.com/bindmobile/index" target="_blank">http://security.woniu.com/bindmobile/index</a></p>',
                    '       </div>',
                    '       <div class="bmp_pop_footer">',
                    '           <a href="javascript:;" class="red_btn">关闭</a>',
                    '       </div>',
                    '   </div>',
                    '</div>'
                ].join(''));
                $('body').append( mode.show() );
                mode.find('.bmp_pop_close,.red_btn').bind('click',function(){
                    mode.remove();
                });
            } else {
                alert( data.msg || '你没有绑定手机！' );
            }
        })
    },
    //绑定支付宝账号
    bindPayAccount: function( callback, yueCallback ){
        var mode = [
                '<div class="bmp_pop_mark" style="display:block">',
                '    <div class="bmp_pop" id="bindPayAccount">',
                '        <h3>支付宝绑定<i class="bmp_pop_close"></i></h3>',
                '        <div class="bindPayAccountCon">',
                '            <div class="info">',
                '                <p class="title fb">尊敬的九阴玩家：</p>',
                '                <p>为了您在游戏内进行正常的交易，您必须先绑定一个支付宝账户。您所有的交易收益都将直接打到您的支付宝账号上。一个游戏账号只能绑定一个支付宝账号</p>',
                '                <p class="red-text fb">重要提示:</p>',
                '                <p class="red-text">由于支付宝2014年5月27号起，不允许给非实名认证用户转账(非实名认证用户会提款失败)，请您确保您绑定的支付宝账户通过实名认证。请至以下地址确认是否实名认证：<a class="red-text" href="https://certify.alipay.com"  target="_blank">https://certify.alipay.com</a></p>',
                '            </div>',
                '            <ul>',
                '                <li>',
                '                    <label for="accountName">请输入支付宝姓名： </label>',
                '                    <input type="text" name="accountName" id="accountName" maxlength="20" />',
                '                </li>',
                '                <li>',
                '                    <label for="writePayAccount">请输入支付宝账号： </label>',
                '                    <input type="text" name="writePayAccount" id="writePayAccount" maxlength="40" />',
                '                </li>',
                '                <li>',
                '                    <label for="verifyPayAccount">请再次输入支付宝账号：</label>',
                '                    <input type="text" name="verifyPayAccount" id="verifyPayAccount" maxlength="40" />',
                '                </li>',
                '                <li>',
                '                    <label for="verifyCode">请输入手机验证码：</label>',
                '                    <input type="text" name="verifyCode" id="verifyCode" maxlength="6" style="width:60px;"/>',
                '                    <a class="red_btn get_msg_code">获取验证码</a>',
                '                </li>',
                '            </ul>',
                '        </div>',
                '        <div class="bmp_pop_footer">',
                '            <a href="javascript:;" class="red_btn disabled submit_btn">绑定支付宝</a>',
                '            <a href="javascript:;" class="gray_btn cancel_btn">取消</a>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join(''),
            bindPayAccountCon = $( mode),
            oAccountName = bindPayAccountCon.find('[name="accountName"]').empty(),
            owritePayAccount = bindPayAccountCon.find('[name="writePayAccount"]').empty(),
            oVerifyPayAccount = bindPayAccountCon.find('[name="verifyPayAccount"]').empty(),
            oVerifyCode = bindPayAccountCon.find('[name="verifyCode"]').empty(),
            oGetMsgCode = bindPayAccountCon.find('.get_msg_code'),
            oSubmit = bindPayAccountCon.find('.submit_btn'),
            oCancel = bindPayAccountCon.find('.cancel_btn,.bmp_pop_close'),
            isGetTime = true,mobilePhone,
            secTimeHandler,
            tAccountName = '',
            tPayAccount = '',
            time = 120,
            bindPayControl = function( callback ){
                $('body').append( bindPayAccountCon );

                var isAccountName = true;
                var isPayAccount = true;
                var isVerifyPayAccount = true;

                oAccountName.bind('change', function () {
                    isAccountName = false;
                });
                owritePayAccount.bind('change', function () {
                    isPayAccount = false;
                });
                oVerifyPayAccount.bind('change', function () {
                    isVerifyPayAccount = false;
                });

                secTimeHandler = function(){
                    oGetMsgCode.text( time-- + '秒' );
                    setTimeout( function(){
                        if( time < 1 ){
                            isGetTime = true;
                            time = 120;
                            oGetMsgCode.text('获取验证码');
                        }else{
                            secTimeHandler();
                        }
                    }, 1000 );
                };

                oGetMsgCode.bind('click',function(){
                    if( isGetTime ){
                        isGetTime = false;
                        //启动倒计时
                        secTimeHandler();
                        page.verifySms( function( phone ){
                            mobilePhone = phone;
                            //获取验证码成功后打开绑定按钮和状态
                            oSubmit.removeClass('disabled');
                        });
                    }else{
                        alert('稍后可以获取验证码');
                    }
                });

                oCancel.bind('click',function(){
                    bindPayAccountCon.remove();
                    callback && callback();
                    yueCallback && yueCallback();
                });

                oSubmit.bind('click',function(){
                    var _self = $(this),
                        reg = /^\d{6}/,
                        reg1 = /(^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$)|(^1[0-9]{10}$)/,
                        verifyCode = $.trim(oVerifyCode.val()),
                        accountName,
                        writePayAccount,
                        verifyPayAccount;
                    if (isAccountName && isPayAccount && isVerifyPayAccount) {
                        accountName = tAccountName;
                        writePayAccount = tPayAccount;
                        verifyPayAccount = tPayAccount;
                    } else {
                        accountName = $.trim(oAccountName.val());
                        writePayAccount = $.trim(owritePayAccount.val());
                        verifyPayAccount = $.trim(oVerifyPayAccount.val());
                    }

                    if( _self.hasClass('disabled') ){
                        return false;
                    }

                    if( !mobilePhone ){
                        alert('请先获取验证码!');
                        return false;
                    }

                    if (accountName === '' || accountName.indexOf('*') !== -1 || /[^\u4E00-\u9FA5\\·]/g.test(accountName)) {
                        alert('请输入正确的支付宝姓名！');
                        return false
                    }
                    if ( writePayAccount.indexOf('*') !== -1 || !reg1.test(writePayAccount)) {
                        alert('请输入正确的支付宝账号！');
                        return false
                    }
                    if (verifyPayAccount.indexOf('*') !== -1 || writePayAccount === '' || verifyPayAccount === '') {
                        alert('请两次输入要绑定的支付账号！');
                        return false
                    }
                    if (writePayAccount !== verifyPayAccount) {
                        alert('两次输入不一至！');
                        return false
                    }
                    if (!reg.test(verifyCode)) {
                        alert('请输入6位数验证！');
                        return false
                    }

                    _self.addClass('disabled');

                    page.ajax({
                        url: page.hostName + 'bindPayAccount.do',
                        ajaxData: {
                            accountName: accountName,
                            payAccount: verifyPayAccount,
                            mobilePhone: mobilePhone,
                            validateCode: verifyCode
                        }
                    },function( data ){
                        _self.removeClass('disabled');
                        var data = data[0] || {};
                        if (data.flag === true) {
                            bindPayAccountCon.remove();
                            alert( '绑定支付账号成功！' );
                            if( callback ){
                                callback( data );
                            }else{
                                location.reload();
                            }
                        } else {
                            alert( data.msg || '绑定支付账号失败！' );
                            oVerifyCode.val('').focus();
                        }
                    })
                });
            };
        if( !callback ){
            bindPayControl( );
        }else{
            this.payAccount( function( data ){
                var account = data.account;
                tAccountName = account.sellerName;
                tPayAccount = account.payAccount;
                if (account.sellerName) {
                    account.sellerName = '*'+account.sellerName.substring(1)
                }
                if (account.payAccount) {
                    var payAccount = account.payAccount;
                    account.payAccount = payAccount.substring(0, 3) +'***'+payAccount.substring(payAccount.length-4);
                }
                if( data.flag ){
                    oAccountName.val( account.sellerName );
                    owritePayAccount.val( account.payAccount );
                    oVerifyPayAccount.val( account.payAccount );
                }
                bindPayControl();
            })
        }
    },
    getCookie: function(c_name) {
        if (document.cookie.length > 0) {
            if ( c_name ){
                var c_start = document.cookie.indexOf(c_name + "="),
                    c_end = '';
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    c_end = document.cookie.indexOf(";", c_start)
                }
                if (c_end == -1) {
                    c_end = document.cookie.length
                }
                return unescape(document.cookie.substring(c_start, c_end))
            }else{
                var cookies = document.cookie.split('; ');
                cookies = (function ( arr ) {
                    var tempCookies = {};
                    for( var i = 0, len = arr.length; i < len; i++ ){
                        var temp = arr[i].split('=');
                        tempCookies[temp[0]] = temp[1];
                    }
                    return tempCookies;
                })( cookies );
                return cookies;
            }
        }
        return ''
    },
    cookie: function( c_name, value, time ) {
        var exp = new Date();
        var addTime = -7;
        if (time) {
            addTime = -time
        } else if( !value ){
            addTime = 1;
        }
        exp.setDate( exp.getDate() - addTime );
        if( value ){
            document.cookie = c_name + "=" + escape(value) + ";expires=" + exp.toGMTString()
        }else{
            var cval = this.getCookie(c_name);
            if (cval != null) {
                document.cookie = c_name + "=" + escape(cval) + ";expires=" + exp.toGMTString()
            }
        }
    },
    openWeb: function( url, isScrolling ){
        var mode = [
                '<div class="bmp_pop_mark">',
                '   <div class="bmp_pop" id="openWeb">',
                '       <h3><i class="bmp_pop_close"></i></h3>',
                '       <div class="iframe">',
                '          <iframe src="'+ url +'" marginwidth="0" framespacing="0" marginheight="0" frameborder="0" scrolling="'+ (isScrolling || 'no') +'" allowtransparency="true" width="100%" height="496px"></iframe>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join(''),
            con = $( mode),
            oCloseBtn = con.find('.bmp_pop_close');
        $('body').append( con );
        con.show();
        oCloseBtn.bind('click',function(){
            con.remove();
        });
    },
    myBrowser: function(){
        var browser= navigator.appName;
        var b_version= navigator.appVersion;
        var version= b_version.split(";");
        if( version.length > 1 ){
            var trim_Version= version[1].replace(/[ ]/g,"");
            if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0"){
                return 'IE6';
            }else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0"){
                return 'IE7';
            }else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0"){
                return 'IE8';
            }else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0"){
                return 'IE9';
            }else{
                return 'false';
            }
        }else{
            return 'false';
        }
    },
    randomImg: function(){
        var imgList = ['emei.png','gaibang.png','jilei.png','jinyiwei.png','junzi.png','shaolin.png','tangmen.png','wudang.png'];
        return 'images/renwu/'+ imgList[ parseInt( Math.random() * 8 ) ];
    },
    rechargeCash: function( callback ){
        var init = function(){
            var mode = $([
                    '<div class="bmp_pop_mark" style="display:block">',
                    '   <div class="bmp_pop" id="changeMoney">',
                    '       <h3>余额充值<span class="red-text">当天充值金额，需5天后才可提现。</span><i class="bmp_pop_close"></i></h3>',
                    '       <div class="good-up-input"><ul class="rechargeList"></ul>',
                    '           <p><input name="changeMoney" maxlength="6" placeholder="请输入金额" type="text" value="" />&nbsp;&nbsp;&nbsp;注：输入金额为1-10000的整数</p>',
                    '       </div>',
                    '       <div class="bmp_pop_footer">',
                    '           <a href="javascript:;" class="red_btn recharge_cash">确定</a>',
                    '       </div>',
                    '   </div>',
                    '</div>'
                ].join('')),
                listMode = '<li>@{price}</li>',
                moneyList = [10,30,50,100,300,500,1000,3000],
                curItem = null,
                curMoney = 10,
                minMoney = 1,
                con = $( mode ),
                rechargeCashBtn = con.find('.recharge_cash'),
                rechargeItemList = con.find('.good-up-input ul'),
                changeMoney = con.find('input[name="changeMoney"]'),
                closeBtn = con.find('.bmp_pop_close');
            $('body').append( con );
            for( var i = 0, len = moneyList.length; i < len; i+=1 ){
                var tempObj = $( listMode.format({price: moneyList[i]}) );
                if( i === 0 ){
                    tempObj.addClass('selected');
                    curItem = tempObj;
                }
                (function( elem, data ){
                    elem.bind('click',function(){
                        if( !elem.hasClass('selected') ){
                            curItem && curItem.removeClass('selected');
                            elem.addClass('selected');
                            curMoney = data;
                            curItem = elem;
                        }
                    });
                })( tempObj, moneyList[i] );
                rechargeItemList.append( tempObj );
            }
            closeBtn.bind('click',function(){
                con.remove();
                callback && callback();
            });

            changeMoney.bind('keypress',function ( event ){
                if( !( event.keyCode>=48 && event.keyCode<=57 ) ){
                    return false;
                }
            });

            changeMoney.bind('blur',function(){
                var _this = $(this),
                    value = parseInt( $.trim( _this.val() ) );
                if( /^\d+$/.test( value ) && Number( value ) > 0 && Number( value ) <= 10000 ){
                    curItem && curItem.removeClass('selected');
                    curItem = null;
                    curMoney = parseInt( value );
                    _this.val( curMoney ).parent().removeClass('error_text');
                }else{
                    _this.parent().addClass('error_text');
                    curItem && curItem.removeClass('selected');
                    curItem = null;
                    curMoney = false;
                }
            });

            rechargeCashBtn.bind('click',function(){
                var ajaxData = {};
                if( rechargeCashBtn.hasClass('disabled') ){
                    return false;
                }
                if ( !/^\d+$/.test( curMoney ) || curMoney < minMoney ) {
                    return false
                }
                if( curMoney > 10000 ){
                    return false
                }
                ajaxData.amount = curMoney;
                rechargeCashBtn.addClass('disabled');
                var html = [
                    '<p class="textCenter">当前登录的账号是【<span class="red-text">'+ page.userInfo.casId +'</span>】:&nbsp;选择的充值金额是【<span class="red-text">'+ curMoney +'</span>】元。'+'</p>',
                    '<p class="textCenter">点击确认，继续充值。</p>'
                ].join('');
                con.hide();
                page.submitOrderConfirm( html, function(){
                    page.ajax({
                        url: page.hostName + 'saveBlanceOrder.do',
                        ajaxData: ajaxData
                    }, function( data ){
                        var data = data[0] || {};
                        if ( data.flag ) {
                            rechargeCashBtn.removeClass('disabled');
                            location.href = page.hostName + 'blanceOrderAlipaySubmit.do?orderNo='+data.orderNo+'&service='+location.href ;
                        } else {
                            alert( data.msg )
                        }
                    });
                }, function(){
                    con.show();
                    rechargeCashBtn.removeClass('disabled');
                });
            });
        };
        page.myPayAccount( function( myPayInfoData ){
            if( !myPayInfoData[0].flag ){
                alert('该账号暂时无法充值，请联系客服!');
                callback && callback();
            }else{
                page.ajax({
                    url: page.host + 'balance/getPayPasswordState.do'
                }, function( data ){
                    if( data[0].mscode != '1' ){
                        alert('该账号暂时无法充值，请联系客服!');
                        callback && callback();
                    }else{
                        init();
                    }
                });
            }
        } );
    },
    submitOrderConfirm: function( html, callback, cancelCallback, title ){
        var mode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '   <div class="bmp_pop" id="unlock">',
                '       <h3>'+ ( title || '请您确认' ) +'<i class="bmp_pop_close"></i></h3>',
                '       <div class="good-up-input">',
                html,
                '       </div>',
                '       <div class="bmp_pop_footer">',
                '           <a href="javascript:;" class="disabled submit_btn">3</a>',
                '           <a href="javascript:;" class="gray_btn cancel_btn">取消</a>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            oSubmit = mode.find('.submit_btn'),
            num = 3,
            loopTime = function( oBtn ){
                var mySelf = arguments.callee;
                --num;
                oBtn.text( '确定('+num +')' );
                if( num > 0  ){
                    setTimeout(function(){
                        mySelf( oBtn );
                    },1000);
                }else{
                    oBtn.removeClass('disabled').addClass('red_btn').text('确定');
                }
            };
        $('body').append( mode );
        loopTime( oSubmit );
        oSubmit.bind('click',function(){
            if( $(this).hasClass('disabled') ){
                return false;
            }
            mode.remove();
            callback && callback();
        });
        mode.find('.cancel_btn,.bmp_pop_close').bind('click',function(){
            mode.remove();
            cancelCallback && cancelCallback();
        });
    },
    msgHandler : function ( msg, callback ) {
        var confirmMode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '   <div class="bmp_pop" id="confirm">',
                '       <h3>提示<i class="bmp_pop_close"></i></h3>',
                '       <div class="good-up-input">',
                '           <p class="textCenter">'+ msg +'</p>',
                '       </div>',
                '       <div class="bmp_pop_footer">',
                '           <a href="javascript:;" class="red_btn submit_btn">确定</a>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            oSubmitBtn = confirmMode.find('.submit_btn,.bmp_pop_close');
        $('body').append( confirmMode );
        oSubmitBtn.bind('click',function () {
            confirmMode.remove();
            callback && callback();
        });
    },
    confirmHandler : function( msg, callback, cancelCallback, elems ){
        var confirmMode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '   <div class="bmp_pop" id="confirm">',
                '       <h3>提示<i class="bmp_pop_close"></i></h3>',
                '       <div class="good-up-input">',
                '           <p class="textCenter">'+ msg +'</p>',
                '       </div>',
                '       <div class="bmp_pop_footer">',
                '           <a href="javascript:;" class="red_btn submit_btn">确定</a>',
                '           <a href="javascript:;" class="gray_btn cancel_btn">取消</a>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            oSubmitBtn = confirmMode.find('.submit_btn'),
            oCancelBtn = confirmMode.find('.cancel_btn,.bmp_pop_close');
        $('body').append( confirmMode );
        oSubmitBtn.bind('click',function () {
            if (elems) {
                var data = {};
                for (var i=0,len=elems.length; i<len; i++) {
                    var tempElem = $(elems[i]),
                        inputName = tempElem.attr('name');
                    data[inputName] = tempElem.val();
                }
            }
            confirmMode.remove();
            callback && callback(data);
        });
        oCancelBtn.bind('click',function () {
            confirmMode.remove();
            cancelCallback && cancelCallback();
        })
    },
    setAskHandler : function( isReset, callback, cancelCallback ){
        var askList = [],
            mode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '   <div class="bmp_pop" id="askPop">',
                '       <h3>设置余额问题<i class="bmp_pop_close"></i></h3>',
                '       <div class="good-up-input">',
                '           <ul class="ask_list">',
                '               <li><label>设置问题一</label><input type="text" value="请选择问题" readonly="readonly" class="select" id="ask01" /><input type="text" class="inputName" placeholder="请填中英文或者数字" name="ask01" maxlength="20" value="" /></li>',
                '               <li><label>设置问题二</label><input type="text" value="请选择问题" readonly="readonly" class="select" id="ask02" /><input type="text" class="inputName" placeholder="请填中英文或者数字" name="ask02" maxlength="20" value="" /></li>',
                '               <li><label>设置问题三</label><input type="text" value="请选择问题" readonly="readonly" class="select" id="ask03" /><input type="text" class="inputName" placeholder="请填中英文或者数字" name="ask03" maxlength="20" value="" /></li>',
                '               <li class="textLeft"><label>手机验证码</label><input type="text" name="smsInput" placeholder="验证码" maxlength="6" style="width:60px;"/><a class="btn red_btn get_msg_code">获取验证码</a></li>',
                '           </ul>',
                '       </div>',
                '       <div class="bmp_pop_footer">',
                '           <a href="javascript:;" class="red_btn submit_btn">确定</a>',
                '           <a href="javascript:;" class="gray_btn cancel_btn">取消</a>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            optionMode = $([
                '<div class="select-con"><ul></ul></div>'
            ].join('')),
            oSubmit = mode.find('.submit_btn'),
            oCancel = mode.find('.cancel_btn,.bmp_pop_close'),
            oAskList = mode.find('.select'),
            oAnsList = mode.find('.inputName'),
            oGetMsgBtn = mode.find('.get_msg_code'),
            isGetTime = true,time = 120,mobilePhone= null,reg = /^\d{6}/,
            bindSelectHandler = (function(){
                var disabledHandler,
                    changeMapHandler,
                    getFlag,
                    mapAsk = {'ask01':'','ask02':'','ask03':''},
                    mapAns = {'ask01':'','ask02':'','ask03':''},


                    changeMapHandler = function( type, name, value ){
                        if( type === 'select' ){
                            mapAsk[name] = value;
                        }else{
                            mapAns[name] = value;
                        }
                    };

                getFlag = function(){
                    var flag = false;
                    for( var n in mapAsk ){
                        if( mapAsk[n] != '' && mapAns[n] != '' ){
                            flag = true;
                        }else{
                            flag = false;
                            break;
                        }
                    }
                    return flag;
                };

                disabledHandler = function(){
                    optionMode.find('li').show();
                    for( var n in mapAsk ){
                        if( mapAsk[n] !== '' ){
                            optionMode.find('[data-id="'+ mapAsk[n] +'"]').hide();
                        }
                    }
                };

                return {
                    disabled: disabledHandler,
                    changeMap: changeMapHandler,
                    dataAsk: mapAsk,
                    dataAns: mapAns,
                    flag: getFlag
                }
            })(),
            secTimeHandler = function(){
                oGetMsgBtn.text( time-- + '秒' );
                setTimeout( function(){
                    if( time < 1 ){
                        isGetTime = true;
                        time = 120;
                        oGetMsgBtn.text('获取验证码');
                    }else{
                        secTimeHandler();
                    }
                }, 1000 );
            },
            oSelectList = {elem: null,name: null},
            init = function(){
                for( var i = 0, len = askList.length; i < len; i++ ){
                    var list = $('<li data-id="@{id}">@{question}</li>'.format( askList[i] ));
                    optionMode.find('ul').append( list );
                    (function( elem, data ){
                        elem.bind('click',function(){
                            var value = data.id;
                            oSelectList.elem.val( data.question );
                            oSelectList.elem.removeClass('open');
                            bindSelectHandler.changeMap( 'select', oSelectList.name, value );
                            bindSelectHandler.disabled();
                        })
                    })( list, askList[i] );
                };
                $('body').append( optionMode );
                $('body').append( mode ).bind('click',function(){
                    optionMode.hide();
                    oSelectList.elem && oSelectList.elem.removeClass('open');
                });
                mode.show();
                oAskList.bind('click',function(){
                    var _this = $(this),
                        pos = _this.offset(),
                        w = _this.outerHeight() - 1;
                    if( _this.hasClass('open') ){
                        oSelectList.elem && oSelectList.elem.removeClass('open');
                        _this.removeClass('open');
                        optionMode.hide();
                    }else{
                        oSelectList.elem && oSelectList.elem.removeClass('open');
                        _this.addClass('open');
                        optionMode.css({
                            top: pos.top + w - $(document).scrollTop(),
                            left: pos.left
                        }).show();
                        oSelectList.elem = _this;
                        oSelectList.name = this.id;
                    }
                    return false;
                });
                oGetMsgBtn.bind('click',function(){
                    if( isGetTime ){
                        isGetTime = false;
                        //启动倒计时
                        secTimeHandler();
                        page.verifySms( function( mobile ){
                            mobilePhone = mobile;
                        });
                    }else{
                        alert('稍后可以获取验证码');
                    }
                });
                //绑定INPUT输入框
                oAnsList.not( oAnsList.eq(3) ).bind('blur',function(){
                    var _this = $(this),
                        value = $.trim( this.value ),
                        reg = /^[a-zA-Z0-9\u4e00-\u9fa5\.\-]+$/g,
                        name =  this.name;
                    reg.lastIndex = 0;
                    if( value != '' && reg.test( value ) ){
                        bindSelectHandler.changeMap('input', name, encodeURIComponent( value ) );
                    }else{
                        _this.val('请填中英文或者数字!').addClass('inputError');
                        bindSelectHandler.changeMap('input', name, '' );
                    }
                }).bind('focus',function(){
                    var value = $.trim( this.value);
                    if( value == '请填中英文或者数字!' ){
                        $(this).val('').removeClass('inputError');
                    }
                });
                //取消窗口
                oCancel.bind('click',function(){
                    optionMode && optionMode.hide();
                    if( isReset ){
                        mode.remove();
                        cancelCallback && cancelCallback();
                    }else{
                        if( confirm('如不设置安全问题，无法进行余额支付?') ){
                            mode.remove();
                            cancelCallback && cancelCallback();
                        }
                    }
                });
                //确定提交
                oSubmit.bind('click',function(){
                    var validateCode = $.trim( $('input[name="smsInput"]').val() );
                    if( oSubmit.hasClass('disabled') ) {
                        return false;
                    }
                    if( !bindSelectHandler.flag() ){
                        alert('请设置好数据!');
                        return false;
                    }
                    if( !mobilePhone ){
                        alert('请先获取验证码!');
                        return false;
                    }
                    if (!reg.test(validateCode)) {
                        alert('请输入6位数验证！');
                        return false
                    }
                    oSubmit.addClass('disabled');
                    var dataAsk = bindSelectHandler.dataAsk,
                        dataAns = bindSelectHandler.dataAns,
                        ajaxData = {
                            question_id_1: dataAsk.ask01,
                            question_id_2: dataAsk.ask02,
                            question_id_3: dataAsk.ask03,
                            answer_1: dataAns.ask01,
                            answer_2: dataAns.ask02,
                            answer_3: dataAns.ask03,
                            validateCode:validateCode,
                            mobilePhone: mobilePhone
                        };

                    page.ajax({
                        url: page.host + 'balance/setQuestions.do',
                        type: 'post',
                        ajaxData: ajaxData
                    }, function( data ){
                        oSubmit.removeClass('disabled');
                        if( data[0].flag ){
                            alert('问题设置成功!');
                            mode.remove();
                            callback && callback();
                        }else{
                            alert( data[0].msg );
                        }
                    });
                });
            };
        page.ajax({
            url: page.host + 'balance/allQuestions.do'
        }, function( data ){
            if( data[0].flag ){
                for( var i = 0, len = data[0].data.length; i < len; i++ ){
                    askList.push( data[0].data[i] );
                }
                init();
            }else{
                alert('获取问题失败，请稍后再试!');
                cancelCallback && cancelCallback();
            }
        });
    },
    getQuestionHandler: function( elem ){
        var _this = this;
        if( _this.hasClass('disabled') ){
            return false;
        }
        _this.addClass('disabled');
        page.ajax({
            url: page.host + 'balance/getVerifyQuestion.do'
        }, function( data ){
            _this.removeClass('disabled');
            if( data[0].flag ){
                elem.html( data[0].question );
            }else{
                alert('请重试!');
            }
        });
    },
    onVisibilityChange: function ( page, callback ) {
        var _this = this, oldCookie = _this.getCookie('_olts_server_id_'), oldUserName = _this.getCookie('snailPassport'), timer = null,
            checkUserHandler = function () {
                var newServerId = _this.getCookie('_olts_server_id_');
                var newUserName = _this.getCookie('snailPassport');
                if ( newServerId !== oldCookie ||  newUserName !== oldUserName) {
                    oldCookie = newServerId;
                    oldUserName = newUserName;
                    return true
                } else {
                    return false
                }
            },
            changeHandler = function ( ) {
                timer && clearTimeout(timer)
                if( !_this.isOpen && checkUserHandler() ){
                    callback && callback();
                    $('input,select').val('');
                }
                timer = setTimeout( function () {
                    changeHandler();
                }, 1500 );
            };
        changeHandler();
    },
    submitAllowNegotiateHanlder: function(elem, item){
        // 隐藏界面
        elem.hide();
        page.getMsgHanlder(function(mobilePhone, sVerifyCode, msgCodeMode){
            page.ajax({
                url: page.hostName + 'acceptNegotiate.do',
                type: 'post',
                ajaxData: {
                    itemId: item.itemId,
                    negotiateId: item.id,
                    mobilePhone: mobilePhone,
                    validateCode: sVerifyCode
                }
            }, function( data ){
                if (data[0].flag) {
                    msgCodeMode.remove();
                    page.msgHandler(data[0].msg || '确认成功！', function(){
                        location.reload();
                    });
                } else {
                    page.msgHandler(data[0].msg || '确认失败，请重试！');
                }
            })
        }, function() {
            elem.show();
        }, '同意议价');
    },
    getMsgHanlder: function(callback, cancelCallback, title){
        var mode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '    <div class="bmp_pop" id="getMsgCode">',
                '        <h3>'+ ( title || "获取验证码" ) +'<i class="bmp_pop_close"></i></h3>',
                '        <div class="good-up-input">',
                '              <ul>',
                '                <li class="textCenter">',
                '                    <label for="verifyCode">请输入手机验证码：</label>',
                '                    <input type="text" name="verifyCode" id="verifyCode" maxlength="6" style="width:60px;"/>',
                '                    <a class="red_btn get_msg_code">获取验证码</a>',
                '                </li>',
                '            </ul>',
                '        </div>',
                '        <div class="bmp_pop_footer">',
                '            <a href="javascript:;" class="red_btn submit_btn">确定</a>',
                '            <a href="javascript:;" class="gray_btn cancel_btn">取消</a>',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('')),
            time = 120,
            isGetTime = true,
            mobilePhone= '',
            oVerifyCode = mode.find('[name="verifyCode"]'),
            oGetMsgCode =mode.find('.get_msg_code'),
            oSubmitBtn = mode.find('.submit_btn'),
            oCancelBtn = mode.find('.cancel_btn, .bmp_pop_close'),
            secTimeHandler = function(){
                oGetMsgCode.text( time-- + '秒' );
                setTimeout( function(){
                    if( time < 1 ){
                        isGetTime = true;
                        time = 120;
                        oGetMsgCode.text('获取验证码');
                    }else{
                        secTimeHandler();
                    }
                }, 1000 );
            };

        // 显示验证码界面
        $('body').append(mode);
        mode.show();

        oGetMsgCode.bind('click',function(){
            if( isGetTime ){
                isGetTime = false;
                //启动倒计时
                secTimeHandler();
                page.verifySms( function( phone ){
                    mobilePhone = phone;
                    //获取验证码成功后打开绑定按钮和状态
                    oSubmitBtn.removeClass('disabled');
                });
            }else{
                alert('稍后可以获取验证码');
            }
        });

        oSubmitBtn.bind('click', function(){
            var sVerifyCode = $.trim( oVerifyCode.val() );
            if (mobilePhone && sVerifyCode) {
                callback && callback(mobilePhone, sVerifyCode, mode);
            } else {
                alert('请先获取验证码！');
            }
        });

        oCancelBtn.bind('click', function(){
            mode.remove();
            cancelCallback && cancelCallback();
        });
    },
    allowNegotiateHanlder: function (itemData) {
        var mode = $([
                '<div class="bmp_pop_mark" style="display:block">',
                '   <div class="bmp_pop" id="unlock">',
                '       <h3>议价信息<i class="bmp_pop_close"></i></h3>',
                '       <div class="good-up-input">',
                '           <table>',
                '            </table>',
                '       </div>',
                '       <div class="bmp_pop_footer">',
                '           <a href="javascript:;" class="gray_btn cancel_btn">关闭</a>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('')),
            itemAmount = itemData.N_ITEM_AMOUNT || itemData.itemAmount,
            itemType = itemData.S_ITEM_TYPE || itemData.itemType,
            itemAmountUnit = itemType == '2199' ? itemAmount / 1000000 : itemAmount,
            oCon = mode.find('.good-up-input table'),
            contentMode = '<tr><td>玩家已支付<span class="red-text">@{negotiatePrice}</span>全额押金，希望以此价格完成交易。</td><td><a href="javascript:;">确定</a></td></tr>';
        page.ajax({
            url: page.hostName + 'sellersNegotiate.do',
            ajaxData: {
                itemId: itemData.N_ID || itemData.id
            }
        }, function( data ){
            if (data[0].flag) {
                var data = data[0].data || [];
                if (data.length) {
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        item.unitPrice = (item.negotiatePrice / itemAmountUnit).toFixed(2);
                        item.negotiatePrice = item.negotiatePrice.toFixed(2);
                        var itemMode = $(contentMode.format(item));
                        oCon.append(itemMode);
                        (function(elem, data){
                            elem.bind('click', function(){
                                data.itemId = itemData.N_ID || itemData.id;
                                page.submitAllowNegotiateHanlder(mode, data);
                            });
                        })(itemMode.find('a'), item);
                    }
                    var top = mode.find('.bmp_pop').outerHeight(true) / 2
                    mode.find('.bmp_pop').css('margin-top', -top );
                } else {
                    oCon.append('<p class="textCenter">暂无议价</p>')
                }
            }
        });
        $('body').append( mode );
        mode.find('.cancel_btn,.bmp_pop_close').bind('click',function(){
            mode.remove();
        });
    },
    selectHandler: selectHandler,
    anonymousUserInfo: function () {
        var _self = this;
        _self.queryUser(function(){
            var serverName = _self.getCookie('serverName'),
                useName = $('<em>游客登录</em><p><span>当前服务器:&nbsp;&nbsp;'+ serverName + '</span></p>');
            $('.user-name').html(useName);
            $('.logout').bind('click',function(){
                location.replace( _self.hostName + 'logout.do' );
            });
        }, true);
    },
    anonymousLogin: function (msg, cancel, locationUrl){
        var _this = this;
        this.confirmHandler(msg, function() {
            var URI = _this.hostName + 'logout.do';
            if (locationUrl) {
                URI = _this.pageUrl + 'toServerList.html?' + locationUrl;
            }
            location.replace( URI );
        }, function () {
            cancel && cancel()
        })
    }
}

$( function(){
    var page = new Page();
    var browserVersion = page.myBrowser();
    if ( browserVersion.indexOf('IE') != -1 ) {
        $('input').each( function(){
            var _this = $(this),
                defaultValue = _this.attr('defaultValue');
            _this.val( defaultValue ).addClass('placeholder');
        }).focus(function(){//默认文字消失
            var _this = $(this),
                defaultValue = _this.attr('defaultValue');
            if( _this.val() == defaultValue ){
                _this.val('').removeClass('placeholder');
            }
        }).blur(function(){//默认文字出现
            var _this = $(this),
                defaultValue = _this.attr('defaultValue');
            if( _this.val()== ''){
                _this.val( defaultValue).addClass('placeholder');
            }
        });
    }
    if( ( browserVersion == 'IE6' || browserVersion == 'IE7' ) && !$('#smallRole').get(0) ){
        $('body').append( $('<div class="ieTips">为了提供更好的体验效果，请升级您的浏览器!</div>') );
    }
});