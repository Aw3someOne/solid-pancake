import { Command } from 'commander';
import fs from 'fs';
import { EOL } from 'os';
import { interpolateCool } from 'd3-scale-chromatic';

function myParseInt(value: string, _prev: number) {
    return parseInt(value);
}

const program = new Command();
program
    .option('-b, --bands <number>', 'number of bands', myParseInt, 8)
    .parse(process.argv);

interface Options {
    bands: number;
}

const opts = program.opts() as Options;

const writeStream = fs.createWriteStream('./generated.inc');

const write = (str: string) => writeStream.write(str);
const writeLine = (str: string) => write(str + EOL);
const writeSectionName = (str: string) => writeLine(`[${str}]`);
const writeSectionOptions = (obj: {[key: string]: any}) => {
    Object.entries(obj).forEach(([key, value]) => {
        writeLine(`${key}=${value}`);
    });
};

for (let i = 0; i < opts.bands; i++) {
    const measureName = `Band${i}Measure`;
    const measureOptions = {
        Measure: 'Plugin',
        Plugin: 'AudioLevel',
        Parent: 'AudioLevelMeasure',
        Type: 'Band',
        BandIdx: i,
    };
    writeSectionName(measureName);
    writeSectionOptions(measureOptions);

    const color = interpolateCool(i / opts.bands);
    const [, result] = /\(([^)]+)\)/.exec(color)!;
    const meterName = `Band${i}Meter`;
    const meterOptions = {
        Meter: 'Bar',
        MeasureName: measureName,
        MeterStyle: 'VisualizerBarStyle',
        BarColor: result,
    };
    writeSectionName(meterName);
    writeSectionOptions(meterOptions);
}

writeStream.close();
