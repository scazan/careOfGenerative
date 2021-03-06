import Synth from './Synth';
import { Pmarkov, Pgenetic } from './patterns';
import { ISoundPlayer } from './SoundPlayer';
import { IFreqBin } from '../tools/spectrumPeakParser';
import { mod, makeFunction, mapToDomain, flipCoin, choose } from './utils';

export interface ISpectrumConfig {
  audioFile: string,
  spectrum: IFreqBin[],
}

export interface ISceneConfig {
  populationSize: number,
  initialPopulation: any[][],
  target: any[], // In Frequency
  maxGenerations: number;
  timeBetweenEvents: any |number | Function,
  gapBetweenEvents: any | number | Function,
  melodyOscillators: ISoundPlayer[],
  chordOscillators: ISoundPlayer[],
  onFinish: Function,
}

export class Scene {
  notes: IterableIterator<any>;
  currentGeneration: number;
  config: ISceneConfig;
  onFinish: Function;

  public constructor(config: ISceneConfig) {
    this.config = config;

    this.config.timeBetweenEvents = makeFunction(this.config.timeBetweenEvents);
    this.config.gapBetweenEvents = makeFunction(this.config.gapBetweenEvents);
    this.notes = Pgenetic(config.initialPopulation, config.target);
    this.config.maxGenerations = config.maxGenerations;
    this.currentGeneration = 0;

    this.config.onFinish = config.onFinish;
  }

  public play(): Scene {
    const nextGen: number[] = this.notes.next().value;
    const newNotes: number[] = nextGen;

    let i = 0;
    let k = (Math.random() > 0.5) ? 0 : 1;
    this.config.chordOscillators.map((osc) => {
      const octave = Math.ceil(Math.random() * 5);
      osc.play({freq: newNotes[i]/octave, time: this.config.timeBetweenEvents(), pan: ((k%2)*2) - 1, vol: 0.45}); i++; k++;
    });

    this.playMelody(newNotes, this.currentGeneration);

    if(this.currentGeneration <= (this.config.maxGenerations-1) ) {
      window.setTimeout(() => {
        this.currentGeneration++;
        this.play();
      }, (this.config.timeBetweenEvents() + this.config.gapBetweenEvents()) * 1000);
    }
    else {
      this.currentGeneration++;
      this.endOfScene();
    }

    return this;
  }

  private playMelody( notes, generation ): void {
    const order = 3;
    const newNotes = notes;

    // Taken from the sequence of pitches in "Forever in Blue Jeans" by Neil Diamond
    const idealMelody = mapToDomain([0,4,2,0,7,4,2,7,7,4,2,2,4,4,2,0], newNotes);
    const rhythmMappings = [0.5, 0.5, 0.5, 0.5, 0.5, 1, 2, 0.25, 0.5, 1, 1, 0.5, 0.5, 0.5, 0.25, 2 ]
      .map( ( rhythm, i ) => [idealMelody[i], rhythm]);
    const randomShiftAmount = Math.floor(Math.random() * (idealMelody.length));

    const initialState = [];
    for(let offset = order; offset >= 0; offset--) {
      initialState.push( idealMelody[mod(randomShiftAmount-offset, idealMelody.length)]);
    }

    const markovMelody = Pmarkov(idealMelody, order, initialState );

    let i = 0;
    const playNextNote = (generation) => {
      const octave = Math.ceil(Math.random() * 3) + Math.ceil(Math.random() * 3 ) + 2;
      const nextNote = markovMelody.next().value;
      const nextRhythm = rhythmMappings.filter( noteRhythm => noteRhythm[0] === nextNote);

      if(nextNote !== undefined && flipCoin(0.55) ) { // Sometimes probablities are zero, so we'll get an undefined next state
        this.config.melodyOscillators[i % this.config.melodyOscillators.length].play({
          freq: nextNote/octave,
          time: 1 + (Math.random() * 6),
          pan: (Math.random() * 1) - 0.5,
          vol: 0.35
        });
      }
      i++;

      window.setTimeout(() => {
        if(generation === this.currentGeneration && this.currentGeneration <= this.config.maxGenerations) {
          playNextNote(generation);
        }
      // }, ((Math.random() * 2) + 0.5) * 1000);
      }, ((choose(nextRhythm)[1] * 2) + 0.5) * 1000);
    }

    playNextNote(generation);

  }

  private endOfScene() {
    const onFinishCallback = this.config.onFinish;

    this.config.chordOscillators.map( synth => synth.stop(1) );

    window.setTimeout(onFinishCallback, 1000);
  }
}

