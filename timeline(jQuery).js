(function($){
    $.fn.timeline = function(){
        var seletors={
            id:$(this),
            item:$(this).find('.item'),
            activeClass:'item--active',
            img:'img'
        };

        seletors.item.eq(0).addClass(seletors.activeClass);
        seletors.id.css(
            'background-image',
            'url('+
            seletors.item.first()
                .find(seletors.img)
                .attr('src')+
            ')'
        );
        var itemLength = seletors.item.length;
        $(window).scroll(function(){
            var max,min;
            var pos = $(this).scrollTop();
            seletors.item.each(function(i){
                min=$(this).offset().top;
                max=$(this).height()+$(this).offset().top;
                var that = $(this);

                if(i==itemLength-2&&pos>min+$(this).height()/2){
                    seletors.item.removeClass(seletors.activeClass);
                    seletors.id.css(
                        'background-image',
                        'url('+
                        seletors.item.last()
                        .find(seletors.img)
                        .attr('src')+
                        ')'
                    );
                    seletors.item.last().addClass(seletors.activeClass);
                }
                else if(pos<=max-10&&pos>=min){
                    seletors.id.css(
                        'background-image',
                        'url('+
                        $(this)
                        .find(seletors.img)
                        .attr('src')+
                        ')'
                    );
                    seletors.item.removeClass(seletors.activeClass);
                    $(this).addClass(seletors.activeClass);
                }
            });
        });
    };
})(jQuery)
$('#shell').timeline();