const fs = require("fs");

/**
 * @class FileReader
 * @module FileReader
 */
class FileReader {

    exists(file) {
        return fs.existsSync(file);
    }

    read(file) {
       return fs.readFileSync(file, 'utf8');
    }

}

module.exports = FileReader;
