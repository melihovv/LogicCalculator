/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _parser = __webpack_require__(2);
	
	var _parser2 = _interopRequireDefault(_parser);
	
	var _logicCalculator = __webpack_require__(1);
	
	var _logicCalculator2 = _interopRequireDefault(_logicCalculator);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	describe('Logic calculator', function () {
	    describe('calc', function () {
	        var calculate = function calculate(str, context) {
	            return _logicCalculator2.default.calc(_parser2.default.parse(str).ast, context);
	        };
	
	        it('must substitute variable with its value', function () {
	            calculate('A', { vars: { A: true } }).must.be.truthy();
	            calculate('A', { vars: { A: false } }).must.be.falsy();
	        });
	
	        it('must understand 0 and 1', function () {
	            calculate('0').must.be.falsy();
	            calculate('1').must.be.truthy();
	        });
	
	        it('must calc expression which consist from constants only', function () {
	            calculate('0|0').must.be.falsy();
	            calculate('0|1').must.be.truthy();
	        });
	
	        it('must understand negative operator', function () {
	            calculate('!A', { vars: { A: true } }).must.be.falsy();
	            calculate('!A', { vars: { A: false } }).must.be.truthy();
	            calculate('!!A', { vars: { A: true } }).must.be.truthy();
	            calculate('!!A', { vars: { A: false } }).must.be.falsy();
	        });
	
	        it('must understand disjunction operator', function () {
	            calculate('A|B', { vars: { A: true, B: true } }).must.be.truthy();
	            calculate('A|B', { vars: { A: true, B: false } }).must.be.truthy();
	            calculate('A|B', { vars: { A: false, B: true } }).must.be.truthy();
	            calculate('A|B', { vars: { A: false, B: false } }).must.be.falsy();
	        });
	
	        it('must understand conjunction operator', function () {
	            calculate('A&B', { vars: { A: true, B: true } }).must.be.truthy();
	            calculate('A&B', { vars: { A: true, B: false } }).must.be.falsy();
	            calculate('A&B', { vars: { A: false, B: true } }).must.be.falsy();
	            calculate('A&B', { vars: { A: false, B: false } }).must.be.falsy();
	        });
	
	        it('must understand implication operator', function () {
	            calculate('A->B', { vars: { A: true, B: true } }).must.be.truthy();
	            calculate('A->B', { vars: { A: true, B: false } }).must.be.falsy();
	            calculate('A->B', { vars: { A: false, B: true } }).must.be.truthy();
	            calculate('A->B', { vars: { A: false, B: false } }).must.be.truthy();
	        });
	
	        it('must understand equivalence operator', function () {
	            calculate('A<->B', { vars: { A: true, B: true } }).must.be.truthy();
	            calculate('A<->B', { vars: { A: true, B: false } }).must.be.falsy();
	            calculate('A<->B', { vars: { A: false, B: true } }).must.be.falsy();
	            calculate('A<->B', { vars: { A: false, B: false } }).must.be.truthy();
	        });
	
	        it('must execute disjuction first and implication second', function () {
	            calculate('A->B|C', { vars: { A: true, B: true, C: false } }).must.be.truthy();
	
	            calculate('A->B|C', { vars: { A: true, B: false, C: false } }).must.be.falsy();
	        });
	
	        it('must execute conjunction first and disjunction second', function () {
	            calculate('A|B&C', { vars: { A: false, B: true, C: false } }).must.be.falsy();
	
	            calculate('A|B&C', { vars: { A: false, B: false, C: true } }).must.be.falsy();
	        });
	
	        it('must execute expression between parenthesis first', function () {
	            calculate('(A->B)&A', { vars: { A: false, B: true } }).must.be.falsy();
	            calculate('(A->B)&A', { vars: { A: true, B: true } }).must.be.truthy();
	        });
	
	        it('must execute complex expressions', function () {
	            calculate('(!!A->B)&(A)', { vars: { A: false, B: true } }).must.be.falsy();
	
	            calculate('(A->B)&(A|A)', { vars: { A: false, B: true } }).must.be.falsy();
	
	            calculate('A|B|C', { vars: { A: false, B: true, C: true } }).must.be.truthy();
	
	            calculate('A&B&C', { vars: { A: false, B: true, C: true } }).must.be.falsy();
	
	            calculate('A->B&C', { vars: { A: false, B: true, C: true } }).must.be.true();
	
	            calculate('A->B->C', { vars: { A: false, B: true, C: true } }).must.be.truthy();
	
	            calculate('A->B->C', { vars: { A: true, B: false, C: true } }).must.be.truthy();
	
	            calculate('A->B->!C', { vars: { A: true, B: false, C: true } }).must.be.truthy();
	
	            calculate('!(A->B)&((!C)|D)', {
	                vars: { A: true, B: false, C: true, D: false }
	            }).must.be.falsy();
	
	            calculate('A<->B<->C', { vars: { A: true, B: false, C: true } }).must.be.falsy();
	
	            calculate('a->b->c', { vars: { a: true, b: true, c: false } }).must.be.falsy();
	
	            calculate('a->b->c', { vars: { a: true, b: false, c: true } }).must.be.truthy();
	        });
	    });
	
	    describe('truthTable', function () {
	        var truthTable = function truthTable(str) {
	            return new _logicCalculator2.default(str).truthTable();
	        };
	
	        it('must return truth table for simple one variable expression', function () {
	            truthTable('a').must.eql([[0, 0], [1, 1]]);
	        });
	
	        it('must return truth table for disjunction', function () {
	            truthTable('a|b').must.eql([[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]]);
	        });
	
	        it('must return truth table for conjunction', function () {
	            truthTable('a&b').must.eql([[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]]);
	        });
	
	        it('must return truth table for implication', function () {
	            truthTable('a->b').must.eql([[0, 0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 1]]);
	        });
	
	        it('must return truth table for several implications', function () {
	            truthTable('a->b->c').must.eql([[0, 0, 0, 1], [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 1, 1], [1, 0, 0, 1], [1, 0, 1, 1], [1, 1, 0, 0], [1, 1, 1, 1]]);
	        });
	
	        it('must return truth table for equivalence', function () {
	            truthTable('a<->b').must.eql([[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]]);
	        });
	
	        it('must return truth table for constant', function () {
	            truthTable('1').must.eql([[1]]);
	            truthTable('0').must.eql([[0]]);
	        });
	    });
	
	    describe('functionType', function () {
	        var logicCalc = function logicCalc(str) {
	            return new _logicCalculator2.default(str);
	        };
	
	        it('must properly recognize function which always returns true', function () {
	            var lc = logicCalc('a<->a');
	            lc.isIdenticallyTrue.must.be.truthy();
	            lc.isIdenticallyFalse.must.be.falsy();
	            lc.isDoable.must.be.truthy();
	            lc.isRebuttable.must.be.falsy();
	        });
	
	        it('must properly recognize function which always returns false', function () {
	            var lc = logicCalc('a<->!a');
	            lc.isIdenticallyTrue.must.be.falsy();
	            lc.isIdenticallyFalse.must.be.truthy();
	            lc.isDoable.must.be.falsy();
	            lc.isRebuttable.must.be.truthy();
	        });
	
	        it('must properly recognize function which may return false or true', function () {
	            var lc = logicCalc('a|b');
	            lc.isIdenticallyTrue.must.be.falsy();
	            lc.isIdenticallyFalse.must.be.falsy();
	            lc.isDoable.must.be.truthy();
	            lc.isRebuttable.must.be.truthy();
	        });
	
	        it('must properly recognize constant function', function () {
	            var lc1 = logicCalc('1');
	            lc1.isIdenticallyTrue.must.be.truthy();
	            lc1.isIdenticallyFalse.must.be.falsy();
	            lc1.isDoable.must.be.truthy();
	            lc1.isRebuttable.must.be.falsy();
	
	            var lc2 = logicCalc('0');
	            lc2.isIdenticallyTrue.must.be.falsy();
	            lc2.isIdenticallyFalse.must.be.truthy();
	            lc2.isDoable.must.be.falsy();
	            lc2.isRebuttable.must.be.truthy();
	        });
	    });
	
	    describe('pcnf', function () {
	        var pcnf = function pcnf(str) {
	            return new _logicCalculator2.default(str).pcnf();
	        };
	
	        it('must return a proper pcnf for simple logical expression ' + 'containing only one variable', function () {
	            pcnf('a').must.equal('(a)');
	        });
	
	        it('must return a proper pcnf for conjunction', function () {
	            pcnf('a&b').must.equal('(a|b)&(a|!b)&(!a|b)');
	        });
	
	        it('must return a proper pcnf for disjuntion', function () {
	            pcnf('a|b').must.equal('(a|b)');
	        });
	
	        it('must return a proper pcnf for implication', function () {
	            pcnf('a->b').must.equal('(!a|b)');
	        });
	
	        it('must return a proper pcnf for equivalence', function () {
	            pcnf('a<->b').must.equal('(a|!b)&(!a|b)');
	        });
	
	        it('must return a proper pcnf for complicated expression', function () {
	            pcnf('(A&!C)|(A&B&C)|(A&C)').must.equal('(A|B|C)&(A|B|!C)&(A|!B|C)&(A|!B|!C)');
	        });
	
	        it('must return a proper pcnf for expression where might be constants', function () {
	            pcnf('a->0').must.equal('(!a)');
	        });
	
	        it('must return a proper pcnf for constant expression', function () {
	            pcnf('1').must.equal('1');
	            pcnf('0').must.equal('0');
	        });
	    });
	
	    describe('pdnf', function () {
	        var pdnf = function pdnf(str) {
	            return new _logicCalculator2.default(str).pdnf();
	        };
	
	        it('must return the proper pdnf for simple logical expression ' + 'containing only one variable', function () {
	            pdnf('a').must.equal('(a)');
	        });
	
	        it('must return the proper pdnf for conjunction', function () {
	            pdnf('a&b').must.equal('(a&b)');
	        });
	
	        it('must return the proper pdnf for disjuntion', function () {
	            pdnf('a|b').must.equal('(!a&b)|(a&!b)|(a&b)');
	        });
	
	        it('must return the proper pdnf for implication', function () {
	            pdnf('a->b').must.equal('(!a&!b)|(!a&b)|(a&b)');
	        });
	
	        it('must return the proper pdnf for equivalence', function () {
	            pdnf('a<->b').must.equal('(!a&!b)|(a&b)');
	        });
	
	        it('must return the proper pdnf for complicated expression', function () {
	            pdnf('(A&!C)|(A&B&C)|(A&C)').must.equal('(A&!B&!C)|(A&!B&C)|(A&B&!C)|(A&B&C)');
	        });
	
	        it('must return the proper pdnf for expression where might be ' + 'constants', function () {
	            pdnf('a->0').must.equal('(!a)');
	        });
	
	        it('must return a proper pdnf for constant expression', function () {
	            pdnf('1').must.equal('1');
	            pdnf('0').must.equal('0');
	        });
	    });
	
	    describe('isSelfDual', function () {
	        var isSelfDual = function isSelfDual(str) {
	            return new _logicCalculator2.default(str).isSelfDual();
	        };
	
	        it('must return true', function () {
	            isSelfDual('a').must.be.truthy();
	            isSelfDual('!a').must.be.truthy();
	            isSelfDual('1').must.be.truthy();
	            isSelfDual('0').must.be.truthy();
	        });
	
	        it('must return false', function () {
	            isSelfDual('a|b').must.be.falsy();
	            isSelfDual('a&b').must.be.falsy();
	        });
	    });
	
	    describe('selfDual', function () {
	        var isDual = function isDual(str1, str2) {
	            var lc1 = new _logicCalculator2.default(str1);
	            var lc2 = new _logicCalculator2.default(str2);
	            return lc1.isDual(lc2.truthTable());
	        };
	
	        it('must return true', function () {
	            isDual('a|b', 'a&b').must.be.truthy();
	        });
	
	        it('must return false', function () {
	            isDual('a|b', 'a->b').must.be.falsy();
	        });
	    });
	
	    describe('mcnf', function () {
	        var mcnf = function mcnf(str) {
	            var lc = new _logicCalculator2.default(str);
	            lc.pcnf();
	            return lc.mcnf();
	        };
	
	        it('must properly evaluate mcnf', function () {
	            mcnf('a&b').must.equal('(a)&(b)');
	        });
	    });
	
	    describe('mdnf', function () {
	        var mdnf = function mdnf(str) {
	            var lc = new _logicCalculator2.default(str);
	            lc.pdnf();
	            return lc.mdnf();
	        };
	
	        it('must properly evaluate mdnf', function () {
	            // (!a&!b&!c&d)|(!a&!b&c&d)|(!a&b&!c&d)|(!a&b&c&d)|(a&b&c&!d)|(a&b&c&d)
	            mdnf('(!a&!b&!c&d)|(!a&!b&c&d)|(!a&b&!c&d)|(!a&b&c&d)|' + '(a&b&c&!d)|(a&b&c&d)').must.equal('(a&b&c)|(!a&d)');
	
	            mdnf('a&b').must.equal('(a&b)');
	        });
	    });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _parser = __webpack_require__(2);
	
	var _parser2 = _interopRequireDefault(_parser);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Replace the character at the specified index.
	 * @param {int} index
	 * @param {string} character
	 * @returns {string}
	 */
	String.prototype.replaceAt = function (index, character) {
	    return this.substr(0, index) + character + this.substr(index + character.length);
	};
	
	/**
	 * Logic calculator class.
	 */
	
	var LogicCalculator = (function () {
	    /**
	     * Construct LogicCalculator.
	     * @param {string} text
	     */
	
	    function LogicCalculator(text) {
	        _classCallCheck(this, LogicCalculator);
	
	        var parseResult = _parser2.default.parse(text);
	        this.ast = parseResult.ast;
	        this.varsNames = parseResult.varsNames;
	        this._truthTable = [];
	
	        this.isIdenticallyTrue = null;
	        this.isIdenticallyFalse = null;
	        this.isRebuttable = null;
	        this.isDoable = null;
	
	        this._isSelfDual = null;
	
	        this._pcnf = null;
	        this._pdnf = null;
	        this._mcnf = null;
	        this._mdnf = null;
	
	        this.truthTable();
	    }
	
	    /**
	     * Get truth table.
	     * @returns {Array}
	     */
	
	    _createClass(LogicCalculator, [{
	        key: 'truthTable',
	        value: function truthTable() {
	            var _this = this;
	
	            if (this._truthTable.length) {
	                return this._truthTable;
	            }
	
	            if (this.varsNames.length === 0) {
	                var result = Number(LogicCalculator.calc(this.ast));
	                this._isSelfDual = true;
	                if (result === 1) {
	                    this.isIdenticallyTrue = true;
	                    this.isDoable = true;
	                    this.isIdenticallyFalse = false;
	                    this.isRebuttable = false;
	                    this._pcnf = '1';
	                    this._pdnf = '1';
	                    this._mcnf = '1';
	                    this._mdnf = '1';
	                } else {
	                    this.isIdenticallyTrue = false;
	                    this.isDoable = false;
	                    this.isIdenticallyFalse = true;
	                    this.isRebuttable = true;
	                    this._pcnf = '0';
	                    this._pdnf = '0';
	                    this._mcnf = '0';
	                    this._mdnf = '0';
	                }
	                this._truthTable = [[result]];
	                return this._truthTable;
	            }
	
	            var rows = [];
	            var rowsAmount = Math.pow(2, this.varsNames.length);
	
	            this.isIdenticallyTrue = true;
	            var isntAlwaysFalse = false;
	
	            var _loop = function _loop(i) {
	                var binString = Number(i).toString(2);
	                if (binString.length !== _this.varsNames.length) {
	                    var diff = _this.varsNames.length - binString.length;
	                    binString = new Array(diff + 1).join('0') + binString;
	                }
	
	                var numbers = [];
	                var binStringLength = binString.length;
	                for (var j = 0; j < binStringLength; ++j) {
	                    numbers.push(Number(binString[j]));
	                }
	
	                var vars = {};
	                var counter = 0;
	                _this.varsNames.forEach(function (value) {
	                    vars[value] = numbers[counter++];
	                });
	
	                var result = Number(LogicCalculator.calc(_this.ast, { vars: vars }));
	                numbers.push(result);
	                rows.push(numbers);
	
	                _this.isIdenticallyTrue = _this.isIdenticallyTrue && result;
	                isntAlwaysFalse = isntAlwaysFalse || result;
	            };
	
	            for (var i = 0; i < rowsAmount; ++i) {
	                _loop(i);
	            }
	
	            this._truthTable = rows;
	
	            if (this.isIdenticallyTrue) {
	                this.isDoable = true;
	                this.isRebuttable = false;
	                this.isIdenticallyFalse = false;
	            } else if (!isntAlwaysFalse) {
	                this.isIdenticallyFalse = true;
	                this.isRebuttable = true;
	                this.isDoable = false;
	            } else {
	                this.isIdenticallyFalse = false;
	                this.isDoable = true;
	                this.isRebuttable = true;
	            }
	
	            return rows;
	        }
	
	        /**
	         * Calculate logical expression.
	         * @param {object} ast
	         * @param {object} context
	         * @returns {boolean}
	         */
	
	    }, {
	        key: 'pcnf',
	
	        /**
	         * Get perfect conjunctive normal form of truth table.
	         * @returns {string}
	         */
	        value: function pcnf() {
	            if (this._pcnf !== null) {
	                return this._pcnf;
	            }
	
	            this._pcnf = this.pnf(0, '|', '&');
	
	            return this._pcnf;
	        }
	
	        /**
	         * Get perfect disjunctive normal form of truth table.
	         * @returns {string}
	         */
	
	    }, {
	        key: 'pdnf',
	        value: function pdnf() {
	            if (this._pdnf !== null) {
	                return this._pdnf;
	            }
	
	            this._pdnf = this.pnf(1, '&', '|');
	
	            if (this.isIdenticallyFalse) {
	                this._pdnf = '0';
	            }
	
	            return this._pdnf;
	        }
	
	        /**
	         * Get normal form.
	         * @param {int} digit
	         * @param {string} char1
	         * @param {string} char2
	         * @returns {string}
	         */
	
	    }, {
	        key: 'pnf',
	        value: function pnf(digit, char1, char2) {
	            var _this2 = this;
	
	            var varsAmount = Math.log2(this._truthTable.length);
	            var result = '';
	
	            var rowsAmount = this._truthTable.length;
	            this._truthTable.forEach(function (row, index) {
	                if (row[varsAmount] === digit) {
	                    result += '(';
	
	                    var length = row.length;
	                    for (var i = 0; i < length - 1; ++i) {
	                        if (row[i] === digit) {
	                            result += _this2.varsNames[i];
	                        } else {
	                            result += '!' + _this2.varsNames[i];
	                        }
	
	                        if (i !== length - 2) {
	                            result += char1;
	                        }
	                    }
	
	                    result += ')';
	
	                    if (index !== rowsAmount - 1) {
	                        result += char2;
	                    }
	                }
	            });
	
	            if (result === '') {
	                result = '1';
	            } else {
	                result = result[result.length - 1] === char2 ? result.substring(0, result.length - 1) : result;
	            }
	
	            return result;
	        }
	
	        /**
	         * Check if the function is self-dual.
	         * @returns {boolean}
	         */
	
	    }, {
	        key: 'isSelfDual',
	        value: function isSelfDual() {
	            if (this._isSelfDual !== null) {
	                return this._isSelfDual;
	            }
	
	            var length = this._truthTable.length;
	            var varsAmount = Math.log2(length);
	
	            var middle = length / 2;
	            for (var i = 0; i < length / 2; ++i) {
	                if (this._truthTable[i][varsAmount] === this._truthTable[middle + i][varsAmount]) {
	                    this._isSelfDual = false;
	                    return false;
	                }
	            }
	
	            this._isSelfDual = true;
	            return true;
	        }
	
	        /**
	         * Check if functions are dual.
	         * @param {Array} truthTable
	         * @returns {boolean}
	         */
	
	    }, {
	        key: 'isDual',
	        value: function isDual(truthTable) {
	            var length = this._truthTable.length;
	            if (length !== truthTable.length) {
	                return false;
	            }
	            var varsAmount = Math.log2(length);
	
	            for (var i = 0; i < length; ++i) {
	                if (this._truthTable[i][varsAmount] === truthTable[length - i - 1][varsAmount]) {
	                    return false;
	                }
	            }
	
	            return true;
	        }
	
	        /**
	         * Get minimal disjunctive normal form.
	         * @returns {string}
	         */
	
	    }, {
	        key: 'mdnf',
	        value: function mdnf() {
	            if (this._mdnf !== null) {
	                return this._mdnf;
	            }
	
	            var tmp = this._pdnf.replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0').replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1').replace(/[\(\)&]/g, '').split('|');
	
	            var result = '';
	            if (tmp.length) {
	                var result2 = LogicCalculator.quineMcCluskey(tmp);
	                var h = this.varsNames;
	                var opsize = h.length;
	
	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;
	
	                try {
	                    for (var _iterator = result2[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var t = _step.value;
	
	                        var tmp2 = '';
	                        for (var i = 0; i < opsize; ++i) {
	                            if (t[i] === '1') {
	                                tmp2 += h[i] + '&';
	                            } else if (t[i] === '0') {
	                                tmp2 += '!' + h[i] + '&';
	                            }
	                        }
	
	                        tmp2 = tmp2.slice(0, -1);
	                        result += '(' + tmp2 + ')|';
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator.return) {
	                            _iterator.return();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }
	            }
	
	            this._mdnf = result.slice(0, -1);
	
	            if (this.isIdenticallyTrue) {
	                this._mdnf = '1';
	            } else if (this.isIdenticallyFalse) {
	                this._mdnf = '0';
	            }
	
	            return this._mdnf;
	        }
	
	        /**
	         * Get minimal conjunctive normal form.
	         * @returns {string}
	         */
	
	    }, {
	        key: 'mcnf',
	        value: function mcnf() {
	            if (this._mcnf !== null) {
	                return this._mcnf;
	            }
	
	            var tmp = this._pcnf.replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0').replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1').replace(/[\(\)|]/g, '').split('&');
	
	            var result = '';
	            if (tmp.length) {
	                var result2 = LogicCalculator.quineMcCluskey(tmp);
	                var h = this.varsNames;
	                var opsize = h.length;
	
	                var _iteratorNormalCompletion2 = true;
	                var _didIteratorError2 = false;
	                var _iteratorError2 = undefined;
	
	                try {
	                    for (var _iterator2 = result2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                        var t = _step2.value;
	
	                        var tmp2 = '';
	                        for (var i = 0; i < opsize; ++i) {
	                            if (t[i] === '1') {
	                                tmp2 += h[i] + '|';
	                            } else if (t[i] === '0') {
	                                tmp2 += '!' + h[i] + '|';
	                            }
	                        }
	
	                        tmp2 = tmp2.slice(0, -1);
	                        result += '(' + tmp2 + ')&';
	                    }
	                } catch (err) {
	                    _didIteratorError2 = true;
	                    _iteratorError2 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                            _iterator2.return();
	                        }
	                    } finally {
	                        if (_didIteratorError2) {
	                            throw _iteratorError2;
	                        }
	                    }
	                }
	            }
	
	            this._mcnf = result.slice(0, -1);
	
	            if (this.isIdenticallyTrue) {
	                this._mcnf = '1';
	            } else if (this.isIdenticallyFalse) {
	                this._mcnf = '0';
	            }
	
	            return this._mcnf;
	        }
	
	        /**
	         * Find minimal perfect form.
	         * @param {Array} constituents
	         * @returns {Array}
	         */
	
	    }], [{
	        key: 'calc',
	        value: function calc(ast, context) {
	            var _this3 = this;
	
	            var vars = (typeof context === 'undefined' ? 'undefined' : _typeof(context)) === 'object' ? context.vars : {};
	            var nodeType = ast.type;
	            var result = undefined;
	
	            switch (nodeType) {
	                case 'variable':
	                    result = vars[ast.value];
	                    break;
	                case 'digit':
	                    result = !!ast.value;
	                    break;
	                case 'negation':
	                    result = !this.calc(ast.child, context);
	                    break;
	                case 'or':
	                    result = this.calc(ast.left, context);
	                    ast.right.forEach(function (node) {
	                        result = result || _this3.calc(node, context);
	                    });
	                    break;
	                case 'and':
	                    result = this.calc(ast.left, context);
	                    ast.right.forEach(function (node) {
	                        result = result && _this3.calc(node, context);
	                    });
	                    break;
	                case 'implication':
	                    var left = this.calc(ast.left, context);
	                    var copy = ast.right.slice();
	                    copy.reverse();
	                    var flag = false;
	                    var right = copy.reduce(function (res, node) {
	                        if (flag === false) {
	                            flag = true;
	                            return _this3.calc(node, context);
	                        }
	                        return !_this3.calc(node, context) || res;
	                    }, false);
	                    result = !left || right;
	                    break;
	                case 'equivalence':
	                    var leftResult = this.calc(ast.left, context);
	                    ast.right.forEach(function (node) {
	                        var rightResult = _this3.calc(node, context);
	                        result = (!leftResult || rightResult) && (leftResult || !rightResult);
	                        leftResult = rightResult;
	                    });
	                    break;
	            }
	
	            return result;
	        }
	    }, {
	        key: 'quineMcCluskey',
	        value: function quineMcCluskey(constituents) {
	            var groups = [];
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;
	
	            try {
	                for (var _iterator3 = constituents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var constituent = _step3.value;
	
	                    var index = (constituent.match(/1/g) || []).length;
	                    if (!groups[index]) {
	                        groups[index] = [];
	                    }
	                    groups[index].push(constituent + '+');
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                        _iterator3.return();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }
	
	            for (var i = 0; i < groups.length; ++i) {
	                if (groups[i] === undefined) {
	                    groups[i] = [];
	                }
	            }
	
	            var primeImplicants = LogicCalculator.findPrimeImplicants(groups);
	            var table = [];
	            for (var i = 0; i < primeImplicants.length; ++i) {
	                table.push([]);
	                for (var j = 0; j < constituents.length; ++j) {
	                    table[i].push(LogicCalculator.isCover(primeImplicants[i], constituents[j]));
	                }
	            }
	
	            var result2 = LogicCalculator.petricMethod(table);
	            var result = [];
	            for (var i = 0; i < result2.length; ++i) {
	                if (result2[i] === '1') {
	                    result.push(primeImplicants[i]);
	                }
	            }
	            return result;
	        }
	
	        /**
	         * Find deadlock normal form.
	         * @param {Array} table
	         * @returns {string}
	         */
	
	    }, {
	        key: 'petricMethod',
	        value: function petricMethod(table) {
	            var I = [];
	            for (var i = 0; i < table.length; ++i) {
	                var tmp = new Array(table.length + 1).join('-');
	                tmp = tmp.replaceAt(i, '1');
	                I.push(tmp);
	            }
	
	            var product = [];
	            for (var i = 0; i < table.length; ++i) {
	                if (table[i][0]) {
	                    product.push(I[i]);
	                }
	            }
	
	            for (var j = 1; j < table[0].length; ++j) {
	                var tmp = [];
	                var pp = product;
	                for (var i = 0; i < table.length; ++i) {
	                    if (table[i][j]) {
	                        tmp.push(I[i]);
	                    }
	                }
	
	                product = [];
	                var _iteratorNormalCompletion4 = true;
	                var _didIteratorError4 = false;
	                var _iteratorError4 = undefined;
	
	                try {
	                    for (var _iterator4 = pp[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                        var p = _step4.value;
	                        var _iteratorNormalCompletion5 = true;
	                        var _didIteratorError5 = false;
	                        var _iteratorError5 = undefined;
	
	                        try {
	                            var _loop2 = function _loop2() {
	                                var t = _step5.value;
	
	                                var n = new Array(table.length + 1).join('-');
	                                for (var i = 0; i < t.length; ++i) {
	                                    if (p[i] === '1' || t[i] === '1') {
	                                        n = n.replaceAt(i, '1');
	                                    }
	                                }
	
	                                var isAddN = true;
	                                var isDel = false;
	                                product.forEach(function (item, index, array) {
	                                    var resf = LogicCalculator.findPosToMinimize(item, n, n.length);
	                                    if (resf !== -1 || item === n) {
	                                        isAddN = false;
	                                    }
	
	                                    if (resf !== -1 && (n.match(/1/g) || []).length < (item.match(/1/g) || []).length) {
	                                        array.splice(index, 1);
	                                        isDel = true;
	                                    }
	                                });
	
	                                if (isAddN || isDel) {
	                                    product.push(n);
	                                }
	                            };
	
	                            for (var _iterator5 = tmp[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                                _loop2();
	                            }
	                        } catch (err) {
	                            _didIteratorError5 = true;
	                            _iteratorError5 = err;
	                        } finally {
	                            try {
	                                if (!_iteratorNormalCompletion5 && _iterator5.return) {
	                                    _iterator5.return();
	                                }
	                            } finally {
	                                if (_didIteratorError5) {
	                                    throw _iteratorError5;
	                                }
	                            }
	                        }
	                    }
	                } catch (err) {
	                    _didIteratorError4 = true;
	                    _iteratorError4 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                            _iterator4.return();
	                        }
	                    } finally {
	                        if (_didIteratorError4) {
	                            throw _iteratorError4;
	                        }
	                    }
	                }
	            }
	
	            var imin = table.length + 1;
	            var result = '';
	            var _iteratorNormalCompletion6 = true;
	            var _didIteratorError6 = false;
	            var _iteratorError6 = undefined;
	
	            try {
	                for (var _iterator6 = product[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	                    var p = _step6.value;
	
	                    if ((p.match(/1/g) || []).length < imin) {
	                        result = p;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError6 = true;
	                _iteratorError6 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                        _iterator6.return();
	                    }
	                } finally {
	                    if (_didIteratorError6) {
	                        throw _iteratorError6;
	                    }
	                }
	            }
	
	            return result;
	        }
	
	        /**
	         * Find prime implicants.
	         * @param {Array} groups
	         * @returns {Array}
	         */
	
	    }, {
	        key: 'findPrimeImplicants',
	        value: function findPrimeImplicants(groups) {
	            var n = groups[groups.length - 1][0].length - 1;
	            var result = [];
	            var isAllImplicantsFound = false;
	
	            while (!isAllImplicantsFound) {
	                isAllImplicantsFound = true;
	                var tmp = [];
	
	                // Try to minimize i and i + 1 groups.
	                for (var i = 0; i < groups.length; ++i) {
	                    if (groups[i] === undefined) {
	                        continue;
	                    }
	
	                    tmp.push([]);
	                    for (var gi = 0; gi < groups[i].length; ++gi) {
	                        for (var gj = 0; i + 1 < groups.length && gj < groups[i + 1].length; ++gj) {
	
	                            var pos = LogicCalculator.findPosToMinimize(groups[i][gi], groups[i + 1][gj], n);
	
	                            if (pos !== -1) {
	                                var newNotation = groups[i][gi];
	                                newNotation = newNotation.replaceAt(pos, '*');
	                                newNotation = newNotation.replaceAt(n, '+');
	
	                                if (tmp[tmp.length - 1].indexOf(newNotation) === -1) {
	                                    tmp[tmp.length - 1].push(newNotation);
	                                }
	
	                                isAllImplicantsFound = false;
	                                groups[i][gi] = groups[i][gi].replaceAt(n, '-');
	                                groups[i + 1][gj] = groups[i + 1][gj].replaceAt(n, '-');
	                            }
	                        }
	
	                        if (groups[i][gi][n] === '+') {
	                            result.push(groups[i][gi].slice(0, -1));
	                        }
	                    }
	
	                    if (tmp[tmp.length - 1].length === 0) {
	                        tmp.pop();
	                    }
	                }
	
	                groups = tmp;
	            }
	
	            for (var i = 0; i < groups.length; ++i) {
	                for (var j = 0; j < groups[i].length; ++j) {
	                    result.push(groups[i][j].slice(0, -1));
	                }
	            }
	
	            return result;
	        }
	
	        /**
	         * Find position of glue.
	         * @param {string} a
	         * @param {string} b
	         * @param {int} n
	         * @returns {number}
	         */
	
	    }, {
	        key: 'findPosToMinimize',
	        value: function findPosToMinimize(a, b, n) {
	            var diff = 0;
	            var result = -1;
	
	            for (var i = 0; i < n; ++i) {
	                if (a[i] !== b[i]) {
	                    ++diff;
	                    result = i;
	                }
	            }
	
	            return diff === 1 ? result : -1;
	        }
	
	        /**
	         * Check if primeImplicant covers constituent.
	         * @param {String} primeImplicant
	         * @param {String} constituent
	         * @returns {boolean}
	         */
	
	    }, {
	        key: 'isCover',
	        value: function isCover(primeImplicant, constituent) {
	            for (var i = 0; i < primeImplicant.length; ++i) {
	                if (!isNaN(parseInt(primeImplicant[i])) && primeImplicant[i] !== constituent[i]) {
	                    return false;
	                }
	            }
	            return true;
	        }
	    }]);
	
	    return LogicCalculator;
	})();
	
	exports.default = LogicCalculator;
	
	module.exports = LogicCalculator;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = (function () {
	  "use strict"
	
	  /*
	   * Generated by PEG.js 0.9.0.
	   *
	   * http://pegjs.org/
	   */
	
	  ;
	  function peg$subclass(child, parent) {
	    function ctor() {
	      this.constructor = child;
	    }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }
	
	  function peg$SyntaxError(message, expected, found, location) {
	    this.message = message;
	    this.expected = expected;
	    this.found = found;
	    this.location = location;
	    this.name = "SyntaxError";
	
	    if (typeof Error.captureStackTrace === "function") {
	      Error.captureStackTrace(this, peg$SyntaxError);
	    }
	  }
	
	  peg$subclass(peg$SyntaxError, Error);
	
	  function peg$parse(input) {
	    var options = arguments.length > 1 ? arguments[1] : {},
	        parser = this,
	        peg$FAILED = {},
	        peg$startRuleFunctions = { start: peg$parsestart },
	        peg$startRuleFunction = peg$parsestart,
	        peg$c0 = function peg$c0(ast) {
	      return {
	        ast: ast,
	        varsNames: Array.from(varsNames).sort()
	      };
	    },
	        peg$c1 = "<->",
	        peg$c2 = { type: "literal", value: "<->", description: "\"<->\"" },
	        peg$c3 = function peg$c3(first, rest) {
	      if (rest.length > 0) {
	        return {
	          type: 'equivalence',
	          left: first,
	          right: getExpression(rest)
	        };
	      } else {
	        return first;
	      }
	    },
	        peg$c4 = "->",
	        peg$c5 = { type: "literal", value: "->", description: "\"->\"" },
	        peg$c6 = function peg$c6(first, rest) {
	      if (rest.length > 0) {
	        return {
	          type: 'implication',
	          left: first,
	          right: getExpression(rest)
	        };
	      } else {
	        return first;
	      }
	    },
	        peg$c7 = "|",
	        peg$c8 = { type: "literal", value: "|", description: "\"|\"" },
	        peg$c9 = function peg$c9(first, rest) {
	      if (rest.length > 0) {
	        return { type: 'or', left: first, right: getExpression(rest) };
	      } else {
	        return first;
	      }
	    },
	        peg$c10 = "&",
	        peg$c11 = { type: "literal", value: "&", description: "\"&\"" },
	        peg$c12 = function peg$c12(first, rest) {
	      if (rest.length > 0) {
	        return { type: 'and', left: first, right: getExpression(rest) };
	      } else {
	        return first;
	      }
	    },
	        peg$c13 = "(",
	        peg$c14 = { type: "literal", value: "(", description: "\"(\"" },
	        peg$c15 = ")",
	        peg$c16 = { type: "literal", value: ")", description: "\")\"" },
	        peg$c17 = function peg$c17(expr) {
	      return expr;
	    },
	        peg$c18 = "!",
	        peg$c19 = { type: "literal", value: "!", description: "\"!\"" },
	        peg$c20 = function peg$c20(exclamationPoints, expr) {
	      return exclamationPointsAreEven(exclamationPoints) ? expr : {
	        type: 'negation',
	        child: expr
	      };
	    },
	        peg$c21 = function peg$c21(variable) {
	      return {
	        type: 'variable',
	        value: variable
	      };
	    },
	        peg$c22 = function peg$c22(exclamationPoints, variable) {
	      return exclamationPointsAreEven(exclamationPoints) ? {
	        type: 'variable',
	        value: variable
	      } : {
	        type: 'negation',
	        child: {
	          type: 'variable',
	          value: variable
	        }
	      };
	    },
	        peg$c23 = function peg$c23(digit) {
	      return {
	        type: 'digit',
	        value: digit
	      };
	    },
	        peg$c24 = function peg$c24(exclamationPoints, digit) {
	      return exclamationPointsAreEven(exclamationPoints) ? {
	        type: 'digit',
	        value: digit
	      } : {
	        type: 'negation',
	        child: {
	          type: 'digit',
	          value: digit
	        }
	      };
	    },
	        peg$c25 = { type: "other", description: "variable" },
	        peg$c26 = /^[a-zA-Z]/,
	        peg$c27 = { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
	        peg$c28 = /^[a-zA-Z0-9]/,
	        peg$c29 = { type: "class", value: "[a-zA-Z0-9]", description: "[a-zA-Z0-9]" },
	        peg$c30 = function peg$c30(variable) {
	      varsNames.add(variable);
	      return variable;
	    },
	        peg$c31 = { type: "other", description: "digit" },
	        peg$c32 = /^[01]/,
	        peg$c33 = { type: "class", value: "[01]", description: "[01]" },
	        peg$c34 = function peg$c34(digit) {
	      return digit == 0 ? false : true;
	    },
	        peg$c35 = { type: "other", description: "whitespace" },
	        peg$c36 = /^[ \t\n\r]/,
	        peg$c37 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
	        peg$currPos = 0,
	        peg$savedPos = 0,
	        peg$posDetailsCache = [{ line: 1, column: 1, seenCR: false }],
	        peg$maxFailPos = 0,
	        peg$maxFailExpected = [],
	        peg$silentFails = 0,
	        peg$result;
	
	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }
	
	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }
	
	    function text() {
	      return input.substring(peg$savedPos, peg$currPos);
	    }
	
	    function location() {
	      return peg$computeLocation(peg$savedPos, peg$currPos);
	    }
	
	    function expected(description) {
	      throw peg$buildException(null, [{ type: "other", description: description }], input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
	    }
	
	    function error(message) {
	      throw peg$buildException(message, null, input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
	    }
	
	    function peg$computePosDetails(pos) {
	      var details = peg$posDetailsCache[pos],
	          p,
	          ch;
	
	      if (details) {
	        return details;
	      } else {
	        p = pos - 1;
	        while (!peg$posDetailsCache[p]) {
	          p--;
	        }
	
	        details = peg$posDetailsCache[p];
	        details = {
	          line: details.line,
	          column: details.column,
	          seenCR: details.seenCR
	        };
	
	        while (p < pos) {
	          ch = input.charAt(p);
	          if (ch === "\n") {
	            if (!details.seenCR) {
	              details.line++;
	            }
	            details.column = 1;
	            details.seenCR = false;
	          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	            details.line++;
	            details.column = 1;
	            details.seenCR = true;
	          } else {
	            details.column++;
	            details.seenCR = false;
	          }
	
	          p++;
	        }
	
	        peg$posDetailsCache[pos] = details;
	        return details;
	      }
	    }
	
	    function peg$computeLocation(startPos, endPos) {
	      var startPosDetails = peg$computePosDetails(startPos),
	          endPosDetails = peg$computePosDetails(endPos);
	
	      return {
	        start: {
	          offset: startPos,
	          line: startPosDetails.line,
	          column: startPosDetails.column
	        },
	        end: {
	          offset: endPos,
	          line: endPosDetails.line,
	          column: endPosDetails.column
	        }
	      };
	    }
	
	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) {
	        return;
	      }
	
	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }
	
	      peg$maxFailExpected.push(expected);
	    }
	
	    function peg$buildException(message, expected, found, location) {
	      function cleanupExpected(expected) {
	        var i = 1;
	
	        expected.sort(function (a, b) {
	          if (a.description < b.description) {
	            return -1;
	          } else if (a.description > b.description) {
	            return 1;
	          } else {
	            return 0;
	          }
	        });
	
	        while (i < expected.length) {
	          if (expected[i - 1] === expected[i]) {
	            expected.splice(i, 1);
	          } else {
	            i++;
	          }
	        }
	      }
	
	      function buildMessage(expected, found) {
	        function stringEscape(s) {
	          function hex(ch) {
	            return ch.charCodeAt(0).toString(16).toUpperCase();
	          }
	
	          return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
	            return '\\x0' + hex(ch);
	          }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
	            return '\\x' + hex(ch);
	          }).replace(/[\u0100-\u0FFF]/g, function (ch) {
	            return "\\u0" + hex(ch);
	          }).replace(/[\u1000-\uFFFF]/g, function (ch) {
	            return "\\u" + hex(ch);
	          });
	        }
	
	        var expectedDescs = new Array(expected.length),
	            expectedDesc,
	            foundDesc,
	            i;
	
	        for (i = 0; i < expected.length; i++) {
	          expectedDescs[i] = expected[i].description;
	        }
	
	        expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];
	
	        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
	
	        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	      }
	
	      if (expected !== null) {
	        cleanupExpected(expected);
	      }
	
	      return new peg$SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, location);
	    }
	
	    function peg$parsestart() {
	      var s0, s1;
	
	      s0 = peg$currPos;
	      s1 = peg$parseequivalenceExpr();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c0(s1);
	      }
	      s0 = s1;
	
	      return s0;
	    }
	
	    function peg$parseequivalenceExpr() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseimplicationExpr();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse_();
	        if (s4 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 3) === peg$c1) {
	            s5 = peg$c1;
	            peg$currPos += 3;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c2);
	            }
	          }
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse_();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseimplicationExpr();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse_();
	          if (s4 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 3) === peg$c1) {
	              s5 = peg$c1;
	              peg$currPos += 3;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c2);
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s6 = peg$parse_();
	              if (s6 !== peg$FAILED) {
	                s7 = peg$parseimplicationExpr();
	                if (s7 !== peg$FAILED) {
	                  s4 = [s4, s5, s6, s7];
	                  s3 = s4;
	                } else {
	                  peg$currPos = s3;
	                  s3 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c3(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseimplicationExpr() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseorExpr();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse_();
	        if (s4 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c4) {
	            s5 = peg$c4;
	            peg$currPos += 2;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c5);
	            }
	          }
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse_();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseorExpr();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse_();
	          if (s4 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 2) === peg$c4) {
	              s5 = peg$c4;
	              peg$currPos += 2;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c5);
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s6 = peg$parse_();
	              if (s6 !== peg$FAILED) {
	                s7 = peg$parseorExpr();
	                if (s7 !== peg$FAILED) {
	                  s4 = [s4, s5, s6, s7];
	                  s3 = s4;
	                } else {
	                  peg$currPos = s3;
	                  s3 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c6(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseorExpr() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseandExpr();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse_();
	        if (s4 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 124) {
	            s5 = peg$c7;
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c8);
	            }
	          }
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse_();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseandExpr();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse_();
	          if (s4 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 124) {
	              s5 = peg$c7;
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c8);
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s6 = peg$parse_();
	              if (s6 !== peg$FAILED) {
	                s7 = peg$parseandExpr();
	                if (s7 !== peg$FAILED) {
	                  s4 = [s4, s5, s6, s7];
	                  s3 = s4;
	                } else {
	                  peg$currPos = s3;
	                  s3 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c9(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseandExpr() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseparenthesisExpr();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse_();
	        if (s4 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 38) {
	            s5 = peg$c10;
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c11);
	            }
	          }
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse_();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseparenthesisExpr();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse_();
	          if (s4 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 38) {
	              s5 = peg$c10;
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c11);
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s6 = peg$parse_();
	              if (s6 !== peg$FAILED) {
	                s7 = peg$parseparenthesisExpr();
	                if (s7 !== peg$FAILED) {
	                  s4 = [s4, s5, s6, s7];
	                  s3 = s4;
	                } else {
	                  peg$currPos = s3;
	                  s3 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c12(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseparenthesisExpr() {
	      var s0, s1, s2, s3, s4, s5, s6;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 40) {
	        s1 = peg$c13;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c14);
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse_();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseequivalenceExpr();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parse_();
	            if (s4 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 41) {
	                s5 = peg$c15;
	                peg$currPos++;
	              } else {
	                s5 = peg$FAILED;
	                if (peg$silentFails === 0) {
	                  peg$fail(peg$c16);
	                }
	              }
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c17(s3);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$currPos;
	        s2 = [];
	        if (input.charCodeAt(peg$currPos) === 33) {
	          s3 = peg$c18;
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c19);
	          }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (input.charCodeAt(peg$currPos) === 33) {
	              s3 = peg$c18;
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c19);
	              }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = input.substring(s1, peg$currPos);
	        } else {
	          s1 = s2;
	        }
	        if (s1 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 40) {
	            s2 = peg$c13;
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c14);
	            }
	          }
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parse_();
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parseequivalenceExpr();
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parse_();
	                if (s5 !== peg$FAILED) {
	                  if (input.charCodeAt(peg$currPos) === 41) {
	                    s6 = peg$c15;
	                    peg$currPos++;
	                  } else {
	                    s6 = peg$FAILED;
	                    if (peg$silentFails === 0) {
	                      peg$fail(peg$c16);
	                    }
	                  }
	                  if (s6 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c20(s1, s4);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$currPos;
	          s2 = peg$parseVariable();
	          if (s2 !== peg$FAILED) {
	            s1 = input.substring(s1, peg$currPos);
	          } else {
	            s1 = s2;
	          }
	          if (s1 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c21(s1);
	          }
	          s0 = s1;
	          if (s0 === peg$FAILED) {
	            s0 = peg$currPos;
	            s1 = peg$currPos;
	            s2 = [];
	            if (input.charCodeAt(peg$currPos) === 33) {
	              s3 = peg$c18;
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) {
	                peg$fail(peg$c19);
	              }
	            }
	            if (s3 !== peg$FAILED) {
	              while (s3 !== peg$FAILED) {
	                s2.push(s3);
	                if (input.charCodeAt(peg$currPos) === 33) {
	                  s3 = peg$c18;
	                  peg$currPos++;
	                } else {
	                  s3 = peg$FAILED;
	                  if (peg$silentFails === 0) {
	                    peg$fail(peg$c19);
	                  }
	                }
	              }
	            } else {
	              s2 = peg$FAILED;
	            }
	            if (s2 !== peg$FAILED) {
	              s1 = input.substring(s1, peg$currPos);
	            } else {
	              s1 = s2;
	            }
	            if (s1 !== peg$FAILED) {
	              s2 = peg$currPos;
	              s3 = peg$parseVariable();
	              if (s3 !== peg$FAILED) {
	                s2 = input.substring(s2, peg$currPos);
	              } else {
	                s2 = s3;
	              }
	              if (s2 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c22(s1, s2);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	            if (s0 === peg$FAILED) {
	              s0 = peg$currPos;
	              s1 = peg$parseDigit();
	              if (s1 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c23(s1);
	              }
	              s0 = s1;
	              if (s0 === peg$FAILED) {
	                s0 = peg$currPos;
	                s1 = peg$currPos;
	                s2 = [];
	                if (input.charCodeAt(peg$currPos) === 33) {
	                  s3 = peg$c18;
	                  peg$currPos++;
	                } else {
	                  s3 = peg$FAILED;
	                  if (peg$silentFails === 0) {
	                    peg$fail(peg$c19);
	                  }
	                }
	                if (s3 !== peg$FAILED) {
	                  while (s3 !== peg$FAILED) {
	                    s2.push(s3);
	                    if (input.charCodeAt(peg$currPos) === 33) {
	                      s3 = peg$c18;
	                      peg$currPos++;
	                    } else {
	                      s3 = peg$FAILED;
	                      if (peg$silentFails === 0) {
	                        peg$fail(peg$c19);
	                      }
	                    }
	                  }
	                } else {
	                  s2 = peg$FAILED;
	                }
	                if (s2 !== peg$FAILED) {
	                  s1 = input.substring(s1, peg$currPos);
	                } else {
	                  s1 = s2;
	                }
	                if (s1 !== peg$FAILED) {
	                  s2 = peg$parseDigit();
	                  if (s2 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c24(s1, s2);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseVariable() {
	      var s0, s1, s2, s3, s4, s5;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      s2 = peg$currPos;
	      if (peg$c26.test(input.charAt(peg$currPos))) {
	        s3 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s3 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c27);
	        }
	      }
	      if (s3 !== peg$FAILED) {
	        s4 = [];
	        if (peg$c28.test(input.charAt(peg$currPos))) {
	          s5 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c29);
	          }
	        }
	        while (s5 !== peg$FAILED) {
	          s4.push(s5);
	          if (peg$c28.test(input.charAt(peg$currPos))) {
	            s5 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) {
	              peg$fail(peg$c29);
	            }
	          }
	        }
	        if (s4 !== peg$FAILED) {
	          s3 = [s3, s4];
	          s2 = s3;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s2;
	        s2 = peg$FAILED;
	      }
	      if (s2 !== peg$FAILED) {
	        s1 = input.substring(s1, peg$currPos);
	      } else {
	        s1 = s2;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c30(s1);
	      }
	      s0 = s1;
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c25);
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseDigit() {
	      var s0, s1;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      if (peg$c32.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c33);
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c34(s1);
	      }
	      s0 = s1;
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c31);
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parse_() {
	      var s0, s1;
	
	      peg$silentFails++;
	      s0 = [];
	      if (peg$c36.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c37);
	        }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (peg$c36.test(input.charAt(peg$currPos))) {
	          s1 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) {
	            peg$fail(peg$c37);
	          }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) {
	          peg$fail(peg$c35);
	        }
	      }
	
	      return s0;
	    }
	
	    var getExpression = function getExpression(rest) {
	      var expr = [];
	      rest.forEach(function (elem) {
	        expr.push(elem[3]);
	      });
	      return expr;
	    };
	
	    var exclamationPointsAreEven = function exclamationPointsAreEven(str) {
	      return (str.match(/!/g) || []).length % 2 == 0;
	    };
	
	    var varsNames = new Set();
	
	    peg$result = peg$startRuleFunction();
	
	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail({ type: "end", description: "end of input" });
	      }
	
	      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
	    }
	  }
	
	  return {
	    SyntaxError: peg$SyntaxError,
	    parse: peg$parse
	  };
	})();

/***/ }
/******/ ]);
//# sourceMappingURL=test.bundle.js.map