const tokenizer = require('./tokenizer.js');
const parser = require('./parser.js');
const compiler = require('./compiler.js');

module.exports = {tokenizer: tokenizer, parser: parser, compileFrom: compiler};
