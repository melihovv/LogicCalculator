var _ = require('lodash');

var parser = require('./lib/parser');
var calc = require('./lib/logicCalculator');

var exec = function (input, vars) {
    return Boolean(calc(parser.parse(input), {vars: vars}));
};

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    var input = $('input[type=text]');

    input.on('input', _.debounce(handler, 800));
    $('input[type=checkbox]').on('click', handler);

    function handler() {
        console.log('hello');
        var text = input.val();
        var vars = {
            'A': $('#A').is(':checked'),
            'B': $('#B').is(':checked'),
            'C': $('#C').is(':checked'),
            'D': $('#D').is(':checked')
        };
        var alert = $('.alert');
        var table = $('table');

        try {
            var ast = parser.parse(text);
            var result = calc(ast, {vars: vars});
            alert
                .removeClass('alert-danger')
                .addClass('alert-success')
                .text(result);

            var results = [];
            var values = [];
            [false, true].forEach(function (A) {
                [false, true].forEach(function (B) {
                    [false, true].forEach(function (C) {
                        [false, true].forEach(function (D) {
                            results.push(calc(ast, {
                                vars: {
                                    'A': A,
                                    'B': B,
                                    'C': C,
                                    'D': D
                                }
                            }));
                            values.push([A, B, C, D]);
                        });
                    });
                });
            });

            var tbody = $(table).find('tbody');

            values.forEach(function (tr, index) {
                var row = '<tr>';
                tr.forEach(function (td) {
                    row += '<td>' + td + '</td>';
                });
                row += '<td>' + results[index] + '</td>' + '</tr>';
                tbody.append(row);
            });

            table.show();
        } catch (e) {
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);
            table.hide();
        }
    }
});
