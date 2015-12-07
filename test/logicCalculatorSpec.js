'use strict';

import parser from '../lib/parser';
import LogicCalculator from '../lib/logicCalculator';

describe('Logic calculator', () => {
    describe('calc', () => {
        const calculate = (str, context) => {
            return LogicCalculator.calc(parser.parse(str).ast, context);
        };

        it('must substitute variable with its value', () => {
            calculate('A', {vars: {A: true}}).must.be.truthy();
            calculate('A', {vars: {A: false}}).must.be.falsy();
        });

        it('must understand 0 and 1', () => {
            calculate('0').must.be.falsy();
            calculate('1').must.be.truthy();
        });

        it('must calc expression which consist from constants only', () => {
            calculate('0|0').must.be.falsy();
            calculate('0|1').must.be.truthy();
        });

        it('must understand negative operator', () => {
            calculate('!A', {vars: {A: true}}).must.be.falsy();
            calculate('!A', {vars: {A: false}}).must.be.truthy();
            calculate('!!A', {vars: {A: true}}).must.be.truthy();
            calculate('!!A', {vars: {A: false}}).must.be.falsy();
        });

        it('must understand disjunction operator', () => {
            calculate('A|B', {vars: {A: true, B: true}}).must.be.truthy();
            calculate('A|B', {vars: {A: true, B: false}}).must.be.truthy();
            calculate('A|B', {vars: {A: false, B: true}}).must.be.truthy();
            calculate('A|B', {vars: {A: false, B: false}}).must.be.falsy();
        });

        it('must understand conjunction operator', () => {
            calculate('A&B', {vars: {A: true, B: true}}).must.be.truthy();
            calculate('A&B', {vars: {A: true, B: false}}).must.be.falsy();
            calculate('A&B', {vars: {A: false, B: true}}).must.be.falsy();
            calculate('A&B', {vars: {A: false, B: false}}).must.be.falsy();
        });

        it('must understand implication operator', () => {
            calculate('A->B', {vars: {A: true, B: true}}).must.be.truthy();
            calculate('A->B', {vars: {A: true, B: false}}).must.be.falsy();
            calculate('A->B', {vars: {A: false, B: true}}).must.be.truthy();
            calculate('A->B', {vars: {A: false, B: false}}).must.be.truthy();
        });

        it('must understand equivalence operator', () => {
            calculate('A<->B', {vars: {A: true, B: true}}).must.be.truthy();
            calculate('A<->B', {vars: {A: true, B: false}}).must.be.falsy();
            calculate('A<->B', {vars: {A: false, B: true}}).must.be.falsy();
            calculate('A<->B', {vars: {A: false, B: false}}).must.be.truthy();
        });

        it('must execute disjuction first and implication second', () => {
            calculate('A->B|C', {vars: {A: true, B: true, C: false}})
                .must.be.truthy();

            calculate('A->B|C', {vars: {A: true, B: false, C: false}})
                .must.be.falsy();
        });

        it('must execute conjunction first and disjunction second', () => {
            calculate('A|B&C', {vars: {A: false, B: true, C: false}})
                .must.be.falsy();

            calculate('A|B&C', {vars: {A: false, B: false, C: true}})
                .must.be.falsy();
        });

        it('must execute expression between parenthesis first', () => {
            calculate('(A->B)&A', {vars: {A: false, B: true}}).must.be.falsy();
            calculate('(A->B)&A', {vars: {A: true, B: true}}).must.be.truthy();
        });

        it('must execute complex expressions', () => {
            calculate('(!!A->B)&(A)', {vars: {A: false, B: true}})
                .must.be.falsy();

            calculate('(A->B)&(A|A)', {vars: {A: false, B: true}})
                .must.be.falsy();

            calculate('A|B|C', {vars: {A: false, B: true, C: true}})
                .must.be.truthy();

            calculate('A&B&C', {
                vars: {A: false, B: true, C: true}
            }).must.be.falsy();

            calculate('A->B&C', {
                vars: {A: false, B: true, C: true}
            }).must.be.true();

            calculate('A->B->C', {
                vars: {A: false, B: true, C: true}
            }).must.be.truthy();

            calculate('A->B->C', {
                vars: {A: true, B: false, C: true}
            }).must.be.truthy();

            calculate('A->B->!C', {
                vars: {A: true, B: false, C: true}
            }).must.be.truthy();

            calculate('!(A->B)&((!C)|D)', {
                vars: {
                    A: true, B: false, C: true, D: false
                }
            }).must.be.falsy();

            calculate('A<->B<->C', {vars: {A: true, B: false, C: true}})
                .must.be.falsy();
        });
    });

    describe('truthTable', () => {
        const truthTable = (str) => new LogicCalculator(str).truthTable();

        it('must return truth table for simple one variable expression', () => {
            truthTable('a').must.eql([
                [0, 0],
                [1, 1]
            ]);
        });

        it('must return truth table for disjunction', () => {
            truthTable('a|b').must.eql([
                [0, 0, 0],
                [0, 1, 1],
                [1, 0, 1],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for conjunction', () => {
            truthTable('a&b').must.eql([
                [0, 0, 0],
                [0, 1, 0],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for implication', () => {
            truthTable('a->b').must.eql([
                [0, 0, 1],
                [0, 1, 1],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for equivalence', () => {
            truthTable('a<->b').must.eql([
                [0, 0, 1],
                [0, 1, 0],
                [1, 0, 0],
                [1, 1, 1]
            ]);
        });

        it('must return truth table for constant', () => {
            truthTable('1').must.eql([[1]]);
            truthTable('0').must.eql([[0]]);
        });
    });

    describe('functionType', () => {
        const logicCalc = (str) => new LogicCalculator(str);

        it('must properly recognize function which always returns true', () => {
            const lc = logicCalc('a<->a');
            lc.isIdenticallyTrue.must.be.truthy();
            lc.isIdenticallyFalse.must.be.falsy();
            lc.isDoable.must.be.truthy();
            lc.isRebuttable.must.be.falsy();
        });

        it('must properly recognize function which always returns false',
            () => {
                const lc = logicCalc('a<->!a');
                lc.isIdenticallyTrue.must.be.falsy();
                lc.isIdenticallyFalse.must.be.truthy();
                lc.isDoable.must.be.falsy();
                lc.isRebuttable.must.be.truthy();
            });

        it('must properly recognize function which may return false or true',
            () => {
                const lc = logicCalc('a|b');
                lc.isIdenticallyTrue.must.be.falsy();
                lc.isIdenticallyFalse.must.be.falsy();
                lc.isDoable.must.be.truthy();
                lc.isRebuttable.must.be.truthy();
            });

        it('must properly recognize constant function', () => {
            const lc1 = logicCalc('1');
            lc1.isIdenticallyTrue.must.be.truthy();
            lc1.isIdenticallyFalse.must.be.falsy();
            lc1.isDoable.must.be.truthy();
            lc1.isRebuttable.must.be.falsy();

            const lc2 = logicCalc('0');
            lc2.isIdenticallyTrue.must.be.falsy();
            lc2.isIdenticallyFalse.must.be.truthy();
            lc2.isDoable.must.be.falsy();
            lc2.isRebuttable.must.be.truthy();
        });
    });

    describe('pcnf', () => {
        const pcnf = (str) => new LogicCalculator(str).pcnf();

        it('must return a proper pcnf for simple logical expression ' +
            'containing only one variable', () => {
            pcnf('a').must.equal('(a)');
        });

        it('must return a proper pcnf for conjunction', () => {
            pcnf('a&b').must.equal('(a|b)&(a|!b)&(!a|b)');
        });

        it('must return a proper pcnf for disjuntion', () => {
            pcnf('a|b').must.equal('(a|b)');
        });

        it('must return a proper pcnf for implication', () => {
            pcnf('a->b').must.equal('(!a|b)');
        });

        it('must return a proper pcnf for equivalence', () => {
            pcnf('a<->b').must.equal('(a|!b)&(!a|b)');
        });

        it('must return a proper pcnf for complicated expression', () => {
            pcnf('(A&!C)|(A&B&C)|(A&C)').must
                .equal('(A|B|C)&(A|B|!C)&(A|!B|C)&(A|!B|!C)');
        });

        it('must return a proper pcnf for expression where might be constants',
            () => {
                pcnf('a->0').must.equal('(!a)');
            });

        it('must return a proper pcnf for constant expression', () => {
            pcnf('1').must.equal('1');
            pcnf('0').must.equal('0');
        });
    });

    describe('pdnf', () => {
        const pdnf = (str) => new LogicCalculator(str).pdnf();

        it('must return the proper pdnf for simple logical expression ' +
            'containing only one variable', () => {
            pdnf('a').must.equal('(a)');
        });

        it('must return the proper pdnf for conjunction', () => {
            pdnf('a&b').must.equal('(a&b)');
        });

        it('must return the proper pdnf for disjuntion', () => {
            pdnf('a|b').must.equal('(!a&b)|(a&!b)|(a&b)');
        });

        it('must return the proper pdnf for implication', () => {
            pdnf('a->b').must.equal('(!a&!b)|(!a&b)|(a&b)');
        });

        it('must return the proper pdnf for equivalence', () => {
            pdnf('a<->b').must.equal('(!a&!b)|(a&b)');
        });

        it('must return the proper pdnf for complicated expression', () => {
            pdnf('(A&!C)|(A&B&C)|(A&C)')
                .must.equal('(A&!B&!C)|(A&!B&C)|(A&B&!C)|(A&B&C)');
        });

        it('must return the proper pdnf for expression where might be ' +
            'constants', () => {
            pdnf('a->0').must.equal('(!a)');
        });

        it('must return a proper pdnf for constant expression', () => {
            pdnf('1').must.equal('1');
            pdnf('0').must.equal('0');
        });
    });

    describe('isSelfDual', () => {
        const isSelfDual = (str) => new LogicCalculator(str).isSelfDual();

        it('must return true', () => {
            isSelfDual('a').must.be.truthy();
            isSelfDual('!a').must.be.truthy();
            isSelfDual('1').must.be.truthy();
            isSelfDual('0').must.be.truthy();
        });

        it('must return false', () => {
            isSelfDual('a|b').must.be.falsy();
            isSelfDual('a&b').must.be.falsy();
        });
    });

    describe('selfDual', () => {
        const isDual = (str1, str2) => {
            const lc1 = new LogicCalculator(str1);
            const lc2 = new LogicCalculator(str2);
            return lc1.isDual(lc2.truthTable());
        };

        it('must return true', () => {
            isDual('a|b', 'a&b').must.be.truthy();
        });

        it('must return false', () => {
            isDual('a|b', 'a->b').must.be.falsy();
        });
    });

    describe('mcnf', () => {
        const mcnf = (str) => {
            const lc = new LogicCalculator(str);
            lc.pcnf();
            return lc.mcnf();
        };

        it('must properly evaluate mcnf', () => {
            mcnf('a&b').must.equal('(a)&(b)');
        });
    });

    describe('mdnf', () => {
        const mdnf = (str) => {
            const lc = new LogicCalculator(str);
            lc.pdnf();
            return lc.mdnf();
        };

        it('must properly evaluate mdnf', () => {
            // (!a&!b&!c&d)|(!a&!b&c&d)|(!a&b&!c&d)|(!a&b&c&d)|(a&b&c&!d)|(a&b&c&d)
            mdnf('(!a&!b&!c&d)|(!a&!b&c&d)|(!a&b&!c&d)|(!a&b&c&d)|' +
                '(a&b&c&!d)|(a&b&c&d)').must.equal('(a&b&c)|(!a&d)');

            mdnf('a&b').must.equal('(a&b)');
        });
    });
});
