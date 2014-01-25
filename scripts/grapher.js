$(document).ready(function(){
    $("#run").click(function(){
        analyze_track();
    });

    $(window).resize(function(){
        var height = $(window).innerHeight();
        var width = $(window).innerWidth();
        $(".hex-holder").css("top", height/2+"px")
            .css("left", width/2+"px");
    });
});