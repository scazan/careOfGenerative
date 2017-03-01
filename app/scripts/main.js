let p = require("./patterns")();
p.exportToScope(window);
var utils = require('./utils');
var _ = require('underscore');


Gibberish.init();
Gibberish.Binops.export();
var G = Gibberish;

//sineMod2 = new G.Saw(0.2, 500);
sineMod = new G.Sine(0.2, 30);
//mod = new G.Saw(5, Mul(150, sineMod));

//sine = new G.Sine({
	//frequency: Add(sineMod2, Add( 600, mod)),
	//amp: 0.05
//});


//var delay = new G.Delay({input: sine, time: 44100*1, feedback: 0.35 });
//var reverb2 = new G.Reverb({input:delay, roomSize: 0.8});
//reverb2.connect();



//a = new Gibberish.PolyFM({ cmRatio:9, index:3, attack:88200, decay:88200 * 10, maxVoices:20 });
stereoBus = new Gibberish.Bus2();
a = new Gibberish.PolyFM({ cmRatio:19, index:3, attack:88200, decay:88200 * 30, maxVoices:20, pan: -1 }).connect();
f = new Gibberish.PolyFM({ cmRatio:19, index:3, attack:88200, decay:88200 * 30, maxVoices:20, pan: 1}).connect();

//b = new Gibberish.Distortion({ input: stereoBus, amount:3 });
b = new Gibberish.Distortion({ input: stereoBus, amount:40 });
//c = new Gibberish.Flanger({input:b, rate: 12.0, amount:125, feedback:.5}).connect();
c = new Gibberish.Flanger({input:b, rate: Add(12.0, sineMod), amount:125, feedback:.5, pan: -1}).connect();
reverb = new G.Reverb({input:c, damping: 0.2});
reverb.connect();
var note = 48;
//a.note(note);
//a.note(note*1.5);
note = 28*1.5;
triggerNote = function(freq, synth) {
	synth.note(freq*1);synth.note(freq*0.75);synth.note(freq*1.5);
};
triggerNoteStereo = function(freqs, synths) {
	for(var i = 0; i < synths.length; i++) {
		var synth = synths[i],
			freq = freqs[i];

		synth.note(freq*1);synth.note(freq*0.75);synth.note(freq*1.5);
	}
};


// Sometimes
//c.amount = 12
c.amount = 615;

sampler = new Gibberish.Sampler({ file:'/samples/cuernavaca1.wav' }).connect(stereoBus);
sampler.amp = 4;
sampler.note(0.4);

notes = Pmarkov([6,0.1, 5, 3, 9, 0.2, 9, 5, 0.2, 0.1, 0.3], 2, [6, 0.1]);
//notes = Pmarkov([6,0.1, 5, 3, 9, 0.2, 9, 5, 0.2], 2, [6, 0.1]);

//durations = Prand([11025, 22050]);
let SR = 44100;
durations = Prand([SR * 0.001, SR * 0.25, SR*1, SR * 0.1]);

seq = new Gibberish.Sequencer({ 
	target: sampler,
	key: 'note',
	durations: [() => durations.next().value],
	values: [() => notes.next().value]
}).start();

flangerSeq = new Gibberish.Sequencer({ 
	target: c,
	key:'feedback', durations: [SR*5],
	//values: [() => c.feedback < 0.9 ? c.feedback+0.05 : 0.9]
	values: [() => c.feedback < 0.9 ? c.feedback+0.05 : (() => {c.amount = utils.choose([615,12]); return Math.random() * 0.8;})()]
}).start();

flangerSeqAmount = new Gibberish.Sequencer({ 
	target: c,
	key:'amount',
	durations: [SR*2],
	//values: [() => c.amount < 5000 ? c.amount+100 : 5000]
	values: [() => c.amount < 800 ? c.amount+10 : utils.choose([ 615, 12, 12, 1 ])]
}).start();


// Pitches
//let pitchDurs = Prand([SR * 10.001, SR * 25, SR*40, SR * 60]);
//let pitchNotes = Pmarkov([60, 70, 60, 70, 200, 1000, 70], 2, [70, 60]);

//let pitchSeq = new Gibberish.Sequencer({ 
	//target: a,
	//key: 'note',
	//durations: [() => pitchDurs.next().value],
	//values: [() => pitchNotes.next().value]
//}).start()
