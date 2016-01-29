/*
 * Simple logical grammar
 * ======================
 *
 * Accepts expressions like '!!A|B&(C->D)<->E' and builds ast.
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

    var varsNames = new Set();
}

start
    = ast:equivalenceExpr {
        return {
            ast: ast,
            varsNames: Array.from(varsNames).sort()
        };
    }

equivalenceExpr
    = first:implicationExpr rest:(_ '<->' _ implicationExpr)* {
        if (rest.length > 0) {
            return {
                type: 'equivalence',
                left: first,
                right: getExpression(rest)
            };
        } else {
            return first;
        }
    }

implicationExpr
    = first:orExpr rest:(_ '->' _ implicationExpr)* {
        if (rest.length > 0) {
            return {
                type: 'implication',
                left: first,
                right: getExpression(rest)
            };
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
    = '(' _ expr:equivalenceExpr _ ')' {
        return expr;
    }
    / exclamationPoints:$'!'+ '(' _ expr:equivalenceExpr _ ')' {
        return exclamationPointsAreEven(exclamationPoints) ? expr : {
            type: 'negation',
            child: expr
        };
    }
    / variable:$Variable {
        return {
            type: 'variable',
            value: variable
        };
    }
    / exclamationPoints:$'!'+ variable:$Variable {
        return exclamationPointsAreEven(exclamationPoints) ? {
            type: 'variable',
            value: variable
        } : {
            type: 'negation',
            child: {
                type: 'variable',
                value: variable
            }
        }
    }
    / digit:Digit {
        return {
            type: 'digit',
            value: digit
        };
    }
    / exclamationPoints:$'!'+ digit:Digit {
        return exclamationPointsAreEven(exclamationPoints) ? {
            type: 'digit',
            value: digit
        } : {
            type: 'negation',
            child: {
                type: 'digit',
                value: digit
            }
        }
    }

Variable 'variable'
    = variable:$([a-zA-Z][a-zA-Z0-9]*) {
        varsNames.add(variable);
        return variable;
    }

Digit 'digit'
    = digit:[01] {
        return digit == 0 ? false : true;
    }

_ 'whitespace'
    = [ \t\n\r]*
