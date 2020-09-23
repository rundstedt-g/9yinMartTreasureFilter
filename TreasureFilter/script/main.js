var skills = {
    tushou:['太祖长拳', '捻花功(古谱)', '太极拳(古谱)', '金顶绵掌', '逍遥腿法', '莲花掌', '魔心连环手', '花神七式(无缺)', '心佛掌', '大力金刚指', '降龙掌法(绝世)', '圣梅秘诀(古谱)'],
    danjian:['清风剑法', '洞天箫法', '太阴剑诀', '魅影剑法', '游龙剑法', '寒梅剑法', '天山剑法'],
    shuangjian:['九宫剑法', '忘川剑法'],
    dandao:['血杀刀法', '泼天风雨刀', '血海魔刀录'],
    shuangdao:['追风刀', '鸳鸯双刀'],
    bishou:['焚天令秘笈'],
    shuangci:['天绝地灭刺'],
    changgun:[],
    duangun:['打狗八绝(古谱)'],
    anqi:['追魂爪', '阎王帖', '玲珑骰'],
    qimen:['寒泉洗心谱', '月明沧海诀']
}
$(document).ready(function(){
    //为所有筛选属性添加点击事件
    $('.filter_content').on("click","dd", function() {
        this.classList.add('selected');
        var catagory = {spanId:this.getAttribute('data-code'), catagoryDesc:this.innerText};
        var spanCatagory = template("catagoryMode", catagory);
        $('.filter_param').append(spanCatagory);
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

    goods_block();
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
    var pageInfo = {"pageId":1,"pageSize":15,"totalCount":1012,"totalPages":68};
    pageList(pageInfo);
});
//移出已选择的属性
function catagoryRemove(obj){
    console.log(obj.innerText);
    console.log(obj.id);
    $("dd[data-code='"+obj.id+"']").removeClass('selected');
    obj.remove();
}
//设置套路和武学两个下拉框的二级联动
function setLinkage(taolu){
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
//商品信息块
function goods_block(){
    var goods = {__index_mode_bak:"",
                 iconPath:"http://jishi.woniu.com/res/icon/treasure/10016.png",
                 marks_time:"12天23小时39分钟",
                 marks_bak:"心佛掌",
                 itemName_class:"",
                 issaleFlag_bak:"",
                 itemName:"翡翠墨玉璜",
                 id:"4140847",
                 unitPrice_bak:"1,200.00 元",
                 itemAmount_bak:"1",
                 price_bak:"1,200.00",
                 id:"4140847",
                 isFollow:"is-follow-no",
                 followCount:"2",
                 itemDesc:"<div style=\"border:2px solid #333; background:#000; overflow:hidden; width:334px; word-wrap: break-word;font-family:微软雅黑; font-size:12px; font-weight:bold; line-height:25px;  color:#FFFFFF; \"><div style=\"width:330px; padding-left:6px; padding-top:6px; padding-bottom:6px;\"><font style=\"font-size:14px\">翡翠墨玉璜</font><br>装备后绑定<br><font color=\"#ffffff\">宝物</font><br>性别：<font color=\"#ffcc00\">通用</font><br>实力限制：<font color=\"#ff0000\">无与伦比</font><br>装备品级：<font color=\"#ffcc00\">六品</font><br>耐久度：<font color=\"#ffcc00\">100</font><font color=\"#ffcc00\">/100</font><br><font color=\"#ffd700\">气血上限+283</font><br><font color=\"#ffd700\">招架耐力上限+170</font><br><font color=\"#ffd700\">暴击伤害减免+14%</font><br><font color=\"#ffd700\">外功招架忽视+1</font><br><font color=\"#ffd700\">近身威力+3</font><br><font color=\"#ffd700\">内功伤害减免忽视+2%</font><br><font color=\"#ffd700\">被暴击几率降低1%</font><br><font color1=\"#FF0000\">心佛掌</font><font color2=\"#ADFF2F\">的</font><font color3=\"#FF0000\">非常无常</font><font color1=\"#ADFF2F\">每击伤害+2</font><br><font color1=\"#FF0000\">心佛掌</font><font color2=\"#ADFF2F\">的</font><font color3=\"#FF0000\">寂灭加持</font><font color1=\"#ADFF2F\">每击伤害+18</font><br><font color1=\"#FF0000\">心佛掌</font><font color2=\"#ADFF2F\">的</font><font color3=\"#FF0000\">空相无相</font><font color1=\"#ADFF2F\">每击伤害+29</font><br><font color1=\"#FF0000\">心佛掌</font><font color2=\"#ADFF2F\">的</font><font color3=\"#FF0000\">天鼓雷音如来印</font><font color1=\"#ADFF2F\">每击伤害+2</font><br>分解可获得宝物兑换凭证和当票。<br>分解前请确保包裹内有足够空间。<br><font color=\"#ffcc00\">可分解</font><br>出售价格: <img src=\"http://jishi.woniu.com/res/icon/gui/common/money/suiyin.png\" valign=\"center\"> <font color=\"#e4dbc2\">5两10文</font><br><div style=\"float: left; z-index:98; position:absolute; left: 235px; top: 16px; border:1px solid #333;\" valign=\"top;\"><img align=\"top\" src=\"http://jishi.woniu.com/res/icon/treasure/10016.png\"></div><div style=\"float: left; z-index:99; position:absolute; left: 299px; top: 6px;\" valign=\"top\"><img align=\"top\" src=\"http://jishi.woniu.com/res/icon/gui/language/ChineseS/equip/seal_yu.png\"></div></div></div>"};
    var goodsBlock = template("selling", goods);
    for(var i=0;i<15;i++){
        $('.goods_item_con').append(goodsBlock);
    }
}
 function pageList( options, callback, pageCon ){
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
}