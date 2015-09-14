/*
 * Simple logical grammar
 * ==========================
 *
 * Accepts expressions like "!A|B&(C->D)" and builds ast.
 */

{
  function combine(first, rest, combiners) {
    var result = first, i;

    for (i = 0; i < rest.length; i++) {
      result = combiners[rest[i][1]](result, rest[i][3]);
    }

    return result;
  }
}

implExpr
  = first:orExpr rest:(_ "->" _ orExpr)* {
      return combine(first, rest, {
        "->": function(left, right) { return Boolean(!left || right); }
      });
    }

orExpr
  = first:andExpr rest:(_ "|" _ andExpr)* {
      return combine(first, rest, {
        "|": function(left, right) { return Boolean(left || right); }
      });
    }

andExpr
  = first:paranthesisExpr rest:(_ "&" _ paranthesisExpr)* {
      return combine(first, rest, {
        "&": function(left, right) { return Boolean(left && right); }
      });
    }

paranthesisExpr
  = "(" _ expr:implExpr _ ")" {return expr;}
  / "!" "(" _ expr:implExpr _ ")" {return !expr;}
  / Integer
  / "!" int:Integer {return !int;}

Integer "integer"
  = [0-9]+ {return parseInt(text(), 10);}

_ "whitespace"
  = [ \t\n\r]*
