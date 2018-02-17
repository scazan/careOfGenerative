
import { Patterns as p } from "./patterns";
import Sound from "./Sound";
import utils from "./utils";

// HELPERS
const createIntegerSequence = (start: number, length: number): number[] => {
	let i: number = start;
	let seqArray = Array(length).fill(0);

	seqArray = seqArray.map( () => i++);

	return seqArray;
};

const createRandomIntegerSequence8 = (): number[] => createIntegerSequence(Math.floor(Math.random() * 10), 8);
// END HELPERS

//let notes = p.Pmarkov([6,0.1, 5, 3, 9, 0.2, 9, 5, 0.2, 0.1, 0.3], 2, [6, 0.1]);
let initialPopulation = Array(80).fill( Array(8).fill(0) );
let target = Array(8).fill(0);


let i=0;
target = [193, 423, 1668, 2333, 2665, 3078, 4038, 6319];  ;
//target = target.map((freq) => utils.ftom(freq) );
//target = target.map(() => {i+1; return i;});
initialPopulation = initialPopulation.map( item => item.map( item2 => {return (Math.random() * (target[target.length-1] - target[0])) + (target[0]-20)}) );
//initialPopulation = initialPopulation.map( () => createRandomIntegerSequence8() );
console.log(initialPopulation);

let notes = p.Pgenetic(initialPopulation, target);

const timeBetweenEvents = 20;
const gapBetweenEvents = 25;

let printNote = () => {
		const nextGen = notes.next().value;
		//const newNotes = nextGen.map(note => utils.mtof( Math.ceil(utils.ftom(note)) ) );
		const newNotes = nextGen;

	let i = 0;
	let k = (Math.random() > 0.5) ? 0 : 1;
		oscillators.map((osc) => {
			const octave = Math.ceil(Math.random() * 8);
			osc.play(newNotes[i]/octave, timeBetweenEvents, ((k%2)*2) - 1); i++; k++;
		});

		console.log(nextGen)

	window.setTimeout(function() {
		printNote();
	}, (timeBetweenEvents + gapBetweenEvents) * 1000);
};

let playMelody = () => {
		const nextGen = notes.next().value;
		const newNotes = nextGen;

  // How do you map a melody of (basically) random pitches into a melody
  // given by, let's say, a song. There needs to be some distance test
  const idealMelody = newNotes; // Should be taken from the sequence of pitches in the recording
  const markovMelody = p.Pmarkov(idealMelody, 2, newNotes);

  let i = 0;
  const playNextNote = () => {
    const octave = Math.ceil(Math.random() * 8);
    oscillators[i].play(markovMelody.next().value/octave, 1, 0);
    i++;
  }

	window.setTimeout(function() {
		playNextNote();
	}, 1 * 1000);

};


const context = new AudioContext();
let oscillators: Sound[] = [
	new Sound(context),
	new Sound(context),
	new Sound(context),
	new Sound(context),
	new Sound(context),
	new Sound(context),
	new Sound(context),
	new Sound(context)
];

printNote();

