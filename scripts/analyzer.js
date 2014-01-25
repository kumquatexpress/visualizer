var apiKey = constants.api_key
var sc_client_id = constants.soundcloud_id

var context = new webkitAudioContext();
var remixer = createJRemixer(context, $, apiKey);

var soundURL = "https://soundcloud.com/brenxtune/love-lingerie";
var analysis;

//let's try this with the soundcloud integration
function analyze_track(){
    var analysis = new Array();
    remixer.remixTrackBySoundCloudURL(soundURL, sc_client_id, function(t, percent){
        $("#runinfo").html(percent + "% loading...");
        if(t.status == 'ok'){
            //got the analysis back, start the real work.
            analysis = analyzer.get_number_info(t);
            $("#runinfo").html("Done!");
            document.body.appendChild(prettyPrint(analysis));
        }
    });
}

/* get_number_info should return an object 
{
    title: url of the soundcloud song,
    bpm: integer,
    key: integer 1-12 1 = C, 2 = C#, ..., 12 = B,
    notes: [array of arrays [x, y], where x is 1-12, 1 = C, 2 = C#, ..., 12 = B and y is a float
    representing the length of the note, 1.0 = one beat, 0.5 = half beat, ...],
}
*/

analyzer = {
    get_number_info: function(track){
        var data = track.analysis;
        var tatums = data.tatums;

        var ret = new Object();
        ret.bpm = data.track.tempo;
        ret.key = data.track.key;
        ret.title = track.title;
        ret.notes = analyzer.merge_notes(tatums);
        return ret;
    },
    merge_notes: function(tatums){
        rhythms = _.map(tatums, function(t){
            if(t.oseg){
                return t.oseg["duration"];
            }
        });
        notes = _.map(tatums, function(t){ 
            if(t.oseg){
                return _.indexOf(t.oseg.pitches, _.max(t.oseg.pitches));
            }
        });

        return _.zip(rhythms, notes);
    }
}
//standin for the url that will come from an element later