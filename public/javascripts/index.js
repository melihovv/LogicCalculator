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
    let table = [];

    let input1 = $('#input1');
    input1.on('input', _.debounce(handler, 800));

    function handler() {
        let text = input1.val();
        if (text.length === 0) {
            hide();
            return;
        }
        let invertedText = text.replace(/([a-zA-Z][a-zA-Z0-9]*)/g, '!$1');

        try {
            // Parse input.
            let parseResult = parser.parse(text);
            let ast = parseResult.root;
            let varsNames = parseResult.varsNames;

            let invertedParseResult = parser.parse(invertedText);
            let ast2 = invertedParseResult.root;
            let varsNames2 = invertedParseResult.varsNames;

            // Fill table header row.
            let titleCells = [];
            varsNames.forEach(function (val) {
                titleCells.push(val);
            });
            titleCells.push('Result');

            // Build truth table.
            let truthTable = [];
            let logicalCalculator = new LogicCalculator(ast, {varsNames: varsNames});
            let logicalCalculator2 = new LogicCalculator(ast2, {varsNames: varsNames2});

            // User input at least one variable.
            if (varsNames.size) {
                truthTable = logicalCalculator.getTruthTable();
                let truthTable2 = logicalCalculator2.getTruthTable();
                LogicCalculator.invertResults(truthTable2);

                functionType.html('Тип функции: ' + LogicCalculator.getFunctionType(truthTable) + '.');
                pcnf.html('СКНФ: ' + logicalCalculator.getPcnf(truthTable));
                pdnf.html('СДНФ: ' + logicalCalculator.getPdnf(truthTable));
                selfDual.html(_.isEqual(truthTable, truthTable2) ? 'Функция самодвойственная.' : 'Функция не самодвойственная.');
                showFunctionWithVariablesParams();
            } else {
                let result = Number(LogicCalculator.calculate(parser.parse(text).root));
                truthTable = [[result]];

                if (result === 0) {
                    functionType.html('Тип функции: тождественно-ложная, опровержимая.');
                } else {
                    functionType.html('Тип функции: тождественно-истинная, выполнимая.');
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
        }

        function hideFunctionWithVariablesParams() {
            pcnf.hide();
            pdnf.hide();
            selfDual.hide();
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

            if (table.length !== 0) {
                table.hide();
            }
        }
    }
});
