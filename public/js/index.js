'use strict';

import LogicCalculator from './../../lib/logicCalculator';

/**
 * The {{#exists}} helper checks if a variable is defined.
 */
Handlebars.registerHelper('exists', function (variable, options) {
    if (typeof variable !== 'undefined') {
        return options.fn(this);
    }
});

$(() => {
    const $source = $('#truth-table').html();
    const template = Handlebars.compile($source);

    const $alert = $('.alert');
    const $tabs = $('.tabs');

    const $form = $('form');
    const $input1 = $form.find('input:nth-child(1)');
    const $input2 = $form.find('input:nth-child(2)');

    $form.on('keypress', (e) => {
        // Continue if only enter is pressed.
        if (e.keyCode !== 13) {
            return;
        }

        if ($input1.val().length === 0 && $input2.val().length === 0) {
            $tabs.hide();
            return;
        }

        handler($input1);
        handler($input2);
    });

    function handler($this) {
        try {
            const text = $this.val();
            const $target = $($this.attr('data-target'));
            if (text.length === 0) {
                $target.html('');
                return;
            }

            // Build truth table.
            const calc = new LogicCalculator(text);

            const info = {};
            let truthTable = calc.truthTable();

            if (calc.isIdenticallyTrue) {
                info.functionType = 'identically-true, doable';
            } else if (calc.isIdenticallyFalse) {
                info.functionType = 'identically-false, rebuttable';
            } else {
                info.functionType = 'doable, rebuttable';
            }

            info.pcnf = calc.pcnf();
            info.pdnf = calc.pdnf();
            info.mdnf = calc.mdnf();
            info.mcnf = calc.mcnf();

            info.selfDual = calc.isSelfDual() ?
                'Self dual function.' :
                'Not self dual function.';

            const text2 = $this.siblings('input').val();
            if (text2.length !== 0) {
                info.dual = calc.isDual(
                    new LogicCalculator(text2).truthTable()
                );
            }

            // Output truth table and function properties.
            const context = {
                table: {
                    titleCells: calc.varsNames,
                    rows: truthTable
                },
                info
            };
            const html = template(context);

            $target.html(html);
            $tabs.show();

            $alert.text('').removeClass('alert-danger');
        } catch (e) {
            let text = e.message;
            if (e.name === 'SyntaxError') {
                text = `${e.location.start.line}.${e.location.start.column}: ` +
                    `${e.message}`;
            }

            $alert
                .addClass('alert-danger')
                .text(text);

            $tabs.hide();
        }
    }
});
