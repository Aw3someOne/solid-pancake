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
    .option('-s, --secondary <type | false>', 'enable secondary decaying', false)
    .option('-r, --refresh', 'attempt to refresh skin', false)
    .parse(process.argv);

interface Options {
    bands: number;
    output: string;
    refresh: boolean;
    secondary: 'kinematic' | 'dynamic' | false;
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
};

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
    const result = normalizeColorString(color);
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

    const fixed = `[${bandMeasure.name}]`;
    const kinematic = `[${secondaryMeasure.name}] - ${decay}`;
    const dynamic = `[${secondaryMeasure.name}] - ${timeFactor}`;

    let Formula = fixed;
    switch (opts.secondary) {
    case 'kinematic':
        Formula = `Max(${kinematic}, [${bandMeasure.name}])`;
        break;
    case 'dynamic':
        Formula = `Max(${dynamic}, [${bandMeasure.name}])`;
        break;
    }

    secondaryMeasure.merge({
        Measure: 'Calc',
        Formula,
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
    exec(cmd, (error, _stdout, _stderr) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(chalk.green('Skin refreshed'));
    });
}
