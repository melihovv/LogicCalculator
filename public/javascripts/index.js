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
    let functionType = $('#functionType');
    let container = $('.container');
    let alert = $('.alert');

    let input = $('input[type=text]');
    input.on('input', _.debounce(handler, 800));

    function handler() {
        let table = $('table');
        let text = input.val();
        if (text.length === 0) {
            return;
        }

        try {
            // Parse input.
            let parseResult = parser.parse(text);
            let ast = parseResult.root;
            let varsNames = parseResult.varsNames;

            // User inputs at least one variable.
            if (varsNames.size > 0) {
                // Fill table header row.
                let titleCells = [];
                varsNames.forEach(function (val) {
                    titleCells.push(val);
                });
                titleCells.push('Result');

                // Build truth table.
                let logicalCalculator = new LogicCalculator(ast, {varsNames: varsNames});
                let truthTable = logicalCalculator.getTruthTable();

                // Output truth table.
                let context = {titleCells: titleCells, rows: truthTable};
                let html = template(context);
                if (table.length === 0) {
                    container.append(html);
                } else {
                    table.html(html);
                    table.show();
                }

                // Output function type.
                functionType.html(LogicCalculator.getFunctionType(truthTable));
                functionType.show();

                pcnf.show();
                pdnf.show();
                pcnf.html('СКНФ: ' + logicalCalculator.getPcnf(truthTable));
                pdnf.html('СДНФ: ' + logicalCalculator.getPdnf(truthTable));

                // Hide alert.
                alert
                    .html('')
                    .removeClass('alert-danger');
            } else {
                let result = Number(LogicCalculator.calculate(parser.parse(text).root));
                let context = {titleCells: ['Result'], rows: [[result]]};
                let html = template(context);
                if (table.length === 0) {
                    container.append(html);
                } else {
                    table.html(html);
                    table.show();
                }

                if (result === 0) {
                    functionType.html('тождестенно-ложная, опровержимая');
                } else {
                    functionType.html('тождественно-истинная, выполнимая');
                }

                pcnf.hide();
                pdnf.hide();
                alert
                    .html('')
                    .removeClass('alert-danger');
            }
        } catch (e) {
            // Show alert.
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);

            if (table.length !== 0) {
                table.hide();
            }

            functionType.hide();
            pcnf.hide();
            pdnf.hide();
        }
    }
});
