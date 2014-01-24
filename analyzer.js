var apiKey = secret_keys.api_key
var sc_client_id = secret_keys.soundcloud_id
var context = new webkitAudioContext();
var remixer = createJRemixer(context, $, apiKey);

//standin for the url that will come from an element later
var soundURL = "";

//let's try this with the soundcloud integration

function analyze_track(){
    var analysis = new Array();
    remixer.remixTrackBySoundCloudURL(soundURL, sc_client_id, function(t, percent){
        analysis = t.analysis;
    });
    return analysis;
}

