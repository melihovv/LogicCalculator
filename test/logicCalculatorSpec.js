describe('Logic calculator', function () {
    'use strict';

    var parser = require('../lib/parser');
    var LogicCalculator = require('../lib/logicCalculator');

    describe('calculate', function () {
        var calculate = function (str, context) {
            return LogicCalculator.calculate(parser.parse(str).root, context);
        };

        it('must substitute variable with its value', function () {
            calculate('A', {vars: {'A': true}}).must.be.truthy();
            calculate('A', {vars: {'A': false}}).must.be.falsy();
        });

        it('must understand 0 and 1', function () {
            calculate('0').must.be.falsy();
            calculate('1').must.be.truthy();
        });

        it('must understand negative operator', function () {
            calculate('!A', {vars: {'A': true}}).must.be.falsy();
            calculate('!A', {vars: {'A': false}}).must.be.truthy();
            calculate('!!A', {vars: {'A': true}}).must.be.truthy();
            calculate('!!A', {vars: {'A': false}}).must.be.falsy();
        });

        it('must understand disjunction operator', function () {
            calculate('A|B', {vars: {'A': true, 'B': true}}).must.be.truthy();
            calculate('A|B', {vars: {'A': true, 'B': false}}).must.be.truthy();
            calculate('A|B', {vars: {'A': false, 'B': true}}).must.be.truthy();
            calculate('A|B', {vars: {'A': false, 'B': false}}).must.be.falsy();
        });

        it('must understand conjunction operator', function () {
            calculate('A&B', {vars: {'A': true, 'B': true}}).must.be.truthy();
            calculate('A&B', {vars: {'A': true, 'B': false}}).must.be.falsy();
            calculate('A&B', {vars: {'A': false, 'B': true}}).must.be.falsy();
            calculate('A&B', {vars: {'A': false, 'B': false}}).must.be.falsy();
        });

        it('must understand implication operator', function () {
            calculate('A->B', {vars: {'A': true, 'B': true}}).must.be.truthy();
            calculate('A->B', {vars: {'A': true, 'B': false}}).must.be.falsy();
            calculate('A->B', {vars: {'A': false, 'B': true}}).must.be.truthy();
            calculate('A->B', {vars: {'A': false, 'B': false}}).must.be.truthy();
        });

        it('must understand equivalence operator', function () {
            calculate('A<->B', {vars: {'A': true, 'B': true}}).must.be.truthy();
            calculate('A<->B', {vars: {'A': true, 'B': false}}).must.be.falsy();
            calculate('A<->B', {vars: {'A': false, 'B': true}}).must.be.falsy();
            calculate('A<->B', {vars: {'A': false, 'B': false}}).must.be.truthy();
        });

        it('must execute disjuction first and implication second', function () {
            calculate('A->B|C', {
                vars: {
                    'A': true,
                    'B': true,
                    'C': false
                }
            }).must.be.truthy();

            calculate('A->B|C', {
                vars: {
                    'A': true,
                    'B': false,
                    'C': false
                }
            }).must.be.falsy();
        });

        it('must execute conjunction first and disjunction second', function () {
            calculate('A|B&C', {
                vars: {
                    'A': false,
                    'B': true,
                    'C': false
                }
            }).must.be.falsy();

            calculate('A|B&C', {
                vars: {
                    'A': false,
                    'B': false,
                    'C': true
                }
            }).must.be.falsy();
        });

        it('must execute expression between parenthesis first', function () {
            calculate('(A->B)&A', {vars: {'A': false, 'B': true}}).must.be.falsy();
            calculate('(A->B)&A', {vars: {'A': true, 'B': true}}).must.be.truthy();
        });

        it('must execute complex expressions', function () {
            calculate('(!!A->B)&(A)', {vars: {'A': false, 'B': true}}).must.be.falsy();
            calculate('(A->B)&(A|A)', {vars: {'A': false, 'B': true}}).must.be.falsy();

            calculate('A|B|C', {
                vars: {
                    'A': false,
                    'B': true,
                    'C': true
                }
            }).must.be.truthy();

            calculate('A&B&C', {
                vars: {
                    'A': false,
                    'B': true,
                    'C': true
                }
            }).must.be.falsy();

            calculate('A->B&C', {
                vars: {
                    'A': false,
                    'B': true,
                    'C': true
                }
            }).must.be.true();

            calculate('A->B->C', {
                vars: {
                    'A': false,
                    'B': true,
                    'C': true
                }
            }).must.be.truthy();

            calculate('A->B->C', {
                vars: {
                    'A': true,
                    'B': false,
                    'C': true
                }
            }).must.be.truthy();

            calculate('A->B->!C', {
                vars: {
                    'A': true,
                    'B': false,
                    'C': true
                }
            }).must.be.truthy();

            calculate('!(A->B)&((!C)|D)', {
                vars: {
                    'A': true,
                    'B': false,
                    'C': true,
                    'D': false
                }
            }).must.be.falsy();

            calculate('A<->B<->C', {
                vars: {
                    'A': true,
                    'B': false,
                    'C': true
                }
            }).must.be.falsy();
        });
    });

    describe('getTruthTable', function () {
        var getTruthTable = function (str) {
            var parseResult = parser.parse(str);
            var logicCalculator = new LogicCalculator(parseResult.root, {
                varsNames: parseResult.varsNames
            });
            return logicCalculator.getTruthTable();
        };

        it('must return truth table for simple one variable expression', function () {
            var rows = getTruthTable('a');
            rows.must.eql([
                [0, 0],
                [1, 1]
            ]);
        });

        it('must return truth table for disjunction', function () {
            var rows = getTruthTable('a|b');
            rows.must.eql([
                [0, 0, 0],
                [0, 1, 1],
                [1, 0, 1],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for conjunction', function () {
            var rows = getTruthTable('a&b');
            rows.must.eql([
                [0, 0, 0],
                [0, 1, 0],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for implication', function () {
            var rows = getTruthTable('a->b');
            rows.must.eql([
                [0, 0, 1],
                [0, 1, 1],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for equivalence', function () {
            var rows = getTruthTable('a<->b');
            rows.must.eql([
                [0, 0, 1],
                [0, 1, 0],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });
    });

    describe('getFunctionType', function () {
        var getFunctionType = function (str) {
            var parseResult = parser.parse(str);
            var logicCalculator = new LogicCalculator(parseResult.root, {
                varsNames: parseResult.varsNames
            });
            return LogicCalculator.getFunctionType(logicCalculator.getTruthTable());
        };

        it('must properly recognize function which always returns true', function () {
            getFunctionType('a<->a').must.equal('тождественно-истинная, выполнимая');
        });

        it('must properly recognize function which always returns false', function () {
            getFunctionType('a<->!a').must.equal('тождественно-ложная, опровержимая');
        });

        it('must properly recognize function which may return false or true', function () {
            getFunctionType('a|b').must.equal('выполнимая, опровержимая');
        });
    });
});
