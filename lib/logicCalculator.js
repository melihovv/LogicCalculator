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
            return 'тождественно-истинная, выполнимая';
        } else if (!isntAlwaysFalse) {
            return 'тождественно-ложная, опровержимая';
        } else {
            return 'выполнимая, опровержимая';
        }
    }
}

module.exports = LogicCalculator;
