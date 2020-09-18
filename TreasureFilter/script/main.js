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
    console.log('test');
    console.log($('#pinc').attr("id"));
    console.log($('#pinc').outerWidth());
    console.log($('#pinc').outerHeight());
    console.log('test');
});
//移出已选择的属性
function catagoryRemove(obj){
    console.log(obj.innerText);
    console.log(obj.id);
    $("dd[data-code='"+obj.id+"']").removeClass('selected');
    obj.remove();
}