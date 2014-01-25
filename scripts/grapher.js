NOTE_DICTIONARY = {
    0: ".C",
    1: ".Csharp",
    2: ".D",
    3: ".Dsharp",
    4: ".E",
    5: ".F",
    6: ".Fsharp",
    7: ".G",
    8: ".Gsharp",
    9: ".A",
    10: ".Asharp",
    11: ".B",
    12: "REST_NO_COLOR",
}



$(document).ready(function(){
    center_hexagons();

    $("#run").click(function(){
        analyze_track($("#sound_url").val());
    });

    $(window).resize(function(){
        center_hexagons();
    });

});

function center_hexagons(){
    var height = $(window).innerHeight() - 800;
    if(height < 0){
        height = 0;
    }
    var width = $(window).innerWidth();
    $(".hex-holder").css("margin-top", height/2+"px")
        .css("left", width/2+"px");
    $(".credits").css("left", (width/2 - 248) +"px");
}

function start_visualization(analysis){
    var current_time = 0;
    _.each(analysis, function(a){
        setTimeout(function(){ light_hexagon(a[1], a[2]); }, current_time*1000);
        current_time += a[0];
        setTimeout(function(){ turn_off_hexagon(a[1]); }, current_time*1000);
    })
}

function light_hexagon(note, loudness){
    //set all as green for now, randomize later
    var color = pick_color_amplitude(loudness);
    $(".middle"+NOTE_DICTIONARY[note]).css("background", color);
    $(".left"+NOTE_DICTIONARY[note]).css("border-right", "60px solid"+color);
    $(".right"+NOTE_DICTIONARY[note]).css("border-left", "60px solid"+color);
}

function turn_off_hexagon(note){
    var color = "#ECECEE"
    $(".middle"+NOTE_DICTIONARY[note]).css("background", color);
    $(".left"+NOTE_DICTIONARY[note]).css("border-right", "60px solid"+color);
    $(".right"+NOTE_DICTIONARY[note]).css("border-left", "60px solid"+color);
}

function pick_color_amplitude(loudness){
    if(loudness < 0.7){
        return "#CCFFCC";
    }
    if(loudness < 0.8){
        return "#FFFF70";
    }
    if(loudness < 0.9){
        return "#4775FF";
    }
    if(loudness < 1.0){
        return "#FF3333";
    }
    return "#FF59D6";
}