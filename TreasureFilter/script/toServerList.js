$(function(){
    var page = new Page();
    var URI = page.getUrlParam('URI');
    var defaultArea = page.getCookie('_olts_defaultArea') || 1; //默认选择大区
    var defaultServer = page.getCookie('_olts_defaultServer'); //默认选择服务器
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
    var anonymousHanlder = function (serviceUrl) {
        var serverId = page.getUrlParam('serverId', serviceUrl);
        var gameId = page.getUrlParam('gameId', serviceUrl);
        var serverName = page.getUrlParam('serverName', serviceUrl);
        page.ajax( {
            url: page.hostNameAnonymous + 'checkServer.do?p='+ codeAbc( serviceUrl )
        }, function(data){
            if (data[0].flag) {
                page.cookie('gameId', gameId);
                page.cookie('anonymous', true);
                page.cookie('serverId', serverId);
                page.cookie('serverName', serverName);
                location.href = 'anonymousPage.html#selling';
            } else {
                alert('切换失败，请重试!')
            }
        })
    };
    var serveHandler = (function(){
        var areaData,serversData,con = $('#serveCon'),areaSelected,serverSelected,mode,serviceUrl;
        var fSHow,setServer;
        var anonymousUrl = '';
        var oBtn = $('.login-btn').hide(),
            anonymous = $('.anonymous-btn').hide(),
            serverBlock = $('.server-block').hide();
        oBtn.bind('click',function(){
            // 移除匿名登录信息
            page.cookie('gameId');
            page.cookie('serverId');
            page.cookie('anonymous');
            page.cookie('serverName');
            //调用SSO登录
            ssoSubmit( serviceUrl );
        });

        anonymous.bind('click', function(){
            anonymousHanlder(anonymousUrl);
        });

        setServer = function(){
            var loginUrl = 'http://jishi.woniu.com/acc/login.do?p=', encryption = '';
            var data = Array.prototype.shift.call( arguments );
            var setLoginUrl = function( data ){
                encryption = 'gameId=' + data.gameId + '&areaId=' + data.gareaId + '&serverId=' + data.id + '&ip=' + data.serverIp + '&areaName=' + data.areaName + '&serverName=' + data.serverName + '&indexUrl=';
                anonymousUrl = 'gameId=' + data.gameId + '&areaId=' + data.gareaId + '&serverId=' + data.id + '&areaName=' + data.areaName + '&serverName=' + data.serverName;
                if (URI) {
                    var returnUrl = page.getUrlParam("a", URI).replace(/-/g, '&');
                    if (returnUrl.indexOf('unsizedShel') > -1 || returnUrl.indexOf('auction') > -1) {
                        encryption = encryption + encodeURIComponent( returnUrl );
                    }
                }
                serviceUrl = loginUrl + codeAbc(encryption);
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
            oBtn.hide() && anonymous.hide() && serverBlock.show();
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
                        elem.bind('click',function(){
                            elem.addClass('selected') && serverSelected && serverSelected != elem  && serverSelected.removeClass('selected');
                            page.cookie( '_olts_defaultServer', server.id );
                            page.cookie( '_olts_defaultArea', server.gareaId );
                            serverSelected = elem;
                            setServer( server );
                            oBtn.show() && anonymous.show();
                        });
                    })( elem, areaData, tempData);
                    con.append( elem );
                }
                if( defaultServer && con.find('li[data-server-id="'+ defaultServer +'"]').get(0) ){
                    //默认上次登入的服
                    con.find('li[data-server-id="'+ defaultServer +'"]').click();
                }else{
                    //默认选择第一服
                    con.find('li').first().click();
                }
            }
        }

        return {
            show: fSHow
        }
    })();
    //游戏内嵌页面跳转过来的特殊处理
    var fromGameHandler = function(){
        URI = URI.replace(/_/g,'#').replace(/\|/g,'&');
        var smailBox = page.getUrlParam("smallBox", URI) || false,
            smailServerId = page.getUrlParam("serverId", URI),
            returnUrl = page.getUrlParam("a", URI).replace(/-/g, '&');
        page.cookie( 'smailBox', 'true' );
        page.cookie( 'returnUrl', returnUrl );
        getGameServerHandler( smailServerId, function( data ){
            var data = data[0] || {};
            if( data.flag ){
                $('#areaCon').find('li[data-garea-id="'+ data.obj.gareaId +'"]').click();
                setTimeout( function(){
                    $('#serveCon').find('li[data-server-id="'+ data.obj.id +'"]').click();
                }, 7 );
            }
        } )
    };

    //判断是否已经登录，如果已经登录直接跳转到物品页面
    page.ajax({
        url: page.hostName + 'toServerList.do'
    }, function(){
        page.ajax( {
            url: page.hostName + 'loadServerList.do',
            ajaxData: {
                gameId: '10'
            }
        }, function( ){
            var oAreaCon = $('#areaCon').empty();
            page.setHtmlMode({
                maxNum: 99,
                con: oAreaCon,
                mode: 'areaMode',
                data: page.pageData[0],
                bindEvent: [
                    { tag: 'li', event: 'click', handler: serveHandler.show  }
                ],
                callback: function(){
                    //如果是从游戏里面进入需要做特殊处理
                    if( URI ){
                        fromGameHandler();
                    }else{
                        $('#areaCon').find('li[data-garea-id="'+ defaultArea +'"]').click();
                    }
                }
            });
        })
    });
});
