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
            var li = template("areaMode", gameArea);
            $('#areaCon').append(li);
            $('#areaCon').on("click", displayServer());
        });
    }
});

function  displayServer(obj){

}
