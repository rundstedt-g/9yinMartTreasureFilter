// 服务器地址
var address = window.location.protocol + "//" + window.location.hostname;

$(document).ready(function(){
    if(checkCookie()){ //若存在cookie，直接进入主页
        var cookieArea = getCookie('area');
        var cookieServer = getCookie('server');
        var serverId;
        openLoading();
        $.ajax({
            url: address + "/api/treasureFilter/getServerList", //接口
            type: "GET", //请求方式为get
            dataType: "json", //返回数据格式为json
            success: function(data) { //请求成功完成后要执行的方法
                callback(data[0]);
                closeLoading();
            }
        });
        function callback(data) {
            //显示服务器名，并设置服务器ID
            var gareaIndex = data.findIndex(a => a.gareaId == cookieArea);
            var serverIndex = data[gareaIndex]['gameServers'].findIndex(a => a.id == cookieServer);
            parentId = data[gareaIndex]['gameServers'][serverIndex]['parentId'];
            if(parentId == 0){
                serverId = cookieServer;
                $('#serverName').text(data[gareaIndex]['gameServers'][serverIndex]['serverName']);
            }
            else{
                serverId = parentId;
                $.each(data,function(i,obj) {
                    $.each(obj['gameServers'],function(j,tmp) {
                        if(tmp['id']==parentId){
                            $('#serverName').text(tmp['serverName']);
                        }
                    });
                });
            }
            $('#serverName').attr('selectedServerId',serverId); //将服务器ID存进页面中
            //加载宝物数据
            getTreasure({
                status:'Selling',
                serverId:serverId
            });
        }

    }
    else{//无cookie,跳转到选择区服页面
        location.replace("../toServerList.html");
    }

    //绑定下拉框的二级联动
    $('#taolu').bind("change",function(){
        setLinkage(this);
    });
    $('#taolu option:first').prop('selected', 'selected'); //设置默认选中第一项
    //给搜索按钮绑定点击事件
    $('.btn').bind("click",function(){
        getTreasure(getParam());
    });
    //给选中技能绑定更改事件
    $('#skill').bind("change",function(){
        getTreasure(getParam());
    });


    //为所有筛选属性添加点击事件
    $('.filter_content').on("click","dd", function() {
        if($(".catagory").length < 5){
            if(this.className == ''){
                this.classList.add('selected');
                var catagory = {spanId:this.getAttribute('data-code'), catagoryDesc:this.innerText};
                var spanCatagory = template("catagoryMode", catagory);
                $('.filter_param').append(spanCatagory);
            }
        }
        else{
            alert("至多选择5条属性!")
        }
    });

    //设置筛选属性收起和展开
    var oFilterControl = $('.filter_control');
    var oFilterFloor = $('.filter_floor');
    var oFilterMark = $('.filter_mark');
    var oFilterSubCatagory = $('.filter_sub_catagory');
    var oFilterSubCatagoryHeight = oFilterSubCatagory.height();
    oFilterControl.bind('click',function(){
        if( oFilterControl.hasClass('open') ){
            closeFn();
        }else{
            openFn();
        }
    });
    function closeFn(){
        oFilterControl.removeClass('open').addClass('close').attr('title','点击展开');
        oFilterFloor.addClass('vHide');
        oFilterMark.removeClass('vHide');
        oFilterSubCatagory.animate({height:60},100);
    }
    function openFn(){
        oFilterControl.removeClass('close').addClass('open').attr('title','点击收起');
        oFilterMark.addClass('vHide');
        oFilterFloor.removeClass('vHide');
        oFilterSubCatagory.animate({height:oFilterSubCatagoryHeight},100);
    }

    //设置宝物的排序
    goodsSort();

    //设置出售物品/公示期物品的切换
    sellingOrNotice();
});

//移除已选择的单条属性
function catagoryRemove(obj){
    $("dd[data-code='"+obj.id+"']").removeClass('selected');
    obj.remove();
}

//移除已选择的所有宝物属性
function removeSelectedCatagory(obj){
    if($(".catagory").length != 0){
        $.each($(".catagory"),function(i,obj) {
            catagoryRemove(obj);
        });
    }
}

//设置套路和武学两个下拉框的二级联动
function setLinkage(taolu){
    var skills = {
        tushou:['太祖长拳', '捻花功(古谱)', '太极拳(古谱)', '金顶绵掌', '逍遥腿法', '莲花掌', '魔心连环手', '花神七式(无缺)', '心佛掌', '大力金刚指', '降龙掌法(绝世)', '圣梅秘诀(古谱)'],
        danjian:['清风剑法', '洞天箫法', '太阴剑诀', '魅影剑法', '游龙剑法', '寒梅剑法', '天山剑法'],
        shuangjian:['九宫剑法', '忘川剑法'],
        dandao:['血杀刀法', '泼天风雨刀', '血海魔刀录'],
        shuangdao:['追风刀', '鸳鸯双刀'],
        bishou:['焚天令秘笈'],
        shuangci:['天绝地灭刺'],
        changgun:['达摩棍法'],
        duangun:['打狗八绝(古谱)'],
        anqi:['追魂爪', '阎王帖', '玲珑骰'],
        qimen:['寒泉洗心谱', '月明沧海诀']
    };
    var skill = document.getElementById("skill");
    var t = taolu.value;
    var s = skill.value;
    if(t=='0')
        return;
    skill.length=1;
    for(var i=0; i<skills[t].length; i++){
        skill.options[i+1] = new Option();
        skill.options[i+1].text = skills[t][i];
        skill.options[i+1].value = skills[t][i];
    }
}

//出售/公示期切换
function sellingOrNotice(){
    $('#dataPage').on("click","li",function(){
        elem=$(this);
        if(!elem.hasClass('selected')) { //已经选择
            $('#dataPage').find('.selected').removeClass('selected'); //移出已经选择的元素的selected属性
            elem.addClass('selected');
        }
        removeSelectedCatagory();//移除已选择的所有宝物属性
        $("#taolu").val("0"); //设置value为 0的项选中(全部套路)
        $("#skill").val("0"); //设置value为 0的项选中(选择武学)
        $('.filter_param_item').find('.selected').removeClass('selected'); //移出已经选择的排序元素的selected属性
        $('.filter_param_item').find('.default').addClass('selected'); //设置默认排序
        getTreasure({
            status:elem.attr('data-page'),
            serverId:$('#serverName').attr('selectedServerId')
        });
    });
}

//排序
function goodsSort(){
    var goodsSortCon = $('.filter_param_item');
    goodsSortCon.on("click","li[data-param]",function(){
        elem=$(this);
        if(elem.hasClass('selected')){ //已经选择
            if(elem.hasClass('asc')){
                elem.removeClass('asc');
                elem.addClass('desc');
            }
            else if(elem.hasClass('desc')) {
                elem.removeClass('desc');
                elem.addClass('asc');
            }
        }
        else{ //未被选择
            goodsSortCon.find('.selected').removeClass('selected'); //移出已经选择的元素的selected属性
            elem.addClass('selected');
        }
        getTreasure(getParam());
    });
}

//获取ajax请求所需的参数
function getParam(){
    var selectdfCatagory = {};
    $.each($(".catagory"),function(i,obj) { //属性
        selectdfCatagory['bwa'+(i+1).toString()] = encodeURI(obj.innerHTML.replace(/<i><\/i>/g, ""));
    });
    if( $("#skill option:selected").val() != "0"){ //技能
        selectdfCatagory['bwa'+(Object.keys(selectdfCatagory).length+1)] = encodeURI($("#skill option:selected").val());
        selectdfCatagory['itemName'] = encodeURI('翡翠墨玉璜');
    }
    var status =  $('#dataPage .selected').attr('data-page');
    var serverId = $('#serverName').attr('selectedServerId');
    selectdfCatagory['status'] = status;
    selectdfCatagory['serverId'] = serverId;
    var sortElem = $('.filter_param_item').find('.selected');
    var sortWay,sortField;
    if(!sortElem.hasClass('default')){
        sortWay = sortElem.attr('class');
        sortField = sortElem.attr('data-param');
        selectdfCatagory['sortWay'] = sortWay.replace('selected', '').trim();
        selectdfCatagory['sortField'] = sortField;
    }
    return selectdfCatagory;
}

// 页码栏设置
function pageList( options, pageParam, pageCon ){
    var _self = this,
        defaults = {
            elements: pageCon || $('.page_list'),
            totalPages: 0,
            pageIndex: 0,
            maxLinkCount: 5
        },
        opts = $.extend({}, defaults, options), //extend()将一个或多个对象的内容合并到目标对象
        paging = opts.elements,
        totalPages = opts.totalPages,
        pageId = opts.pageId,
        maxLinkCount = opts.maxLinkCount,
        endPage = Math.min(totalPages, Math.max(1, pageId - parseInt(maxLinkCount / 2)) + maxLinkCount - 1),
        startPage = Math.max(1, endPage - maxLinkCount + 1),
        pageNumber = startPage,
        pagingHtml = [];
    if ( totalPages === 1 || !totalPages) { //只有一页，就不需要显示页码栏
        paging.hide();
        return false;
    }
    if (pageId != 1) { //非选中首页，显示首页和上一页
        pagingHtml.push('<a class="page_link arrow_r" pageIndex="1" href="javascript:void(0);">首页</a>');
        pagingHtml.push('<a class="page_link arrow_r" pageIndex="' + (pageId - 1) + '" href="javascript:void(0);">上一页</a>');
    }
    for (; pageNumber <= endPage; pageNumber += 1) { //为每页添加链接标签
        pagingHtml.push('<a ' + (pageNumber == pageId ? 'class="selected"' : 'class="page_link" pageIndex="' + pageNumber + '"') + ' href="javascript:void(0);">' + pageNumber + '</a>')
    }
    if( totalPages >= maxLinkCount && pageId != totalPages ){ //省略号显示
        pagingHtml.push('<span>...</span>');
    }
    if (totalPages != pageId) {//非选中尾页，显示尾页和下一页
        pagingHtml.push('<a class="page_link arrow_l" pageIndex="' + (pageId + 1) + '" href="javascript:void(0);">下一页</a>');
        pagingHtml.push('<a class="page_link arrow_l" pageIndex="' + totalPages + '" href="javascript:void(0);">尾页</a>')
    }
    pagingHtml.push('<span>共' + totalPages + '页</span>'); //总页数显示
    pagingHtml.push('<div class="jump">到第<input type="text" id="jumpto" value="" />页<a class="go_index"></a></div>'); //输入页数跳转
    paging.html(pagingHtml.join('')).show(); //显示页码栏
    //绑定点击事件
    paging.find('a').unbind('click').bind('click', function(event) {
        var target = event.target, //返回事件的目标节点（触发该事件的节点）
            currentElem = $(target),
            pageNumber = 0;
        if ( currentElem.is('a:not(.selected)') ) { //is() 方法用于查看选择的元素是否匹配选择器。 若当前页码没被选中
            pageNumber = currentElem.attr('pageIndex') || paging.find('#jumpto').val(); //选中的页码
            pageParam.pageIndex =pageNumber;
            getTreasure(pageParam);
        }
    }).end().find('input').unbind('keydown').bind('keydown',function(event) {
        if (event.target.id == 'jumpto' && event.which == 13) { //13是回车的码
            pageNumber = this.value || 1;
            pageParam.pageIndex =pageNumber;
            getTreasure(pageParam);
        }
    })
}

function getTreasure(){
    var opts = Array.prototype.shift.call( arguments); //获取函数的参数表
    var url = address + "/api/treasureFilter/getTreasure?"; //接口
    var status = 'status='+opts.status;
    var serverId = 'serverId='+opts.serverId;
    var sortWay = opts.hasOwnProperty("sortWay")?'&sortWay='+opts.sortWay : '';
    var sortField = opts.hasOwnProperty("sortField")?'&sortField='+opts.sortField : '';
    var itemName = opts.hasOwnProperty("itemName")?'&itemName='+opts.itemName : '';
    var bwa1 = opts.hasOwnProperty("bwa1")?'&bwa1='+opts.bwa1 : '';
    var bwa2 = opts.hasOwnProperty("bwa2")?'&bwa2='+opts.bwa2 : '';
    var bwa3 = opts.hasOwnProperty("bwa3")?'&bwa3='+opts.bwa3 : '';
    var bwa4 = opts.hasOwnProperty("bwa4")?'&bwa4='+opts.bwa4 : '';
    var bwa5 = opts.hasOwnProperty("bwa5")?'&bwa5='+opts.bwa5 : '';
    var bwa6 = opts.hasOwnProperty("bwa6")?'&bwa6='+opts.bwa6 : '';
    var pageIndex = opts.hasOwnProperty("pageIndex")?'&pageIndex='+opts.pageIndex : '';
    openLoading();
    $.ajax({
        url: url+status+'&'+serverId+sortWay+sortField+itemName+bwa1+bwa2+bwa3+bwa4+bwa5+bwa6+pageIndex,
        type: "GET", //请求方式为get
        dataType: "json", //返回数据格式为json
        success: function(data) { //请求成功完成后要执行的方法
            loadTreasure(data[0]);
            pageList(data[0]['pageInfo'],opts);
            closeLoading();
        }
    });
    function loadTreasure(data){
        var pageData = data['pageData'];
        $('.goods_item_con').empty(); //清空原有宝物数据
        var idSet = [];
        $.each(pageData,function(i,obj) {
            idSet.push(obj['id']);
            //悬浮信息居中
            var a=i%5;
            var index_mode_bak="";
            if(0!==i && 3===a||4===a){
                index_mode_bak="right_tips";
            }
            //出售的剩余时间
            var marks_time;
            if(obj.hasOwnProperty('remarnTime')){ //若处于公示期，则有remarnTime属性
                marks_time = obj['remarnTime'];
            }
            else{
                marks_time = getRemainTime(obj['shelfDate'],obj['shelfDays'],obj['issaleFlag'],obj['serverId'],obj['id']);
            }
            //宝物技能
            itemDescDOM = document.createElement('html');
            itemDescDOM.innerHTML = obj['itemDesc'];
            treasureSkill = itemDescDOM.querySelectorAll('font[color1="#FF0000"]');
            var skillText = "";
            if (treasureSkill.length!=0 && obj['itemName']=='翡翠墨玉璜'){
                skillText = treasureSkill[0].innerText;
            }
            //是否竞拍转出售
            var issaleFlag_bak="";
            if(obj['issaleFlag']==1){
                issaleFlag_bak = 'class=hammer';
            }
            //模板对象
            var goods = {
                __index_mode_bak:index_mode_bak,
                iconPath:obj['iconPath'],
                marks_time:marks_time,
                marks_bak:skillText,
                itemName_class:"",
                issaleFlag_bak:issaleFlag_bak,
                itemName:obj['itemName'],
                id:obj['id'],
                unitPrice_bak:obj['price'].toFixed(2)+" 元",
                itemAmount_bak:obj['itemAmount'],
                price_bak:obj['price'].toFixed(2),
                isFollow:"is-follow-no",
                followCount:"",
                itemDesc:obj['itemDesc']};
            var goodsBlock = template("selling", goods);
            $('.goods_item_con').append(goodsBlock);
        });

        if(data['pageInfo']['totalCount'] != 0){
            //为宝物添加关注数量
            getFollowCount(data['searchParams']['serverId'],idSet);

            //设置悬浮显示宝物具体信息以及标签
            $('.goods_block').hover(function(){
                var _this = $(this),
                    pos = _this.offset(),
                    w = _this.outerWidth(),
                    tips = _this.find('.goods_tips').html(),
                    tags = _this.find('.tags p');
                if( _this.hasClass('right_tips') ){
                    pos.left -= 338;
                }else{
                    pos.left += w;
                }
                if (tags.size()) {
                    tags.animate({
                        right: 0
                    }, 100)
                }
                if( tips ){
                    $('.item_desc').html( tips ).css({
                        top: pos.top,
                        left: pos.left
                    }).show();
                }
            },function(){
                $('.item_desc').empty().hide();
                var _this = $(this),
                    tags = _this.find('.tags p');
                for (var i = 0; i < tags.length; i++) {
                    var elem = $(tags[i])
                    len = parseInt( elem.attr('index') ) * 7
                    elem.animate({
                        right: '-'+len+ 'px'
                    }, 100)
                }
            });
        }
        else{
            var noGoods = $('<p>',{
                class:"no_goods textCenter"
            });
            noGoods.html('<img class="min_img" src="../css/images/junzi.png"> 抱歉，没有相关物品!');
            noGoods.appendTo('.goods_item_con');
        }
    }
}

function getRemainTime(shelfDate,shelfDays,issaleFlag,serverId,itemId){
    var shelfDate = new Date(shelfDate.replace(/-/g, "/"));
    var currentDate = new Date();
    if(issaleFlag == 1){
        shelfDays +=2;
    }
    var shelfDaysMS = shelfDays*24*60*60*1000;
    var deadline = shelfDate.getTime() +shelfDaysMS;
    var remainTime = deadline-currentDate.getTime() ;

    //计算出相差天数
    var days  = Math.floor(remainTime / (24 * 3600 * 1000));
    var leave1=remainTime%(24*3600*1000);   //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000));//计算出小时数
    //计算相差分钟数
    var leave2=leave1%(3600*1000);    //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000));//计算相差分钟数
    //计算相差秒数
    var leave3=leave2%(60*1000);     //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000);//计算相差秒数
    var remainTimeFormat = days+"天"+hours+"时"+minutes+"分";
    if(days < 0 || hours< 0 || minutes<0){
        var url = address + "/api/treasureFilter/getTradeItem?"; //接口
        $.ajax({
            url: url+'serverId='+serverId+'&'+'itemId='+itemId,
            async: false, //设置同步请求
            type: "GET", //请求方式为get
            dataType: "json", //返回数据格式为json
            success: function(data) { //请求成功完成后要执行的方法
                returnRemainTime(data[0]);
            }
        });
        function returnRemainTime(data) {
            remainTimeFormat = data['remarnTime'].replace("可售剩余时间:",'').trim();
        }
    }
    return remainTimeFormat;
}

function getFollowCount(serverId, idSet){
    var url = address + "/api/treasureFilter/getFollowCount?"; //接口
    var itemIds = idSet.join('%7C');
    openLoading();
    $.ajax({
        url: url+'serverId='+serverId+'&'+'itemIds='+itemIds,
        type: "GET", //请求方式为get
        dataType: "json", //返回数据格式为json
        success: function(data) { //请求成功完成后要执行的方法
            loadFollowCount(data[0]);
            closeLoading();
        }
    });
    function loadFollowCount(data) {
        if(data['flag'] == true){
            $.each(data['data'],function(i,obj) {
                $('#'+i).text(obj);
            });
        }
    }
}

//弹出开发者二维码
function pop(){
    $(".pop_mark").show();
}
//关闭开发者二维码
function cancel(){
    $(".pop_mark").hide();
}

//打开加载遮罩层
function openLoading(){
    $(".loading").show();
}
//关闭加载遮罩层
function closeLoading(){
    $(".loading").hide();
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