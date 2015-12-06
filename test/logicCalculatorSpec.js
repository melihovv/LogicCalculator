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

        it('must calculate expression which consist from constants only',
            function () {
                calculate('0|0').must.be.falsy();
                calculate('0|1').must.be.truthy();
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
            calculate('A->B', {
                vars: {
                    'A': false,
                    'B': false
                }
            }).must.be.truthy();
        });

        it('must understand equivalence operator', function () {
            calculate('A<->B', {vars: {'A': true, 'B': true}}).must.be.truthy();
            calculate('A<->B', {vars: {'A': true, 'B': false}}).must.be.falsy();
            calculate('A<->B', {vars: {'A': false, 'B': true}}).must.be.falsy();
            calculate('A<->B', {
                vars: {
                    'A': false,
                    'B': false
                }
            }).must.be.truthy();
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

        it('must execute conjunction first and disjunction second',
            function () {
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
            calculate('(A->B)&A', {
                vars: {
                    'A': false,
                    'B': true
                }
            }).must.be.falsy();
            calculate('(A->B)&A', {
                vars: {
                    'A': true,
                    'B': true
                }
            }).must.be.truthy();
        });

        it('must execute complex expressions', function () {
            calculate('(!!A->B)&(A)', {
                vars: {
                    'A': false,
                    'B': true
                }
            }).must.be.falsy();
            calculate('(A->B)&(A|A)', {
                vars: {
                    'A': false,
                    'B': true
                }
            }).must.be.falsy();

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

        it('must return truth table for simple one variable expression',
            function () {
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
            return LogicCalculator.getFunctionType(
                logicCalculator.getTruthTable()
            );
        };

        it('must properly recognize function which always returns true',
            function () {
                getFunctionType('a<->a').must.equal('identically-true, doable');
            });

        it('must properly recognize function which always returns false',
            function () {
                getFunctionType('a<->!a').must
                    .equal('identically-false, rebuttable');
            });

        it('must properly recognize function which may return false or true',
            function () {
                getFunctionType('a|b').must.equal('doable, rebuttable');
            });
    });

    describe('getPcnf', function () {
        var getPcnf = function (str) {
            var parseResult = parser.parse(str);
            var param = {
                varsNames: parseResult.varsNames
            };
            var logicCalculator = new LogicCalculator(parseResult.root, param);
            return logicCalculator.getPcnf(logicCalculator.getTruthTable());
        };

        it('must return a proper pcnf for simple logical expression ' +
            'containing only one variable', function () {
            getPcnf('a').must.equal('(a)');
        });

        it('must return a proper pcnf for conjunction', function () {
            getPcnf('a&b').must.equal('(a|b)&(a|!b)&(!a|b)');
        });

        it('must return a proper pcnf for disjuntion', function () {
            getPcnf('a|b').must.equal('(a|b)');
        });

        it('must return a proper pcnf for implication', function () {
            getPcnf('a->b').must.equal('(!a|b)');
        });

        it('must return a proper pcnf for equivalence', function () {
            getPcnf('a<->b').must.equal('(a|!b)&(!a|b)');
        });

        it('must return a proper pcnf for complicated expression', function () {
            getPcnf('(A&!C)|(A&B&C)|(A&C)').must
                .equal('(A|B|C)&(A|B|!C)&(A|!B|C)&(A|!B|!C)');
        });

        it('must return a proper pcnf for expression where might be constants',
            function () {
                getPcnf('a->0').must.equal('(!a)');
            });
    });

    describe('getPdnf', function () {
        var getPdnf = function (str) {
            var parseResult = parser.parse(str);
            var param = {
                varsNames: parseResult.varsNames
            };
            var logicCalculator = new LogicCalculator(parseResult.root, param);
            return logicCalculator.getPdnf(logicCalculator.getTruthTable());
        };

        it('must return a proper pcnf for simple logical expression ' +
            'containing only one variable', function () {
            getPdnf('a').must.equal('(a)');
        });

        it('must return a proper pcnf for conjunction', function () {
            getPdnf('a&b').must.equal('(a&b)');
        });

        it('must return a proper pcnf for disjuntion', function () {
            getPdnf('a|b').must.equal('(!a&b)|(a&!b)|(a&b)');
        });

        it('must return a proper pcnf for implication', function () {
            getPdnf('a->b').must.equal('(!a&!b)|(!a&b)|(a&b)');
        });

        it('must return a proper pcnf for equivalence', function () {
            getPdnf('a<->b').must.equal('(!a&!b)|(a&b)');
        });

        it('must return a proper pcnf for complicated expression',
            function () {
                getPdnf('(A&!C)|(A&B&C)|(A&C)').must
                    .equal('(A&!B&!C)|(A&!B&C)|(A&B&!C)|(A&B&C)');
            });

        it('must return a proper pcnf for expression where might be constants',
            function () {
                getPdnf('a->0').must.equal('(!a)');
            });
    });

    describe('invertResults', function () {
        var invertResults = function (truthTable) {
            LogicCalculator.invertResults(truthTable);
            return truthTable;
        };

        it('must invert results', function () {
            invertResults([
                [1, 1],
                [0, 0]
            ]).must.eql([
                [1, 0],
                [0, 1]
            ]);
        });
    });

    describe('mdnf', function () {
        var mdnf = function (pdnf, varsNames) {
            return new LogicCalculator(undefined, {
                varsNames: varsNames
            }).mdnf(pdnf);
        };

        it('must', function () {
            mdnf('(!a&!b&!c&d)|(!a&!b&c&d)|(!a&b&!c&d)|(!a&b&c&d)|' +
                '(a&b&c&!d)|(a&b&c&d)', new Set(['a', 'b', 'c', 'd']));
        });
    });
});
