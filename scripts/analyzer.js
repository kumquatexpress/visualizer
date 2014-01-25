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
    notes: [array of arrays [x, y], where x is a float
    representing the length of the note, 1.0 = one beat, 0.5 = half beat, ...
    and y is 1-12, 1 = C, 2 = C#, ..., 12 = B }
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
        var ret_notes = new Array();
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
        //reverse the array since notes are from end to start right now
        return ret_notes.reverse();
    }
}
//standin for the url that will come from an element later