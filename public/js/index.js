'use strict';

let _ = require('lodash');

let parser = require('./../../lib/parser');
let LogicCalculator = require('./../../lib/logicCalculator');

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    $('input').on('keypress', handler);

    let source = $('#truth-table').html();
    let template = Handlebars.compile(source);

    let alert = $('.alert');
    let tabs = $('.tabs');

    function handler(e) {
        if (e.keyCode !== 13) {
            return;
        }

        let $this = $(this);
        let target = $this.attr('data-target');

        let text = $this.val();
        if (text.length === 0) {
            let $target = $(target);
            $target.html('');
            if ($target.siblings('div').html() === '') {
                tabs.hide();
            }
            return;
        }

        try {
            let parseResult = parser.parse(text);

            // Fill table header row.
            let titleCells = [];
            parseResult.varsNames.forEach(function (val) {
                titleCells.push(val);
            });
            titleCells.push('Result');

            // Build truth table.
            let truthTable = [];
            let logicalCalculator = new LogicCalculator(parseResult.root, {
                varsNames: parseResult.varsNames
            });

            // User input at least one variable.
            let info = {};
            if (parseResult.varsNames.size) {
                truthTable = logicalCalculator.getTruthTable();

                info.functionType = LogicCalculator
                        .getFunctionType(truthTable) + '.';
                info.pcnf = logicalCalculator.getPcnf(truthTable);
                info.pdnf = logicalCalculator.getPdnf(truthTable);
                info.mdnf = logicalCalculator.mdnf(info.pdnf);
                info.mcnf = logicalCalculator.mcnf(info.pcnf);
                info.selfDual = LogicCalculator.isSelfDual(truthTable) ?
                    'Self dual function.' :
                    'Not self dual function.';

                let secondInput = $this.siblings('input').val();
                if (secondInput.length !== 0) {
                    let secondParseResult = parser.parse(secondInput);

                    let secondLogicCalculator = new LogicCalculator(
                        secondParseResult.root, {
                            varsNames: secondParseResult.varsNames
                        });

                    if (secondParseResult.varsNames &&
                        secondParseResult.varsNames.size) {
                        let secondTruthTable = secondLogicCalculator
                            .getTruthTable();
                        info.dual = 'The function ' + secondInput +
                        logicalCalculator.isDual(secondTruthTable) ?
                        ' is dual function of the this one.' :
                        ' isn\'t dual function of the this one.';
                    }
                }
            } else {
                let result = Number(LogicCalculator.calculate(
                    parseResult.root,
                    {}
                ));
                truthTable = [[result]];

                info.functionType = result === 0 ?
                    'Function type: identically-false, rebuttable.' :
                    'Function type: identically-true, doable.';
            }

            // Output truth table.
            let context = {
                table: {
                    titleCells: titleCells,
                    rows: truthTable
                },
                info: info
            };
            let html = template(context);

            let $target = $(target);
            $target.html(html);
            $target.addClass('active').siblings('div').removeClass('active');
            $('a[href=' + target + ']').parent().addClass('active')
                .siblings('li').removeClass('active');
            tabs.show();

            alert.text('').removeClass('alert-danger');
        }
        catch (e) {
            alert
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);

            tabs.hide();
        }
    }
});
