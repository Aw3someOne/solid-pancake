function parseString(value: string): [number, number, number] {
    let result = null;
    // rgb(r, g, b) format
    result = /\(([^)]+)\)/.exec(value);
    if (result) {
        const [r, g, b] = result[1].split(',').map(d => parseInt(d));
        return [r, g, b];
    }

    result = /#([0-9a-f]{6})/i.exec(value);
    if (result) {
        const [, hex] = result;
        return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
        ];
    }

    result = /#([0-9a-f]{3})/i.exec(value);
    if (result) {
        const [, hex] = result;
        const [r, g, b] = hex;
        return [
            parseInt(r, 16) * 0x11,
            parseInt(g, 16) * 0x11,
            parseInt(b, 16) * 0x11,
        ];
    }

    throw new Error('Invalid string');
}

function hexify(rgb: [number, number, number]): string {
    return '0x' + rgb.map(d => d.toString(16)).join('');
}

export const normalizeColorString = (value: string) => hexify(parseString(value));
