var apiKey = constants.api_key;
var sc_client_id = constants.soundcloud_id;

var context = new webkitAudioContext();
var remixer = createJRemixer(context, $, apiKey);
var player = remixer.getPlayer();

var soundURL = "https://soundcloud.com/sonyclassical-switzerland/sc-03-piano-concerto-no-1-in-e";
var analysis;
var AVG_LOUDNESS;
var THRESHHOLD = 1.6;

//let's try this with the soundcloud integration
function analyze_track(){
    var analysis = new Array();
    remixer.remixTrackBySoundCloudURL(soundURL, sc_client_id, function(t, percent){
        $("#runinfo").html(percent + "% loading...");
        if(t.status == 'ok'){
            AVG_LOUDNESS = t.analysis.track.loudness;
            //got the analysis back, start the real work.
            analysis = analyzer.get_number_info(t);
            $("#runinfo").html("Done!");
            
            //document.body.appendChild(prettyPrint(analysis));

            player.play(0, t.analysis.beats);
            start_visualization(analysis.notes);
        }
    });
}

/* get_number_info should return an object 
{
    title: url of the soundcloud song,
    bpm: integer,
    key: integer 0-11 0 = C, 1 = C#, ..., 11 = B,
    notes: [array of arrays [x, y], where x is a float
    representing the length of the note, 1.0 = one beat, 0.5 = half beat, ...
    and y is 0-11, 0 = C, 1 = C#, ..., 11 = B }.  y = 12 means a rest.
*/

analyzer = {
    get_number_info: function(track){
        var data = track.analysis;
        var segments = data.segments;

        var ret = new Object();
        ret.bpm = data.track.tempo;
        ret.key = data.track.key;
        ret.title = track.title;
        ret.notes = analyzer.merge_notes(segments);
        return ret;
    },
    merge_notes: function(segments){
        var ret_notes = new Array();
        rhythms = _.map(segments, function(t){
            if(t){
                return t["duration"];
            }
        });
        notes = _.map(segments, function(t){ 
            if(t.loudness_start > AVG_LOUDNESS * THRESHHOLD){
                return _.indexOf(t.pitches, _.max(t.pitches));
            } else { return 12; }
        });

        //here we merge the like notes that are consecutive
        var current_note = -1;
        var current_rhythm = 0;
        var note;
        var rhythm;
        var tuples = _.zip(rhythms, notes);
        for(var i = 0; i < tuples.length; i++){
            rhythm = tuples[i][0];
            note = tuples[i][1];
            if(current_note == note){
                current_rhythm += rhythm;
            } else {
                ret_notes.push([current_rhythm, current_note]);
                current_note = note;
                current_rhythm = rhythm;
            }
        }
        ret_notes.push([current_rhythm, current_note]);
        //reverse the array since notes are from end to start right now
        return ret_notes;
    }
}
//standin for the url that will come from an element later