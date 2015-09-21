var _ = require('lodash');

var parser = require('./../../lib/parser');
var calc = require('./../../lib/logicCalculator');

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    var source = $('#truth-table').html();
    var template = Handlebars.compile(source);

    var container = $('.container');

    var input = $('input[type=text]');
    input.on('input', _.debounce(handler, 800));

    function handler() {
        var text = input.val();
        var alert = $('.alert');
        var table = $('table');

        if (text.length === 0) {
            return;
        }

        try {
            var parseResult = parser.parse(text);
            var ast = parseResult.root;
            var varsName = parseResult.varsName;

            if (varsName.size > 0) {
                var titleCells = [];
                varsName.forEach(function (val) {
                    titleCells.push(val);
                });
                titleCells.push('Result');

                var rows = [];
                var maxIter = Math.pow(2, varsName.size);
                for (var i = 0; i < maxIter; ++i) {
                    var binString = Number(i).toString(2);

                    if (binString.length !== varsName.size) {
                        var diff = varsName.size - binString.length;
                        binString = new Array(diff + 1).join('0') + binString;
                    }

                    var numbers = [];
                    var binStringLength = binString.length;
                    for (var j = 0; j < binStringLength; ++j) {
                        numbers.push(Number(binString[j]));
                    }

                    var vars = {};
                    var counter = 0;
                    varsName.forEach(function (val) {
                        vars[val] = numbers[counter++];
                    });

                    numbers.push(Number(calc(ast, {vars: vars})));
                    rows.push(numbers);
                }

                var context = {titleCells: titleCells, rows: rows};
                var html = template(context);

                if (table.length === 0) {
                    container.append(html);
                } else {
                    table.show();
                    table.html(html);
                }

                alert
                    .html('')
                    .removeClass('alert-danger');
            }
        } catch (e) {
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);

            if (table.length !== 0) {
                table.hide();
            }
        }
    }
});
