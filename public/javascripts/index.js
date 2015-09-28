var _ = require('lodash');

var parser = require('./../../lib/parser');
var calc = require('./../../lib/logicCalculator');

$(document).ready(function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
    });

    var source = $('#truth-table').html();
    var template = Handlebars.compile(source);

    // Тождественно истинная - всегда 1.
    // Тождественно ложная - всегда 0.
    // Выполнимая - может быть 1.
    // Опровержимая - может быть 0.
    var functionType = $('#functionType');

    var container = $('.container');
    var alert = $('.alert');
    var table = $('table');
    var input = $('input[type=text]');
    input.on('input', _.debounce(handler, 800));

    function handler() {
        var text = input.val();
        if (text.length === 0) {
            return;
        }

        try {
            var parseResult = parser.parse(text);
            var ast = parseResult.root;
            var varsName = parseResult.varsName;

            var isAlwaysTrue = true;
            var isAlwaysFalse = false;
            var isExecutable = false;

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

                    var result = Number(calc(ast, {vars: vars}));

                    isAlwaysTrue = isAlwaysTrue && result;
                    isAlwaysFalse = isAlwaysFalse || result;
                    if (result == true) {
                        isExecutable = true;
                    } else {
                        isRebuttable = true;
                    }

                    numbers.push(result);
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

                if (isAlwaysTrue) {
                    functionType.html('тождественно-истинная, выполнимая');
                } else if (!isAlwaysFalse) {
                    functionType.html('тождественно-ложная, опровержимая');
                } else if (isExecutable) {
                    functionType.html('выполнимая, опровержимая');
                }
                functionType.show();
            }
        } catch (e) {
            alert
                .removeClass('alert-success')
                .addClass('alert-danger')
                .text(e.line + '.' + e.column + ': ' + e.message);

            if (table.length !== 0) {
                table.hide();
            }

            functionType.hide();
        }
    }
});
