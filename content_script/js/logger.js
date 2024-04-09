class YACLogger {
    prefix = 'Advanced Comments: ';

    constructor() {}

    debug(message) {
        console.debug(this.prefix + message);
    }
}

const yacLogger = new YACLogger();