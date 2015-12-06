'use strict';

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character +
        this.substr(index + character.length);
};

/**
 * Logic calculator class.
 */
class LogicCalculator {
    constructor(ast, context) {
        this.ast = ast;
        this.context = context;
        this.varsNames = typeof context === 'object' ? context.varsNames : {};
    }

    /**
     * Calculate logical expression.
     * @param ast Logical expression ast.
     * @param context Contains variable names to their value mapping.
     * @returns {boolean} Result of logical function.
     */
    static calculate(ast, context) {
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
                result = !this.calculate(ast.child, context);
                break;
            case 'or':
                result = this.calculate(ast.left, context);
                ast.right.forEach((node) => {
                    result |= this.calculate(node, context);
                });
                break;
            case 'and':
                result = this.calculate(ast.left, context);
                ast.right.forEach((node) => {
                    result &= this.calculate(node, context);
                });
                break;
            case 'implication':
                result = this.calculate(ast.left, context);
                ast.right.forEach((node) => {
                    result = !result || this.calculate(node, context);
                });
                break;
            case 'equivalence':
                let leftResult = this.calculate(ast.left, context);
                ast.right.forEach((node) => {
                    let rightResult = this.calculate(node, context);
                    result = (!leftResult || rightResult) && (leftResult || !rightResult);
                    leftResult = rightResult;
                });
                break;
        }

        return result;
    }

    /**
     * Builds truth table.
     * @returns {Array}
     */
    getTruthTable() {
        let rows = [];
        let rowsAmount = Math.pow(2, this.varsNames.size);

        for (let i = 0; i < rowsAmount; ++i) {
            let binString = Number(i).toString(2);
            if (binString.length !== this.varsNames.size) {
                let diff = this.varsNames.size - binString.length;
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

            let result = Number(LogicCalculator.calculate(this.ast, {
                vars: vars
            }));
            numbers.push(result);
            rows.push(numbers);
        }

        this.rows = rows;
        return rows;
    }

    /**
     * Determine logical function type.
     * @param truthTable Truth table.
     * @returns {String} Logical function type.
     */
    static getFunctionType(truthTable) {
        let isAlwaysTrue = true;
        let isntAlwaysFalse = false;
        let varsAmount = Math.log2(truthTable.length);

        truthTable.forEach(function (row) {
            let result = row[varsAmount];
            isAlwaysTrue = isAlwaysTrue && result;
            isntAlwaysFalse = isntAlwaysFalse || result;
        });

        if (isAlwaysTrue) {
            return 'identically-true, doable';
        } else if (!isntAlwaysFalse) {
            return 'identically-false, rebuttable';
        } else {
            return 'doable, rebuttable';
        }
    }

    /**
     * Return perfect conjunctive normal form of truth table.
     * @param truthTable Truth table.
     * @returns {string} Perfect conjunctive normal form.
     */
    getPcnf(truthTable) {
        let varsAmount = Math.log2(truthTable.length);
        let result = '';

        let varsNames = [];
        for (let varName of this.varsNames) {
            varsNames.push(varName);
        }
        varsNames.sort();

        let rowsAmount = truthTable.length;
        truthTable.forEach(function (row, index) {
            if (row[varsAmount] === 0) {
                result += '(';

                let length = row.length;
                for (let i = 0; i < length - 1; ++i) {
                    if (row[i] == 0) {
                        result += varsNames[i];
                    } else {
                        result += '!' + varsNames[i];
                    }

                    if (i !== length - 2) {
                        result += '|';
                    }
                }

                result += ')';

                if (index !== rowsAmount - 1) {
                    result += '&';
                }
            }
        });

        if (result === '') {
            return '1';
        }

        return result[result.length - 1] === '&' ?
            result.substring(0, result.length - 1) :
            result;
    }

    /**
     * Return perfect disjunctive normal form of truth table.
     * @param truthTable Truth table.
     * @returns {string} Perfect disjunctive normal form.
     */
    getPdnf(truthTable) {
        let varsAmount = Math.log2(truthTable.length);
        let result = '';

        let varsNames = [];
        for (let varName of this.varsNames) {
            varsNames.push(varName);
        }
        varsNames.sort();

        let rowsAmount = truthTable.length;
        truthTable.forEach(function (row, index) {
            if (row[varsAmount] === 1) {
                result += '(';

                let length = row.length;
                for (let i = 0; i < length - 1; ++i) {
                    if (row[i] == 1) {
                        result += varsNames[i];
                    } else {
                        result += '!' + varsNames[i];
                    }

                    if (i !== length - 2) {
                        result += '&';
                    }
                }

                result += ')';

                if (index !== rowsAmount - 1) {
                    result += '|';
                }
            }
        });

        if (result === '') {
            return '0';
        }

        return result[result.length - 1] === '|' ?
            result.substring(0, result.length - 1) :
            result;
    }

    /**
     * Invert last column of each row.
     * @param truthTable Truth table to invert.
     */
    static invertResults(truthTable) {
        let length = truthTable.length;
        let varsAmount = Math.log2(length);

        for (let i = 0; i < length; ++i) {
            truthTable[i][varsAmount] === 1 ? truthTable[i][varsAmount] = 0 : truthTable[i][varsAmount] = 1;
        }
    }

    /**
     * Check if function self-dual.
     * @param truthTable Truth table.
     * @returns {boolean} Result of check.
     */
    static isSelfDual(truthTable) {
        let length = truthTable.length;
        let varsAmount = Math.log2(length);

        let middle = length / 2;
        for (let i = 0; i < length / 2; ++i) {
            if (truthTable[i][varsAmount] ===
                truthTable[middle + i][varsAmount]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if functions are dual.
     * @param truthTable
     * @returns {boolean}
     */
    isDual(truthTable) {
        let length = this.rows.length;
        if (length !== truthTable.length) {
            return false;
        }
        let varsAmount = Math.log2(length);

        for (let i = 0; i < length; ++i) {
            if (this.rows[i][varsAmount] ===
                truthTable[length - i - 1][varsAmount]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get minimal disjunctive normal form.
     * @param pdnf Perfect disjunctive normal form.
     * @returns {string} Minimal disjunctive normal form.
     */
    mdnf(pdnf) {
        pdnf = pdnf
            .replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0')
            .replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1')
            .replace(/[\(\)&]/g, '')
            .split('|');

        let result = '';
        if (pdnf.length) {
            let result2 = LogicCalculator.quineMcCluskey(pdnf);
            let h = Array.from(this.varsNames);
            let opsize = h.length;

            for (let t of result2) {
                let tmp = '';
                for (let i = 0; i < opsize; ++i) {
                    if (t[i] === '1') {
                        tmp = h[i] + '&' + tmp;
                    } else if (t[i] === '0') {
                        tmp = '!' + h[i] + '&' + tmp;
                    }
                }

                tmp = tmp.slice(0, -1);
                result += '(' + tmp + ')|';
            }
        }
        return result.slice(0, -1);
    }

    mcnf(pcnf) {
        pcnf = pcnf
            .replace(/[a-zA-Z][a-zA-Z0-9]*/g, '1')
            .replace(/![a-zA-Z][a-zA-Z0-9]*/g, '0')
            .replace(/[\(\)|]/g, '')
            .split('&');

        let result = '';
        if (pcnf.length) {
            let result2 = LogicCalculator.quineMcCluskey(pcnf);
            let h = Array.from(this.varsNames);
            let opsize = h.length;

            for (let t of result2) {
                let tmp = '';
                for (let i = 0; i < opsize; ++i) {
                    if (t[i] === '1') {
                        tmp = h[i] + '|' + tmp;
                    } else if (t[i] === '0') {
                        tmp = '!' + h[i] + '|' + tmp;
                    }
                }

                tmp = tmp.slice(0, -1);
                result += '(' + tmp + ')|';
            }
        }
        return result.slice(0, -1);    }

    /**
     * Find minimal perfect form.
     * @param constituents Constituents of 1.
     * @returns {Array} Minimal perfect form.
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
                    product.forEach(function (item, index, array) {
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
     * @param groups Groups of constituents.
     * @returns {Array} Prime implicants.
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

    static findPosToMinimize(a, b, n) {
        let diff = 0;
        let result = -1;

        for (let i = 0; i < n; ++i) {
            if (a[i] != b[i]) {
                ++diff;
                result = i;
            }
        }

        return diff == 1 ? result : -1;
    }

    static isCover(prime, imp) {
        for (let i = 0; i < prime.length; ++i) {
            if (!isNaN(parseInt(prime[i])) && prime[i] != imp[i]) {
                return false;
            }
        }
        return true;
    }
}

module.exports = LogicCalculator;
