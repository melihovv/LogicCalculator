var _ = require('lodash');

var parser = require('./../../lib/parser');
var calc = require('./../../lib/logicCalculator');

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    var input = $('input[type=text]');

    input.on('input', _.debounce(handler, 800));

    function handler() {
        var text = input.val();
        var alert = $('.alert');
        var table = $('table');

        if (text.length === 0) {
            table.hide();
            return;
        }

        try {
            var parseResult = parser.parse(text);
            var ast = parseResult.root;
            var varsName = parseResult.varsName;

            if (varsName.size > 0) {
                var tbody = $(table).find('tbody');
                tbody.html('');
                var thead = $(table).find('thead');

                var title = '<tr>';
                varsName.forEach(function (val) {
                    title += '<td>' + val + '</td>';
                });
                title += '<td>Result</td>';
                title += '</tr>';
                thead.html(title);

                var maxIter = Math.pow(2, varsName.size);
                for (var i = 0; i < maxIter; ++i) {
                    var binString = Number(i).toString(2);

                    if (binString.length !== varsName.size) {
                        var diff = varsName.size - binString.length;
                        binString = new Array(diff + 1).join('0') + binString;
                    }

                    var row = '<tr>';
                    var numbers = [];
                    var binStringLength = binString.length;
                    for (var j = 0; j < binStringLength; ++j) {
                        row += '<td>' + binString[j] + '</td>';
                        numbers.push(Number(binString[j]));
                    }

                    var vars = {};
                    var counter = 0;
                    varsName.forEach(function (val) {
                        vars[val] = numbers[counter++];
                    });

                    row += '<td>' + Number(calc(ast, {vars: vars})) + '</td>';
                    row += '</tr>';

                    tbody.append(row);
                }

                table.show();
                alert
                    .html('')
                    .removeClass('alert-danger');
            }
        } catch (e) {
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);
            table.hide();
        }
    }
});
