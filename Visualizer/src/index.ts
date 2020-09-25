import chalk from 'chalk';
import { exec } from 'child_process';
import { Command } from 'commander';
import { interpolateCool } from 'd3-scale-chromatic';
import fs from 'fs';
import { EOL } from 'os';
import { normalizeColorString } from './color';
import { Section } from './Section';

function myParseInt(value: string, _prev: number) {
    return parseInt(value);
}

const program = new Command();
program
    .option('-b, --bands <number>', 'number of bands', myParseInt, 8)
    .option('-s, --secondary', 'enable secondary decaying', false)
    .option('-r, --refresh', 'attempt to refresh skin', false)
    .parse(process.argv);

interface Options {
    bands: number;
    refresh: boolean;
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
        Formula: `(${timeMeasure.name} + 1) * 1000`,
    });

    sections.push(elapsedMSMeasure);
}

for (let i = 0; i < opts.bands; i++) {
    const bandNumber = `Band${i}`;

    const bandMeasure = new Section(`${bandNumber}Measure`, {
        Measure: 'Plugin',
        Plugin: 'AudioLevel',
        Parent: 'AudioLevelMeasure',
        Type: 'Band',
        BandIdx: i,
        Group: 'Audio',
    });

    sections.push(bandMeasure);

    const color = interpolateCool(i / opts.bands);
    const result =  normalizeColorString(color);
    const bandMeter = new Section(`${bandNumber}Meter`, {
        Meter: 'Bar',
        MeasureName: bandMeasure.name,
        MeterStyle: 'VisualizerBarStyle',
        BarColor: result,
    });

    sections.push(bandMeter);

    if (!opts.secondary) {
        continue;
    }

    const secondaryMeasure = new Section(`${bandNumber}SMeasure`);
    const decay = 0.01;
    const timerName = `${secondaryMeasure.name}Timer`;
    const deltaTime = `Min(${elapsedMS} - #${timerName}#, 5000)`;
    const timeFactor = `${decay} / 1000000 * (${deltaTime} ** 2)`;

    // const dynamic = `[${secondaryMeasure.name}] > [${bandMeasure.name}] ? [${secondaryMeasure.name}] - ${timeFactor} : [${bandMeasure.name}]`;
    // const kinematic = `[${secondaryMeasure.name}] > [${bandMeasure.name}] ? [${secondaryMeasure.name}] - ${decay} : [${bandMeasure.name}]`;
    // const fixed = `[${bandMeasure.name}]`;
    const dynamic = `[${secondaryMeasure.name}] - ${timeFactor}`;
    const kinematic = `[${secondaryMeasure.name}] - ${decay}`;
    const fixed = `[${bandMeasure.name}]`;

    secondaryMeasure.merge({
        Measure: 'Calc',
        Formula: `Max(${dynamic}, [${bandMeasure.name}])`,
        DynamicVariables: 1,
        IfCondition: `${secondaryMeasure.name} > ${bandMeasure.name}`,
        IfFalseAction: `[!SetVariable ${timerName} [${elapsedMS}]]`,
        Group: 'Audio',
    });

    variables.set(timerName, 0);
    sections.push(secondaryMeasure);

    const secondaryMeter = new Section(`${bandNumber}SMeter`, {
        Meter: 'Image',
        MeterStyle: 'SecondaryBarStyle',
        Y: `((1-[${secondaryMeasure.name}]) * #BarHeight#+#VERTICAL_INSETS#-#BARBHEIGHT#)`,
    });

    sections.push(secondaryMeter);
}

sections.forEach(writeSection);

writeStream.close();
console.log(chalk.cyan(`${writeStream.path} written`));

if (opts.refresh) {
    const cmd = '"%PROGRAMFILES%\\Rainmeter\\Rainmeter.exe" !Refresh SystemMonitor\\Visualizer';
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(chalk.green('Skin refreshed'));
    });
}
