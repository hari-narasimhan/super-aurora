'use strict';

const knexRepository = require('..');
const assert = require('assert').strict;

assert.strictEqual(knexRepository(), 'Hello from knexRepository');
console.info('knexRepository tests passed');
