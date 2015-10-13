'use strict';

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
            if (truthTable[i][varsAmount] === truthTable[middle + i][varsAmount]) {
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
            if (this.rows[i][varsAmount] === truthTable[length - i - 1][varsAmount]) {
                return false;
            }
        }

        return true;
    }
}

module.exports = LogicCalculator;
