var apiKey = constants.api_key;
var sc_client_id = constants.soundcloud_id;

var context = new webkitAudioContext();
var remixer = createJRemixer(context, $, apiKey);
var player = remixer.getPlayer();

//var soundURL = "https://soundcloud.com/sonyclassical-switzerland/sc-03-piano-concerto-no-1-in-e";

var analysis;
var AVG_LOUDNESS;
var THRESHHOLD = 4.5;

//let's try this with the soundcloud integration
function analyze_track(sound_url){
    var analysis = new Array();
    remixer.remixTrackBySoundCloudURL(sound_url, sc_client_id, function(t, percent){
        $("#runinfo").val(percent);
        if(t.status == 'ok'){
            AVG_LOUDNESS = t.analysis.track.loudness;
            //got the analysis back, start the real work.
            analysis = analyzer.get_number_info(t);

            //hide the input form when done
            $("#runinfo").html("Done!");
            $(".peripherals").hide(1000, 'swing');
            
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
    notes: [array of arrays [x, y, z], where x is a float
        representing the length of the note, 1.0 = one beat, 0.5 = half beat, ...
        and y is 0-11, 0 = C, 1 = C#, ..., 11 = B }.  y = 12 means a rest.
        z is representative of the ratio between this note's loudness and the 
        average loudness of the piece.
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
        loudness = _.map(segments, function(t){
            if(t){
                return AVG_LOUDNESS*1.0/t["loudness_start"];
            }
        });

        //here we merge the like notes that are consecutive
        var current_note = -1;
        var current_rhythm = 0;
        var note;
        var rhythm;
        var loudness;
        var tuples = _.zip(rhythms, notes, loudness);
        for(var i = 0; i < tuples.length; i++){
            rhythm = tuples[i][0];
            note = tuples[i][1];
            loudness = tuples[i][2];
            if(current_note == note){
                current_rhythm += rhythm;
            } else {
                ret_notes.push([current_rhythm, current_note, loudness]);
                current_note = note;
                current_rhythm = rhythm;
            }
        }
        ret_notes.push([current_rhythm, current_note, loudness]);
        //reverse the array since notes are from end to start right now
        return ret_notes;
    }
}