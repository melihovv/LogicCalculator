/*
 * Simple logical grammar
 * ==========================
 *
 * Accepts expressions like '!A|B&(C->D)' and builds ast.
 */

{
    var getExpression = function (rest) {
        var expr = [];
        rest.forEach(function (elem) {
            expr.push(elem[3]);
        });
        return expr;
    };
}

implicationExpr
    = first:orExpr rest:(_ '->' _ orExpr)* {
        if (rest.length > 0) {
            return {type: 'implication', left: first, right: getExpression(rest)};
        } else {
            return first;
        }
    }

orExpr
    = first:andExpr rest:(_ '|' _ andExpr)* {
        if (rest.length > 0) {
            return {type: 'or', left: first, right: getExpression(rest)};
        } else {
            return first;
        }
    }

andExpr
    = first:parenthesisExpr rest:(_ '&' _ parenthesisExpr)* {
        if (rest.length > 0) {
            return {type: 'and', left: first, right: getExpression(rest)};
        } else {
            return first;
        }
    }

parenthesisExpr
    = '(' _ expr:implicationExpr _ ')' {
        return expr;
    }
    / '!' '(' _ expr:implicationExpr _ ')' {
        return {
            type: 'negation',
            child: expr
        };
    }
    / operand:$Operand {
        return {
            type: 'operand',
            value: operand
        };
    }
    / '!' operand:Operand {
        return {
            type: 'negation',
            child: {
                type: 'operand',
                value: operand
            }
        }
    }

Operand 'operand'
    = operand:$[A-Z] {
        return operand;
    }

_ 'whitespace'
    = [ \t\n\r]*
