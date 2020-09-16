var selectedServer = {areaId: '',
                      serverId:''
}
$(document).ready(function(){
    $.ajax({
        url: "../data/serverList.json", //json文件位置
        type: "GET", //请求方式为get
        dataType: "json", //返回数据格式为json
        success: function(data) { //请求成功完成后要执行的方法
            console.log("游戏区服数据加载成功!")
            callback(data);
        }
    })
    function callback(data){
        $.each(data,function(index,obj){
            var gameArea = {gareaId: obj['gareaId'], gareaName: obj['gareaName']};
            var liArea = template("areaMode", gameArea);
            $('#areaCon').append(liArea);
        });

        $('#areaCon').on("click","li", function(){
            //移出已选游戏大区
            var areaid = selectedServer['areaId'];
            if(areaid != ''){
                $("li[data-garea-id='"+areaid+"']").removeClass('selected');
                $('#serveCon').empty();
            }
            //重置选择游戏大区
            this.classList.add('selected');
            var elemId = this.getAttribute('data-garea-id');
            selectedServer['areaId'] = elemId;
            var index = data.findIndex(a => a.gareaId == elemId);
            $.each(data[index]['gameServers'],function(i,obj) {
                var gameServer = {id: obj['id'], serverName: obj['serverName']};
                var liServer = template("serveMode", gameServer);
                $('#serveCon').append(liServer);
            });
            $('#serveCon').on("click","li", function() {
                //移出已选服务器
                var serverid = selectedServer['serverId'];
                if (serverid != '') {
                    $("li[data-server-id='"+serverid+"']").removeClass('selected');
                }
                //重置选择服务器
                this.classList.add('selected');
                var elemId = this.getAttribute('data-server-id');
                selectedServer['serverId'] = elemId;
            });
            $('#serveCon').find('li').first().click(); //默认选择第一服
        });
        if(checkCookie()){ //若存在cookie
            var cookieArea = getCookie('area');
            var cookieServer = getCookie('server');
            $("li[data-garea-id='"+cookieArea+"']").click();
            $("li[data-server-id='"+cookieServer+"']").click();
        }
        else{//无cookie,默认选中群雄
            $("li[data-garea-id=1362965283936]").click();
            $("li[data-server-id=186100101]").click();
        }
    }
});

function lodeTreasure() {
    //记录本次所选的区服
    setCookie('area', selectedServer['areaId'], 30);
    setCookie('server', selectedServer['serverId'], 30);
}


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var cArea = getCookie("area");
    var cServer = getCookie("server");
    if (cArea != "" && cServer!=""){
        return true;
    } else {
        return false;
    }
}
