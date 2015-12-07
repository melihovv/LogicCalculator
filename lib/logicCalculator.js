'use strict';

import parser from './parser';

/**
 * Replace the character at the specified index.
 * @param {int} index
 * @param {string} character
 * @returns {string}
 */
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character +
        this.substr(index + character.length);
};

/**
 * Logic calculator class.
 */
export default class LogicCalculator {
    /**
     * Construct LogicCalculator.
     * @param {string} text
     */
    constructor(text) {
        let parseResult = parser.parse(text);
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
    truthTable() {
        if (this._truthTable.length) {
            return this._truthTable;
        }

        if (this.varsNames.length === 0) {
            const result = Number(LogicCalculator.calc(this.ast));
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

        let rows = [];
        let rowsAmount = Math.pow(2, this.varsNames.length);

        this.isIdenticallyTrue = true;
        let isntAlwaysFalse = false;

        for (let i = 0; i < rowsAmount; ++i) {
            let binString = Number(i).toString(2);
            if (binString.length !== this.varsNames.length) {
                let diff = this.varsNames.length - binString.length;
                binString = new Array(diff + 1).join('0') + binString;
            }

            let numbers = [];
            let binStringLength = binString.length;
            for (let j = 0; j < binStringLength; ++j) {
                numbers.push(Number(binString[j]));
            }

            let vars = {};
            let counter = 0;
            this.varsNames.forEach((value) => {
                vars[value] = numbers[counter++];
            });

            let result = Number(LogicCalculator.calc(this.ast, {vars}));
            numbers.push(result);
            rows.push(numbers);

            this.isIdenticallyTrue = this.isIdenticallyTrue && result;
            isntAlwaysFalse = isntAlwaysFalse || result;
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
    static calc(ast, context) {
        let vars = typeof context === 'object' ? context.vars : {};
        let nodeType = ast.type;
        let result;

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
                ast.right.forEach((node) => {
                    result = result || this.calc(node, context);
                });
                break;
            case 'and':
                result = this.calc(ast.left, context);
                ast.right.forEach((node) => {
                    result = result && this.calc(node, context);
                });
                break;
            case 'implication':
                let left = this.calc(ast.left, context);
                let copy = ast.right.slice();
                copy.reverse();
                let flag = false;
                let right = copy.reduce((res, node) => {
                    if (flag === false) {
                        flag = true;
                        return this.calc(node, context);
                    }
                    return !this.calc(node, context) || res;
                }, false);
                result = !left || right;
                break;
            case 'equivalence':
                let leftResult = this.calc(ast.left, context);
                ast.right.forEach((node) => {
                    let rightResult = this.calc(node, context);
                    result = (!leftResult || rightResult) &&
                        (leftResult || !rightResult);
                    leftResult = rightResult;
                });
                break;
        }

        return result;
    }

    /**
     * Get perfect conjunctive normal form of truth table.
     * @returns {string}
     */
    pcnf() {
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
    pdnf() {
        if (this._pdnf !== null) {
            return this._pdnf;
        }

        this._pdnf = this.pnf(1, '&', '|');

        return this._pdnf;
    }

    /**
     * Get normal form.
     * @param {int} digit
     * @param {string} char1
     * @param {string} char2
     * @returns {string}
     */
    pnf(digit, char1, char2) {
        let varsAmount = Math.log2(this._truthTable.length);
        let result = '';

        let rowsAmount = this._truthTable.length;
        this._truthTable.forEach((row, index) => {
            if (row[varsAmount] === digit) {
                result += '(';

                let length = row.length;
                for (let i = 0; i < length - 1; ++i) {
                    if (row[i] === digit) {
                        result += this.varsNames[i];
                    } else {
                        result += '!' + this.varsNames[i];
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
            result = result[result.length - 1] === char2 ?
                result.substring(0, result.length - 1) :
                result;
        }

        return result;
    }

    /**
     * Check if the function is self-dual.
     * @returns {boolean}
     */
    isSelfDual() {
        if (this._isSelfDual !== null) {
            return this._isSelfDual;
        }

        let length = this._truthTable.length;
        let varsAmount = Math.log2(length);

        let middle = length / 2;
        for (let i = 0; i < length / 2; ++i) {
            if (this._truthTable[i][varsAmount] ===
                this._truthTable[middle + i][varsAmount]) {
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
    isDual(truthTable) {
        let length = this._truthTable.length;
        if (length !== truthTable.length) {
            return false;
        }
        let varsAmount = Math.log2(length);

        for (let i = 0; i < length; ++i) {
            if (this._truthTable[i][varsAmount] ===
                truthTable[length - i - 1][varsAmount]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get minimal disjunctive normal form.
     * @returns {string}
     */
    mdnf() {
        if (this._mdnf !== null) {
            return this._mdnf;
        }

        let tmp = this._pdnf
            .replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0')
            .replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1')
            .replace(/[\(\)&]/g, '')
            .split('|');

        let result = '';
        if (tmp.length) {
            let result2 = LogicCalculator.quineMcCluskey(tmp);
            let h = this.varsNames;
            let opsize = h.length;

            for (let t of result2) {
                let tmp2 = '';
                for (let i = 0; i < opsize; ++i) {
                    if (t[i] === '1') {
                        tmp2 += h[i] + '&';
                    } else if (t[i] === '0') {
                        tmp2 += '!' + h[i] + '&';
                    }
                }

                tmp2 = tmp2.slice(0, -1);
                result += '(' + tmp2 + ')|';
            }
        }

        this._mdnf = result.slice(0, -1);
        return this._mdnf;
    }

    /**
     * Get minimal conjunctive normal form.
     * @returns {string}
     */
    mcnf() {
        if (this._mcnf !== null) {
            return this._mcnf;
        }

        let tmp = this._pcnf
            .replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0')
            .replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1')
            .replace(/[\(\)|]/g, '')
            .split('&');

        let result = '';
        if (tmp.length) {
            let result2 = LogicCalculator.quineMcCluskey(tmp);
            let h = this.varsNames;
            let opsize = h.length;

            for (let t of result2) {
                let tmp2 = '';
                for (let i = 0; i < opsize; ++i) {
                    if (t[i] === '1') {
                        tmp2 += h[i] + '|';
                    } else if (t[i] === '0') {
                        tmp2 += '!' + h[i] + '|';
                    }
                }

                tmp2 = tmp2.slice(0, -1);
                result += '(' + tmp2 + ')&';
            }
        }

        this._mcnf = result.slice(0, -1);
        return this._mcnf;
    }

    /**
     * Find minimal perfect form.
     * @param {Array} constituents
     * @returns {Array}
     */
    static quineMcCluskey(constituents) {
        let groups = [];
        for (let constituent of constituents) {
            let index = (constituent.match(/1/g) || []).length;
            if (!groups[index]) {
                groups[index] = [];
            }
            groups[index].push(constituent + '+');
        }

        let primeImplicants = LogicCalculator.findPrimeImplicants(groups);
        let table = [];
        for (let i = 0; i < primeImplicants.length; ++i) {
            table.push([]);
            for (let j = 0; j < constituents.length; ++j) {
                table[i].push(
                    LogicCalculator.isCover(primeImplicants[i], constituents[j])
                );
            }
        }

        let result2 = LogicCalculator.petricMethod(table);
        let result = [];
        for (let i = 0; i < result2.length; ++i) {
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
    static petricMethod(table) {
        let I = [];
        for (let i = 0; i < table.length; ++i) {
            let tmp = new Array(table.length + 1).join('-');
            tmp = tmp.replaceAt(i, '1');
            I.push(tmp);
        }

        let product = [];
        for (let i = 0; i < table.length; ++i) {
            if (table[i][0]) {
                product.push(I[i]);
            }
        }

        for (let j = 1; j < table[0].length; ++j) {
            let tmp = [];
            let pp = product;
            for (let i = 0; i < table.length; ++i) {
                if (table[i][j]) {
                    tmp.push(I[i]);
                }
            }

            product = [];
            for (let p of pp) {
                for (let t of tmp) {
                    let n = new Array(table.length + 1).join('-');
                    for (let i = 0; i < t.length; ++i) {
                        if (p[i] === '1' || t[i] === '1') {
                            n = n.replaceAt(i, '1');
                        }
                    }

                    let isAddN = true;
                    let isDel = false;
                    product.forEach((item, index, array) => {
                        let resf = LogicCalculator.findPosToMinimize(
                            item, n, n.length
                        );
                        if (resf !== -1 || item === n) {
                            isAddN = false;
                        }

                        if (resf !== -1 &&
                            (n.match(/1/g) || []).length <
                            (item.match(/1/g) || []).length) {
                            array.splice(index, 1);
                            isDel = true;
                        }
                    });

                    if (isAddN || isDel) {
                        product.push(n);
                    }
                }
            }
        }

        let imin = table.length + 1;
        let result = '';
        for (let p of product) {
            if ((p.match(/1/g) || []).length < imin) {
                result = p;
            }
        }
        return result;
    }

    /**
     * Find prime implicants.
     * @param {Array} groups
     * @returns {Array}
     */
    static findPrimeImplicants(groups) {
        let n = groups[groups.length - 1][0].length - 1;
        let result = [];
        let isAllImplicantsFound = false;

        while (!isAllImplicantsFound) {
            isAllImplicantsFound = true;
            let tmp = [];

            // Try to minimize i and i + 1 groups.
            for (let i = 0; i < groups.length; ++i) {
                if (groups[i] === undefined) {
                    continue;
                }

                tmp.push([]);
                for (let gi = 0; gi < groups[i].length; ++gi) {
                    for (let gj = 0;
                         i + 1 < groups.length && gj < groups[i + 1].length;
                         ++gj) {

                        let pos = LogicCalculator.findPosToMinimize(
                            groups[i][gi],
                            groups[i + 1][gj],
                            n
                        );

                        if (pos !== -1) {
                            let newNotation = groups[i][gi];
                            newNotation = newNotation.replaceAt(pos, '*');
                            newNotation = newNotation.replaceAt(n, '+');

                            if (tmp[tmp.length - 1]
                                    .indexOf(newNotation) === -1) {
                                tmp[tmp.length - 1].push(newNotation);
                            }

                            isAllImplicantsFound = false;
                            groups[i][gi] = groups[i][gi].replaceAt(n, '-');
                            groups[i + 1][gj] = groups[i + 1][gj]
                                .replaceAt(n, '-');
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

        for (let i = 0; i < groups.length; ++i) {
            for (let j = 0; j < groups[i].length; ++j) {
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
    static findPosToMinimize(a, b, n) {
        let diff = 0;
        let result = -1;

        for (let i = 0; i < n; ++i) {
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
    static isCover(primeImplicant, constituent) {
        for (let i = 0; i < primeImplicant.length; ++i) {
            if (!isNaN(parseInt(primeImplicant[i])) &&
                primeImplicant[i] !== constituent[i]) {
                return false;
            }
        }
        return true;
    }
}

module.exports = LogicCalculator;
