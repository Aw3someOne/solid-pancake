type ValueType = string | number;

interface Options {
    [key: string]: ValueType;
}

export class Section {
    private readonly _name: string;
    private readonly _options: Options;

    constructor(name: string, options: Options = {}) {
        this._name = name;
        this._options = options;
    }

    public get name() {
        return this._name;
    }

    public entries() {
        return Object.entries(this._options);
    }

    public getValue(key: string) {
        return this._options[key];
    }

    public set(key: string, value: ValueType) {
        this._options[key] = value;
        return this;
    }

    public merge(opts: Options) {
        Object.entries(opts).forEach(([key, value]) => {
            this.set(key, value);
        });
        return this;
    }
}
