/*
 *
 *       A shout out to Jerud J. Mead.
 *
 */
package parser;

import java.util.*;
import tokenizer.*;
import syntaxTree.*;
import exceptions.*;
import debug.*;

public class Parser {

    public Parser(Tokenizer tokenStream) {
    // Pre:  tokenStream has a value
    // Post: debug == new ParserDebug() AND 
    //       this.tokenStream == tokenStream AND
    //       class invariant is true
        this.debug = new ParserDebug(); 
        this.tokenStream = tokenStream;

        currentToken = tokenStream.getNextToken();
        // This makes the class invariant true
        // for the call to parseProgram
    }

    public ProgramST parseProgram() throws ParseException {
    // Grammar Rule:  Program -- Exp [ Where ] eotT

        debug.show("Entering parseProgram");

        ExpST expr = parseExp();
        if (currentToken.getType() == Token.TokenType.WHERE_T)
          fnDefList = parseWhere();
        consume(Token.TokenType.EOT_T);

        debug.show("Leaving parseProgram");
        return new ProgramST(expr, fnDefList);
    }

    private LinkedList parseFnDefList() throws ParseException {
    // Grammar Rule: FnDefList -- FnDef { scolonT FnDef }

      debug.show("Entering parseFnDefList");

      LinkedList fnDefList = new LinkedList();
      fnDefList.add(parseFnDef());

      while (currentToken.getType() == Token.TokenType.SCOLON_T) {
        consume(Token.TokenType.SCOLON_T);
        fnDefList.add(parseFnDef());
      }

      debug.show("Leaving parseFnDefList");
      return fnDefList;
    }

    private FnDefST parseFnDef() throws ParseException {
    // Grammar Rule: FnDef -- identT ParamList assignT Exp [ Where ]

      debug.show("Entering parseFnDef");

      Token name = currentToken;
      consume(Token.TokenType.IDENT_T);

      LinkedList paramList = parseParamList();
      consume(Token.TokenType.ASSIGN_T);
      ExpST expr = parseExp();
      LinkedList fnDefList = new LinkedList();
      if (currentToken.getType() == Token.TokenType.WHERE_T)
        fnDefList = parseWhere();

      debug.show("Leaving parseFnDef");
      return new FnDefST(name, paramList, expr, fnDefList);
    }

    private LinkedList parseWhere() throws ParseException {
    // Grammar Rule: Where -- whereT FnDefList endwT

      debug.show("Entering parseWhere");

      consume(Token.TokenType.WHERE_T);
      LinkedList fnDefList = parseFnDefList();
      consume(Token.TokenType.ENDW_T);

      debug.show("Leaving parseWhere");
      return fnDefList;
    }

    private LinkedList parseParamList() throws ParseException {
    // Grammar Rule: ParamList -- identT { identT }

      debug.show("Entering parseParamList");

      LinkedList paramList = new LinkedList();
      paramList.add(currentToken);
      consume(Token.TokenType.IDENT_T);

      while (currentToken.getType() == Token.TokenType.IDENT_T) {
        paramList.add(currentToken);
        consume(Token.TokenType.IDENT_T);
      }

      debug.show("Leaving parseParamList");
      return paramList;
    }

    private ExpST parseExp() throws ParseException {
    // Grammar Rule: Exp -- subtT Factor
    //                   -- FnApp
    //                   -- Selection
    //                   -- MExp

      debug.show("Entering parseExp");

      ExpST expr;
      switch (currentToken.getType()) {
        case SUB_T   : consume(Token.TokenType.SUB_T);
                       expr = new NegEXP(parseFactor());
                       break;
        case IF_T    : expr = parseSelection();
                       break;
        case INT_T   :
        case LP_T    : expr = parseMExp();
                       break;
        case IDENT_T :
                    { // Must look at another token (peek)
                      Token next = tokenStream.getNextToken();
                      tokenStream.putBackToken();
                      switch (next.getType()) {
                        case INT_T   :
                        case IDENT_T :
                        case LP_T    : expr = parseFnApp(); break;
                        // let parseMExp() check for an error!
                        default: expr = parseMExp();
                      }
                    }
                    break;
        default: throw new ParseException("Expected SUB_T, IF_T, INT_T,"
                     + " LP_T, or IDENT_T", currentToken);

      }

      debug.show("Leaving parseExp");
      return expr;
    }

    private ExpST parseMExp() throws ParseException {
    // Grammar Rule: MExp -- Term RestOfMExp

      debug.show("Entering parseMExp");

      ExpST leftExpr = parseTerm();
      leftExpr = parseRestOfMExp(leftExpr);

      debug.show("Leaving parseMExp");
      return leftExpr;
    }

    private ExpST parseRestOfMExp(ExpST leftExpr) throws ParseException {
    // Grammar Rule: RestOfExp -- ( addT | subtT ) Term RestOfMExp | e

      debug.show("Entering parseRestOfMExp");

      ExpST expr = leftExpr;

      Token.TokenType type = currentToken.getType();
      if (type == Token.TokenType.ADD_T || type == Token.TokenType.SUB_T) {
        // Assert: type == ADD_T or SUB_T
        Token op = currentToken;
        consume(type);

        ExpST rightExpr = parseTerm();
        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);
        expr = parseRestOfMExp(combinedExpr);
      } // Else, do nothing!

      debug.show("Leaving parseRestOfMExp");
      return expr;
    }

    private ExpST parseTerm() throws ParseException {
    // Grammar Rule: Term -- Factor RestOfTerm

      debug.show("Entering parseTerm");

      ExpST expr;
      expr = parseFactor();
      expr = parseRestOfTerm(expr);

      debug.show("Leaving parseTerm");
      return expr;
    }

    private ExpST parseRestOfTerm(ExpST leftExpr) throws ParseException {
    // Grammar Rule: RestOfTerm -- ( mulT | divT | modT ) Factor RestOfTerm | e

      debug.show("Entering parseTerm");

      ExpST expr = leftExpr;

      Token.TokenType type = currentToken.getType();
      if (type == Token.TokenType.MUL_T ||
          type == Token.TokenType.DIV_T ||
          type == Token.TokenType.MOD_T) {
        // Assert: type == MUL_T or DIV_T or MOD_T
        Token op = currentToken;
        consume(type);

        ExpST rightExpr = parseFactor();
        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);
        expr = parseRestOfTerm(combinedExpr);
      } // Else, do nothing!

      debug.show("Leaving parseTerm");
      return expr;
    }


    private ExpST parseFactor() throws ParseException {
    // Grammar Rule: Factor -- intT
    //                      -- idenT
    //                      -- lpT Exp rpT

      debug.show("Entering parseFactor");

      ExpST expr;
      switch (currentToken.getType()) {
        case INT_T   : Token value = currentToken;
                       expr = new IntEXP(value);
                       consume(Token.TokenType.INT_T);
                       break;
        case IDENT_T : Token name = currentToken;
                       consume(Token.TokenType.IDENT_T);
                       expr = new IdentEXP(name);
                       break;
        case LP_T    : consume(Token.TokenType.LP_T);
                       expr = parseExp();
                       consume(Token.TokenType.RP_T);
                       break;
        default: throw new ParseException("Expected to see INT_T, IDENT_T, or LP_T",
                     currentToken);
      }

      debug.show("Leaving parseFactor");
      return expr;
    }
}
