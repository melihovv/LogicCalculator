/*
 * Simple logical grammar
 * ==========================
 *
 * Accepts expressions like '!!A|B&(C->D)' and builds ast.
 */

{
    var getExpression = function (rest) {
        var expr = [];
        rest.forEach(function (elem) {
            expr.push(elem[3]);
        });
        return expr;
    };

    var exclamationPointsAreEven = function (str) {
        return (str.match(/!/g) || []).length % 2 == 0;
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
    / exclamationPoints:$'!'+ '(' _ expr:implicationExpr _ ')' {
        return exclamationPointsAreEven(exclamationPoints) ? expr : {
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
    / exclamationPoints:$'!'+ operand:Operand {
        return exclamationPointsAreEven(exclamationPoints) ? {
            type: 'operand',
            value: operand
        } : {
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
