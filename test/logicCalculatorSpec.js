describe('Logic calculator', function () {
    'use strict';

    var parser = require('../lib/parser');
    var calc = require('../lib/logicCalculator');

    var exec = function (str, context) {
        return calc(parser.parse(str), context);
    };

    it('must substitute variable with its value', function () {
        exec('A', {vars: {'A': true}}).must.be.truthy();
        exec('A', {vars: {'A': false}}).must.be.falsy();
    });

    it('must understand negative operator', function () {
        exec('!A', {vars: {'A': true}}).must.be.falsy();
        exec('!A', {vars: {'A': false}}).must.be.truthy();
        exec('!!A', {vars: {'A': true}}).must.be.truthy();
        exec('!!A', {vars: {'A': false}}).must.be.falsy();
    });

    it('must understand disjunction operator', function () {
        exec('A|B', {vars: {'A': true, 'B': true}}).must.be.truthy();
        exec('A|B', {vars: {'A': true, 'B': false}}).must.be.truthy();
        exec('A|B', {vars: {'A': false, 'B': true}}).must.be.truthy();
        exec('A|B', {vars: {'A': false, 'B': false}}).must.be.falsy();
    });

    it('must understand conjunction operator', function () {
        exec('A&B', {vars: {'A': true, 'B': true}}).must.be.truthy();
        exec('A&B', {vars: {'A': true, 'B': false}}).must.be.falsy();
        exec('A&B', {vars: {'A': false, 'B': true}}).must.be.falsy();
        exec('A&B', {vars: {'A': false, 'B': false}}).must.be.falsy();
    });

    it('must understand implication operator', function () {
        exec('A->B', {vars: {'A': true, 'B': true}}).must.be.truthy();
        exec('A->B', {vars: {'A': true, 'B': false}}).must.be.falsy();
        exec('A->B', {vars: {'A': false, 'B': true}}).must.be.truthy();
        exec('A->B', {vars: {'A': false, 'B': false}}).must.be.truthy();
    });

    it('must execute disjuction first and implication second', function () {
        exec('A->B|C', {vars: {'A': true, 'B': true, 'C': false}}).must.be.truthy();
        exec('A->B|C', {vars: {'A': true, 'B': false, 'C': false}}).must.be.falsy();
    });

    it('must execute conjunction first and disjunction second', function () {
        exec('A|B&C', {vars: {'A': false, 'B': true, 'C': false}}).must.be.falsy();
        exec('A|B&C', {vars: {'A': false, 'B': false, 'C': true}}).must.be.falsy();
    });

    it('must execute expression between parenthesis first', function () {
        exec('(A->B)&A', {vars: {'A': false, 'B': true}}).must.be.falsy();
        exec('(A->B)&A', {vars: {'A': true, 'B': true}}).must.be.truthy();
    });

    it('must execute complex expressions', function () {
        exec('(!!A->B)&(A)', {vars: {'A': false, 'B': true}}).must.be.falsy();
        exec('(A->B)&(A|A)', {vars: {'A': false, 'B': true}}).must.be.falsy();
        exec('A|B|C', {vars: {'A': false, 'B': true, 'C': true}}).must.be.truthy();
        exec('A&B&C', {vars: {'A': false, 'B': true, 'C': true}}).must.be.falsy();
        exec('A->B&C', {vars: {'A': false, 'B': true, 'C': true}}).must.be.truthy();
        exec('A->B->C', {vars: {'A': false, 'B': true, 'C': true}}).must.be.truthy();
        exec('A->B->C', {vars: {'A': true, 'B': false, 'C': true}}).must.be.truthy();
        exec('A->B->!C', {vars: {'A': true, 'B': false, 'C': true}}).must.be.truthy();
        exec('!(A->B)&((!C)|D)', {vars: {'A': true, 'B': false, 'C': true, 'D': false}}).must.be.falsy();
    });
});
