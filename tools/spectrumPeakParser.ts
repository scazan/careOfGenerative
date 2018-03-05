import {ISpectrumConfig} from '../app/scripts/Scene';

const fs = require('fs');

const getMostProminentFrequencies = data => data
  .split('\r')
  .map( freqDB =>
    freqDB.split('\t')
      .map( elem => parseFloat(elem))
  )
  .filter( freqDB => (freqDB[0] < 10000) && (freqDB[0] >= 60) )
  .sort( (a, b) => b[1] - a[1] )
  .splice(0,16)
  .map( tuple => tuple[0] );


const spectrumDataPath = './tools/spectrumData';

const audioObjects:ISpectrumConfig[] = fs.readdirSync(spectrumDataPath).map(file => {
  const data = fs.readFileSync(spectrumDataPath + '/' + file, 'utf8');
  const spectrum = getMostProminentFrequencies(data);
  const audioFile = file.replace('.txt', '.mp3');

  return {
    audioFile,
    spectrum
  };
});

fs.writeFileSync('./app/scripts/spectralData.json', JSON.stringify(audioObjects));

console.log('Spectral data written');
