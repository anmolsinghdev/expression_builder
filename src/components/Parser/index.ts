/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-throw-literal */
//  BNF grammar for the expression parser:
//
//      expr ::= mulexpr { addop mulexpr }
//   1  addop ::= "+" | "-"
//      mulexpr ::= powexpr { mulop powexpr }
//   2  mulop ::= "*" | "/"
//   3  powexpr ::= "-" powexpr | "+" powexpr | atom [ "^" powexpr ]
//   4  atom ::= ident [ "(" expr ")" ] | numeric | "(" expr ")"
//   5  numeric ::= /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?/
//   6  ident ::= /[A-Za-z_][A-Za-z_0-9]*/

const validLogicalOperators = ["&&", ">", "<", "<=", ">=", "==", "||", "!="];

export class Token {
  private text: string;
  private index: number;
  private kind: "identifier" | "number" | "operator" | "variable";
  constructor(text: string, index: number) {
    this.text = text;
    this.index = index;

    // Classify the token.
    if (/^\$'[A-Za-z_][A-Za-z_0-9]+'/.test(text)) {
      this.kind = "variable";
    } else if (/^[A-Za-z_]/.test(text)) {
      this.kind = "identifier";
    } else if (/^[0-9]/.test(text)) {
      this.kind = "number";
    } else {
      this.kind = "operator";
    }
  }
}

export class Parser {
  private nextTokenIndex: any;
  private tokenList: any;
  private variablesList: string[];
  constructor(text: any, dataSet: string[]) {
    this.variablesList = [...dataSet];
    this.nextTokenIndex = 0;
    this.tokenList = [];
    const numberRegex = /[0-9]+(\.[0-9]*)?([eE][+-]?[0-9]+)?/;
    const operatorRegex = /AND|OR|and|or|XOR|&&|<=|>=|<|>|!=|==|&|OR*|!|\|{1,2}/;
    const variableRegex = /\$'[A-Za-z_][A-Za-z_0-9]+'+((\[([0-9]+)\])*)?/;
    const identifierRegex = /[A-Za-z_][A-Za-z_0-9]*/;
    const otherCharRegex = /\S/g;

    const reToken = new RegExp(
      numberRegex.source +
        "|" +
        operatorRegex.source +
        "|" +
        variableRegex.source +
        "|" +
        identifierRegex.source +
        "|" +
        otherCharRegex.source,
      otherCharRegex.flags
    );

    for (;;) {
      const match = reToken.exec(text);
      if (match === null) {
        break;
      }
      this.tokenList.push(new Token(match[0], match.index));
    }
  }

  Parse() {
    const expr = this.ParseExpr();
    if (this.nextTokenIndex < this.tokenList.length) {
      throw {
        name: "SyntaxError",
        message: "Syntax error",
        token: this.tokenList[this.nextTokenIndex],
      };
    }
    return expr;
  }

  ParseExpr() {
    // expr ::= mulexpr { addop mulexpr }
    let expr: any = this.ParseMulExpr();
    let optoken;
    while ((optoken = this.NextTokenIs(["+", "-"]))) {
      const right = this.ParseMulExpr();
      if (optoken.text === "+") {
        expr = new Expression_Add(optoken, expr, right);
      } else {
        expr = new Expression_Subtract(optoken, expr, right);
      }
    }
    return expr;
  }

  ParseMulExpr() {
    // mulexpr ::= powexpr { mulop powexpr }
    let expr = this.parseLogicalExpr();
    let optoken;
    while ((optoken = this.NextTokenIs(["*", "/"]))) {
      const right = this.parseLogicalExpr();
      if (optoken.text === "*") {
        expr = new Expression_Multiply(optoken, expr, right);
      } else {
        expr = new Expression_Divide(optoken, expr, right);
      }
    }
    return expr;
  }

  parseLogicalExpr() {
    let expr = this.ParsePowExpr();
    let optoken;
    while ((optoken = this.NextTokenIs([...validLogicalOperators]))) {
      const right: any = this.parseLogicalExpr();

      expr = new Expression_Logical(optoken, expr, right);
    }
    return expr;
  }

  ParsePowExpr() {
    // powexpr ::= "-" powexpr | "+" powexpr | atom [ "^" powexpr ]

    // Eliminate any leading unary '+' operators, because they don't do anything.
    while (this.NextTokenIs(["+"])) {
      // do nothing
    }

    let optoken;
    if ((optoken = this.NextTokenIs(["-"]))) {
      const optoken = this.GetNextToken();
      const arg: any = this.ParsePowExpr();
      return new Expression_Negative(optoken, arg);
    }

    const expr = this.ParseAtom();
    if ((optoken = this.NextTokenIs(["^"]))) {
      const right: any = this.ParsePowExpr(); // use recursion for right-associative ^ operator
      return new Expression_Power(optoken, expr, right);
    }

    return expr;
  }

  ParseAtom() {
    // atom ::= ident [ "(" expr ")" ] | numeric | "(" expr ")"
    const token = this.GetNextToken();
    if (token.kind === "variable") {
      if (this.NextTokenIs(["("])) {
        const arglist = [this.ParseExpr()];
        this.ExpectToken(")");
        return new Expression_Function(token, arglist);
      }
      return new Expression_Variable(token, this.variablesList);
    }
    if (token.kind === "identifier") {
      if (this.NextTokenIs(["("])) {
        const arglist = [this.ParseExpr()];
        this.ExpectToken(")");
        return new Expression_Function(token, arglist);
      }
      return new Expression_Identifier(token);
    }

    if (token.kind === "number") {
      return new Expression_Number(token);
    }

    if (token.text === "(") {
      const expr = this.ParseExpr();
      this.ExpectToken(")");
      return expr;
    }

    throw {
      name: "SyntaxError",
      message:
        "Expected identifier, number, function, or parenthesized expression.",
      token: token,
    };
  }

  PeekNextToken() {
    if (this.nextTokenIndex < this.tokenList.length) {
      return this.tokenList[this.nextTokenIndex];
    }
    return null;
  }

  GetNextToken() {
    if (this.nextTokenIndex < this.tokenList.length) {
      return this.tokenList[this.nextTokenIndex++];
    }
    const errorMessage =
      this.tokenList.length !== 0
        ? "Unexpected end of expression"
        : "Logic Value cannot be left empty.";
    throw {
      name: "SyntaxError",
      message: errorMessage,
      token: null,
    };
  }

  NextTokenIs(validOptionList: any) {
    if (this.nextTokenIndex < this.tokenList.length) {
      const text = this.tokenList[this.nextTokenIndex].text;
      if (validOptionList.indexOf(text) >= 0) {
        return this.tokenList[this.nextTokenIndex++];
      }
    }
    return null;
  }

  ExpectToken(text: any) {
    const token = this.PeekNextToken();
    if (token === null || token.text !== text) {
      console.log("token :", token, text);

      let errorMessage = "Syntax error";
      if (token == null) {
        errorMessage = 'Expected "' + text + '"';
      }
      throw {
        name: "SyntaxError",
        message: errorMessage,
        token: token,
      };
    }
    return this.tokenList[this.nextTokenIndex++];
  }
}

export class Expression {
  public precedence: any;
  public optoken: any;
  public arglist: any;
  constructor(precedence: any, optoken: any, arglist: any) {
    this.precedence = precedence;
    this.optoken = optoken;
    this.arglist = arglist;
  }

  PrettyMath() {
    throw {
      name: "InternalError",
      message: "Do not know how to convert expression to TeX.",
      token: this.optoken,
    };
  }

  PrettyMath_Binary_LeftAssoc(opsymbol?: any) {
    let left = this.arglist[0].PrettyMath();
    let right = this.arglist[1].PrettyMath();

    // Use parentheses around the left child expression
    // if its operator precedence is less than this node's precedence.
    // If it is equal, assume left-associativity means parentheses are not needed.
    if (this.arglist[0].precedence < this.precedence) {
      left = "\\left(" + left + "\\right)";
    }

    // Use parentheses around the right child expression
    // if operator precedence is lower or equal.
    // Even if equal, parentheses are needed because we are
    // overriding left-associativity.
    if (this.arglist[1].precedence <= this.precedence) {
      right = "\\left(" + right + "\\right)";
    }

    return left + (opsymbol || this.optoken.text) + right;
  }

  PrettyMath_Binary_RightAssoc() {
    // Similar to left associative, only we use
    // parentheses when the left child expression
    // has equal precedence, not the right.

    let left = this.arglist[0].PrettyMath();
    let right = this.arglist[1].PrettyMath();

    if (this.arglist[0].precedence <= this.precedence) {
      left = "\\left(" + left + "\\right)";
    }

    if (this.arglist[1].precedence < this.precedence) {
      right = "\\left(" + right + "\\right)";
    } else {
      right = "{" + right + "}"; // for exponentiation
    }

    return left + this.optoken.text + right;
  }

  PrettyMath_SingleArg() {
    if (this.arglist.length !== 1) {
      throw {
        name: "FormatError",
        message: `The function "${this.optoken.text}" requires exactly one argument.`,
        token: this.optoken,
      };
    }
    return this.arglist[0].PrettyMath();
  }
}

export class Expression_Add extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(1, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_LeftAssoc();
  }
}

export class Expression_Subtract extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(1, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_LeftAssoc();
  }
}

export class Expression_Multiply extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(2, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_LeftAssoc(" ");
  }
}

export class Expression_Divide extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(2, optoken, [left, right]);
  }

  PrettyMath() {
    // Use fraction notation. Operator precedence is irrelevant.
    return (
      "\\frac{" +
      this.arglist[0].PrettyMath() +
      "}{" +
      this.arglist[1].PrettyMath() +
      "}"
    );
  }
}

export class Expression_Logical_And extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(2, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_LeftAssoc();
  }
}

export class Expression_Logical extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(2, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_LeftAssoc();
  }
}
export class Expression_Power extends Expression {
  constructor(optoken: any, left: any, right: any) {
    super(4, optoken, [left, right]);
  }

  PrettyMath() {
    return this.PrettyMath_Binary_RightAssoc();
  }
}
export class Expression_Negative extends Expression {
  constructor(optoken: any, arg: any) {
    super(3, optoken, [arg]);
  }

  PrettyMath() {
    // Unary prefix operator.
    const argtext = this.arglist[0].PrettyMath();
    if (this.arglist[0].precedence < this.precedence) {
      return "-\\left(" + argtext + "\\right)";
    }
    return "-" + argtext;
  }
}

function isVariablePresent(variables: string[], textToBeMatched: string) {
  let isMatched = false;
  variables.forEach((item) => {
    if (`$'${item}'` === textToBeMatched) {
      isMatched = true;
    }
  });
  return isMatched;
}

export class Expression_Variable extends Expression {
  private variablesList: string[];
  constructor(token: any, variablesList: string[]) {
    super(9, token, []);
    this.variablesList = [...variablesList];
  }

  PrettyMath() {
    // Any identifier that is a single Latin letter is already valid TeX.
    const textLength = this.optoken.text.length;
    let lastIndex = this.optoken.text.indexOf("[");
    if (lastIndex === -1) {
      lastIndex = textLength;
    }
    const textToBeMatched = this.optoken.text.substring(0, lastIndex);
    if (
      /^\$'[A-Za-z_][A-Za-z_0-9]+'+((\[([0-9]+)\])*)?$/.test(
        this.optoken.text
      ) &&
      isVariablePresent(this.variablesList, textToBeMatched)
    )
      return this.optoken.text;

    // Multi-character identifiers must be a lowercase Greek
    // letter (e.g. alpha) or an uppercase Greek letter (e.g. Alpha).
    // In that case, the TeX string is \alpha or \Alpha.
    // if (GreekLetters[this.optoken.text]) return "\\" + this.optoken.text;

    // Anything other than Latin or Greek letters is an error.
    throw {
      name: "FormatError",
      message: `The variable ${this.optoken.text} is not valid. Must be a valid input name .`,
      token: this.optoken,
    };
  }
}
export class Expression_Identifier extends Expression {
  constructor(token: any) {
    super(9, token, []);
  }

  PrettyMath() {
    // Any identifier that is a single Latin letter is already valid TeX.
    if (/^[A-Za-z_][A-Za-z_0-9]*$/.test(this.optoken.text))
      return this.optoken.text;

    // Multi-character identifiers must be a lowercase Greek
    // letter (e.g. alpha) or an uppercase Greek letter (e.g. Alpha).
    // In that case, the TeX string is \alpha or \Alpha.
    // if (GreekLetters[this.optoken.text]) return "\\" + this.optoken.text;

    // Anything other than Latin or Greek letters is an error.
    throw {
      name: "FormatError",
      message: `The identifier ${this.optoken.text} is not valid. Must be a Latin letter or the name of a Greek letter.`,
      token: this.optoken,
    };
  }
}

export class Expression_Number extends Expression {
  constructor(token: any) {
    super(9, token, []);
  }

  PrettyMath() {
    const m = this.optoken.text.match(/^([^eE]+)[eE](.*)$/);
    if (m) {
      // Convert scientific notation:  1.23e-4 ==> 1.23 \times 10^{-4}
      return m[1] + " \\times 10^{" + m[2] + "}";
    }
    return this.optoken.text;
  }
}

export class Expression_Function extends Expression {
  constructor(token: any, arglist: any) {
    super(9, token, arglist);
  }

  PrettyMath() {
    switch (this.optoken.text) {
      case "sqrt":
        return "\\sqrt{" + this.PrettyMath_SingleArg() + "}";

      case "abs":
        return "\\left|" + this.PrettyMath_SingleArg() + "\\right|";

      case "cos":
      case "sin":
        return (
          "\\" +
          this.optoken.text +
          "\\left(" +
          this.PrettyMath_SingleArg() +
          "\\right)"
        );

      default:
        throw {
          name: "FormatError",
          message: 'Unknown function "' + this.optoken.text + '"',
          token: this.optoken,
        };
    }
  }
}
