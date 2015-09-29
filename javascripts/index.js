'use strict';

let _ = require('lodash');

let parser = require('./../../lib/parser');
let LogicCalculator = require('./../../lib/logicCalculator');

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    let source = $('#truth-table').html();
    let template = Handlebars.compile(source);

    let pcnf = $('#pcnf');
    let pdnf = $('#pdnf');
    let doubledFunction = $('#doubledFunction');
    let functionType = $('#functionType');
    let container = $('.container');
    let alert = $('.alert');
    let selfDual = $('#selfDual');
    let dual = $('#dual');
    let table = [];

    let input1 = $('#input1');
    let input2 = $('#input2');
    input1.on('keypress', handler);
    input2.on('keypress', handler);

    function handler(e) {
        if (e.keyCode !== 13) {
            return;
        }

        let text = input1.val();
        if (text.length === 0) {
            hide();
            return;
        }
        let invertedText = text.replace(/([a-zA-Z][a-zA-Z0-9]*)/g, '!$1');
        let text2 = input2.val();

        try {
            // Parse input.
            let parseResult = parser.parse(text);
            let invertedParseResult = parser.parse(invertedText);

            let parseResult2 = {};
            let logicalCalculator2 = {};
            if (text2.length) {
                parseResult2 = parser.parse(text2);
                logicalCalculator2 = new LogicCalculator(parseResult2.root, {varsNames: parseResult2.varsNames});
            }

            // Fill table header row.
            let titleCells = [];
            parseResult.varsNames.forEach(function (val) {
                titleCells.push(val);
            });
            titleCells.push('Result');

            // Build truth table.
            let truthTable = [];
            let logicalCalculator = new LogicCalculator(parseResult.root, {varsNames: parseResult.varsNames});
            let invertedLogicalCalculator = new LogicCalculator(invertedParseResult.root, {varsNames: invertedParseResult.varsNames});

            // User input at least one variable.
            if (parseResult.varsNames.size) {
                truthTable = logicalCalculator.getTruthTable();
                let invertedTruthTable = invertedLogicalCalculator.getTruthTable();
                LogicCalculator.invertResults(invertedTruthTable);

                if (parseResult2.varsNames && parseResult2.varsNames.size) {
                    let truthTable2 = logicalCalculator2.getTruthTable();
                    if (_.isEqual(invertedTruthTable, truthTable2)) {
                        dual.html('The second function is dual function of the first one.');
                    } else {
                        dual.html('The second function isn\'t dual function of the first one.');
                    }
                } else {
                    dual.hide();
                }

                functionType.html('Function type: ' + LogicCalculator.getFunctionType(truthTable) + '.');
                pcnf.html('PCNF: ' + logicalCalculator.getPcnf(truthTable));
                pdnf.html('PDNF: ' + logicalCalculator.getPdnf(truthTable));
                selfDual.html(_.isEqual(truthTable, invertedTruthTable) ? 'Self dual function.' : 'Not self dual function.');
                showFunctionWithVariablesParams();
            } else {
                let result = Number(LogicCalculator.calculate(parser.parse(text).root));
                truthTable = [[result]];

                if (result === 0) {
                    functionType.html('Function type: identically-false, rebuttable.');
                } else {
                    functionType.html('Function type: identically-true, doable.');
                }

                hideFunctionWithVariablesParams();
            }

            // Output truth table.
            let context = {titleCells: titleCells, rows: truthTable};
            let html = template(context);
            fillTable(html);

            show();
        } catch (e) {
            hide();
            showAlert(e);
        }

        function fillTable(html) {
            if (table.length === 0) {
                container.append(html);
                table = $('table');
            } else {
                table.html(html);
            }
        }

        function show() {
            alert
                .html('')
                .removeClass('alert-danger');

            table.show();
            functionType.show();
        }

        function showFunctionWithVariablesParams() {
            pcnf.show();
            pdnf.show();
            selfDual.show();
            dual.show();
        }

        function hideFunctionWithVariablesParams() {
            pcnf.hide();
            pdnf.hide();
            selfDual.hide();
            dual.hide();
        }

        function showAlert(e) {
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);
        }

        function hide() {
            pcnf.hide();
            pdnf.hide();
            functionType.hide();
            selfDual.hide();
            dual.hide();

            if (table.length !== 0) {
                table.hide();
            }
        }
    }
});
