module.exports = exec = function (ast, context) {
    'use strict';

    var vars = typeof context === 'object' ? context.vars : {};
    var rootType = ast.type;
    var result;

    switch (rootType) {
        case 'variable':
            result = vars[ast.value];
            break;
        case 'digit':
            result = !!ast.value;
            break;
        case 'negation':
            result = !exec(ast.child, context);
            break;
        case 'or':
            result = exec(ast.left, context);
            ast.right.forEach(function (node) {
                result |= exec(node, context);
            });
            break;
        case 'and':
            result = exec(ast.left, context);
            ast.right.forEach(function (node) {
                result &= exec(node, context);
            });
            break;
        case 'implication':
            result = exec(ast.left, context);
            ast.right.forEach(function (node) {
                result = !result || exec(node, context);
            });
            break;
        case 'equivalence':
            var leftResult = exec(ast.left, context);
            ast.right.forEach(function (node) {
                var rightResult = exec(node, context);
                result = (!leftResult || rightResult) && (leftResult || !rightResult);
                leftResult = rightResult;
            });
            break;
    }

    return Boolean(result);
};
