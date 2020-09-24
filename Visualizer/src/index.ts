import { Command } from 'commander';
import fs from 'fs';
import { EOL } from 'os';
import { interpolateCool } from 'd3-scale-chromatic';
import { normalizeColorString } from './color';
import { Section } from './Section';

function myParseInt(value: string, _prev: number) {
    return parseInt(value);
}

const program = new Command();
program
    .option('-b, --bands <number>', 'number of bands', myParseInt, 8)
    .option('-s, --secondary', 'enable secondary decaying', false)
    .parse(process.argv);

interface Options {
    bands: number;
    secondary: boolean;
}

const opts = program.opts() as Options;

const writeStream = fs.createWriteStream('./generated.inc');

const write = (str: string) => writeStream.write(str);
const writeLine = (str: string) => write(str + EOL);
const writeSectionName = (str: string) => writeLine(`[${str}]`);
const writeSection = (section: Section) => {
    writeSectionName(section.name);
    section.entries().forEach(([key, value]) => {
        writeLine(`${key}=${value}`);
    });
}

const sections: Section[] = [];

const variables = new Section('Variables');
sections.push(variables);

const elapsedMS = 'ElapsedMS';
if (opts.secondary) {
    const timeMeasure = new Section('TimeMeasure', {
        Measure: 'Time',
        AverageSize: 60,
    });

    sections.push(timeMeasure);

    const elapsedMSMeasure = new Section(elapsedMS, {
        Measure: 'Calc',
        Formula: `(${timeMeasure.name} + 1) * 1000`
    });

    sections.push(elapsedMSMeasure);
}

for (let i = 0; i < opts.bands; i++) {
    const bandMeasure = new Section(`Band${i}Measure`, {
        Measure: 'Plugin',
        Plugin: 'AudioLevel',
        Parent: 'AudioLevelMeasure',
        Type: 'Band',
        BandIdx: i,
    });

    sections.push(bandMeasure);

    const color = interpolateCool(i / opts.bands);
    const result =  normalizeColorString(color);
    const bandMeter = new Section(`Band${i}Meter`, {
        Meter: 'Bar',
        MeasureName: bandMeasure.name,
        MeterStyle: 'VisualizerBarStyle',
        BarColor: result,
    });

    sections.push(bandMeter);

    if (!opts.secondary) {
        continue;
    }

    const secondaryMeasure = new Section(`Band${i}SMeasure`);
    const decay = 0.01;
    const timerName = `${secondaryMeasure.name}Timer`;
    const deltaTime = `(#${timerName}# - ${elapsedMS})`;
    secondaryMeasure.merge({
        Measure: 'Calc',
        // Formula: `[${secondaryMeasure.name}] > [${bandMeasure.name}] ? [${secondaryMeasure.name}] - ${decay} * ${deltaTime} * ${deltaTime} : [${bandMeasure.name}]`,
        Formula: `[${secondaryMeasure.name}] > [${bandMeasure.name}] ? [${secondaryMeasure.name}] - ${decay} : [${bandMeasure.name}]`,
        // Formula: `[${bandMeasure.name}]`,
        DynamicVariables: 1,
        IfCondition1: `${secondaryMeasure.name} > [${bandMeasure.name}]`,
        IfFalseAction1: `!SetVariable ${timerName} [${elapsedMS}]`,
    });

    variables.set(timerName, 0);
    sections.push(secondaryMeasure);

    const secondaryMeter = new Section(`Band${i}SMeter`, {
        Meter: 'Image',
        MeterStyle: 'SecondaryBarStyle',
        Y: `((1-[${secondaryMeasure.name}]) * #BarHeight#+#VERTICAL_INSETS#-#BARBHEIGHT#)`,
    });

    sections.push(secondaryMeter);
}

sections.forEach(writeSection);

writeStream.close();
