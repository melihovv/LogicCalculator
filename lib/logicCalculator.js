module.exports = exec = function (ast, context) {
    'use strict';

    var vars = context.vars;
    var result;
    var rootType = ast.type;

    switch (rootType) {
        case 'operand':
            result = vars[ast.value];
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
    }

    return Boolean(result);
};
