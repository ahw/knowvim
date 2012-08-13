<?php require("header-global.php"); ?>
<pre class="lineno">  1</pre><pre class="inputline">/*</pre>
<pre class="lineno">  2</pre><pre class="inputline"> *</pre>
<pre class="lineno">  3</pre><pre class="inputline"> *       A shout out to Jerud J. Mead.</pre>
<pre class="lineno">  4</pre><pre class="inputline"> *</pre>
<pre class="lineno">  5</pre><pre class="inputline"> */</pre>
<pre class="lineno">  6</pre><pre class="inputline">package parser;</pre>
<pre class="lineno">  7</pre><pre class="inputline"> </pre>
<pre class="lineno">  8</pre><pre class="inputline">import java.util.*;</pre>
<pre class="lineno">  9</pre><pre class="inputline">import tokenizer.*;</pre>
<pre class="lineno"> 10</pre><pre class="inputline">import syntaxTree.*;</pre>
<pre class="lineno"> 11</pre><pre class="inputline">import exceptions.*;</pre>
<pre class="lineno"> 12</pre><pre class="inputline">import debug.*;</pre>
<pre class="lineno"> 13</pre><pre class="inputline"> </pre>
<pre class="lineno"> 14</pre><pre class="inputline">public class Parser {</pre>
<pre class="lineno"> 15</pre><pre class="inputline"> </pre>
<pre class="lineno"> 16</pre><pre class="inputline">    public Parser(Tokenizer tokenStream) {</pre>
<pre class="lineno"> 17</pre><pre class="inputline">    // Pre:  tokenStream has a value</pre>
<pre class="lineno"> 18</pre><pre class="inputline">    // Post: debug == new ParserDebug() AND</pre>
<pre class="lineno"> 19</pre><pre class="inputline">    //       this.tokenStream == tokenStream AND</pre>
<pre class="lineno"> 20</pre><pre class="inputline">    //       class invariant is true</pre>
<pre class="lineno"> 21</pre><pre class="inputline">        this.debug = new ParserDebug();</pre>
<pre class="lineno"> 22</pre><pre class="inputline">        this.tokenStream = tokenStream;</pre>
<pre class="lineno"> 23</pre><pre class="inputline"> </pre>
<pre class="lineno"> 24</pre><pre class="inputline">        currentToken = tokenStream.getNextToken();</pre>
<pre class="lineno"> 25</pre><pre class="inputline">        // This makes the class invariant true</pre>
<pre class="lineno"> 26</pre><pre class="inputline">        // for the call to parseProgram</pre>
<pre class="lineno"> 27</pre><pre class="inputline">    }</pre>
<pre class="lineno"> 28</pre><pre class="inputline"> </pre>
<pre class="lineno"> 29</pre><pre class="inputline">    public ProgramST parseProgram() throws ParseException {</pre>
<pre class="lineno"> 30</pre><pre class="inputline">    // Grammar Rule:  Program -- Exp [ Where ] eotT</pre>
<pre class="lineno"> 31</pre><pre class="inputline"> </pre>
<pre class="lineno"> 32</pre><pre class="inputline">        debug.show("Entering parseProgram");</pre>
<pre class="lineno"> 33</pre><pre class="inputline"> </pre>
<pre class="lineno"> 34</pre><pre class="inputline">        ExpST expr = parseExp();</pre>
<pre class="lineno"> 35</pre><pre class="inputline">        if (currentToken.getType() == Token.TokenType.WHERE_T)</pre>
<pre class="lineno"> 36</pre><pre class="inputline">          fnDefList = parseWhere();</pre>
<pre class="lineno"> 37</pre><pre class="inputline">        consume(Token.TokenType.EOT_T);</pre>
<pre class="lineno"> 38</pre><pre class="inputline"> </pre>
<pre class="lineno"> 39</pre><pre class="inputline">        debug.show("Leaving parseProgram");</pre>
<pre class="lineno"> 40</pre><pre class="inputline">        return new ProgramST(expr, fnDefList);</pre>
<pre class="lineno"> 41</pre><pre class="inputline">    }</pre>
<pre class="lineno"> 42</pre><pre class="inputline"> </pre>
<pre class="lineno"> 43</pre><pre class="inputline">    private LinkedList parseFnDefList() throws ParseException {</pre>
<pre class="lineno"> 44</pre><pre class="inputline">    // Grammar Rule: FnDefList -- FnDef { scolonT FnDef }</pre>
<pre class="lineno"> 45</pre><pre class="inputline"> </pre>
<pre class="lineno"> 46</pre><pre class="inputline">      debug.show("Entering parseFnDefList");</pre>
<pre class="lineno"> 47</pre><pre class="inputline"> </pre>
<pre class="lineno"> 48</pre><pre class="inputline">      LinkedList fnDefList = new LinkedList();</pre>
<pre class="lineno"> 49</pre><pre class="inputline">      fnDefList.add(parseFnDef());</pre>
<pre class="lineno"> 50</pre><pre class="inputline"> </pre>
<pre class="lineno"> 51</pre><pre class="inputline">      while (currentToken.getType() == Token.TokenType.SCOLON_T) {</pre>
<pre class="lineno"> 52</pre><pre class="inputline">        consume(Token.TokenType.SCOLON_T);</pre>
<pre class="lineno"> 53</pre><pre class="inputline">        fnDefList.add(parseFnDef());</pre>
<pre class="lineno"> 54</pre><pre class="inputline">      }</pre>
<pre class="lineno"> 55</pre><pre class="inputline"> </pre>
<pre class="lineno"> 56</pre><pre class="inputline">      debug.show("Leaving parseFnDefList");</pre>
<pre class="lineno"> 57</pre><pre class="inputline">      return fnDefList;</pre>
<pre class="lineno"> 58</pre><pre class="inputline">    }</pre>
<pre class="lineno"> 59</pre><pre class="inputline"> </pre>
<pre class="lineno"> 60</pre><pre class="inputline">    private FnDefST parseFnDef() throws ParseException {</pre>
<pre class="lineno"> 61</pre><pre class="inputline">    // Grammar Rule: FnDef -- identT ParamList assignT Exp [ Where ]</pre>
<pre class="lineno"> 62</pre><pre class="inputline"> </pre>
<pre class="lineno"> 63</pre><pre class="inputline">      debug.show("Entering parseFnDef");</pre>
<pre class="lineno"> 64</pre><pre class="inputline"> </pre>
<pre class="lineno"> 65</pre><pre class="inputline">      Token name = currentToken;</pre>
<pre class="lineno"> 66</pre><pre class="inputline">      consume(Token.TokenType.IDENT_T);</pre>
<pre class="lineno"> 67</pre><pre class="inputline"> </pre>
<pre class="lineno"> 68</pre><pre class="inputline">      LinkedList paramList = parseParamList();</pre>
<pre class="lineno"> 69</pre><pre class="inputline">      consume(Token.TokenType.ASSIGN_T);</pre>
<pre class="lineno"> 70</pre><pre class="inputline">      ExpST expr = parseExp();</pre>
<pre class="lineno"> 71</pre><pre class="inputline">      LinkedList fnDefList = new LinkedList();</pre>
<pre class="lineno"> 72</pre><pre class="inputline">      if (currentToken.getType() == Token.TokenType.WHERE_T)</pre>
<pre class="lineno"> 73</pre><pre class="inputline">        fnDefList = parseWhere();</pre>
<pre class="lineno"> 74</pre><pre class="inputline"> </pre>
<pre class="lineno"> 75</pre><pre class="inputline">      debug.show("Leaving parseFnDef");</pre>
<pre class="lineno"> 76</pre><pre class="inputline">      return new FnDefST(name, paramList, expr, fnDefList);</pre>
<pre class="lineno"> 77</pre><pre class="inputline">    }</pre>
<pre class="lineno"> 78</pre><pre class="inputline"> </pre>
<pre class="lineno"> 79</pre><pre class="inputline">    private LinkedList parseWhere() throws ParseException {</pre>
<pre class="lineno"> 80</pre><pre class="inputline">    // Grammar Rule: Where -- whereT FnDefList endwT</pre>
<pre class="lineno"> 81</pre><pre class="inputline"> </pre>
<pre class="lineno"> 82</pre><pre class="inputline">      debug.show("Entering parseWhere");</pre>
<pre class="lineno"> 83</pre><pre class="inputline"> </pre>
<pre class="lineno"> 84</pre><pre class="inputline">      consume(Token.TokenType.WHERE_T);</pre>
<pre class="lineno"> 85</pre><pre class="inputline">      LinkedList fnDefList = parseFnDefList();</pre>
<pre class="lineno"> 86</pre><pre class="inputline">      consume(Token.TokenType.ENDW_T);</pre>
<pre class="lineno"> 87</pre><pre class="inputline"> </pre>
<pre class="lineno"> 88</pre><pre class="inputline">      debug.show("Leaving parseWhere");</pre>
<pre class="lineno"> 89</pre><pre class="inputline">      return fnDefList;</pre>
<pre class="lineno"> 90</pre><pre class="inputline">    }</pre>
<pre class="lineno"> 91</pre><pre class="inputline"> </pre>
<pre class="lineno"> 92</pre><pre class="inputline">    private LinkedList parseParamList() throws ParseException {</pre>
<pre class="lineno"> 93</pre><pre class="inputline">    // Grammar Rule: ParamList -- identT { identT }</pre>
<pre class="lineno"> 94</pre><pre class="inputline"> </pre>
<pre class="lineno"> 95</pre><pre class="inputline">      debug.show("Entering parseParamList");</pre>
<pre class="lineno"> 96</pre><pre class="inputline"> </pre>
<pre class="lineno"> 97</pre><pre class="inputline">      LinkedList paramList = new LinkedList();</pre>
<pre class="lineno"> 98</pre><pre class="inputline">      paramList.add(currentToken);</pre>
<pre class="lineno"> 99</pre><pre class="inputline">      consume(Token.TokenType.IDENT_T);</pre>
<pre class="lineno">100</pre><pre class="inputline"> </pre>
<pre class="lineno">101</pre><pre class="inputline">      while (currentToken.getType() == Token.TokenType.IDENT_T) {</pre>
<pre class="lineno">102</pre><pre class="inputline">        paramList.add(currentToken);</pre>
<pre class="lineno">103</pre><pre class="inputline">        consume(Token.TokenType.IDENT_T);</pre>
<pre class="lineno">104</pre><pre class="inputline">      }</pre>
<pre class="lineno">105</pre><pre class="inputline"> </pre>
<pre class="lineno">106</pre><pre class="inputline">      debug.show("Leaving parseParamList");</pre>
<pre class="lineno">107</pre><pre class="inputline">      return paramList;</pre>
<pre class="lineno">108</pre><pre class="inputline">    }</pre>
<pre class="lineno">109</pre><pre class="inputline"> </pre>
<pre class="lineno">110</pre><pre class="inputline">    private ExpST parseExp() throws ParseException {</pre>
<pre class="lineno">111</pre><pre class="inputline">    // Grammar Rule: Exp -- subtT Factor</pre>
<pre class="lineno">112</pre><pre class="inputline">    //                   -- FnApp</pre>
<pre class="lineno">113</pre><pre class="inputline">    //                   -- Selection</pre>
<pre class="lineno">114</pre><pre class="inputline">    //                   -- MExp</pre>
<pre class="lineno">115</pre><pre class="inputline"> </pre>
<pre class="lineno">116</pre><pre class="inputline">      debug.show("Entering parseExp");</pre>
<pre class="lineno">117</pre><pre class="inputline"> </pre>
<pre class="lineno">118</pre><pre class="inputline">      ExpST expr;</pre>
<pre class="lineno">119</pre><pre class="inputline">      switch (currentToken.getType()) {</pre>
<pre class="lineno">120</pre><pre class="inputline">        case SUB_T   : consume(Token.TokenType.SUB_T);</pre>
<pre class="lineno">121</pre><pre class="inputline">                       expr = new NegEXP(parseFactor());</pre>
<pre class="lineno">122</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">123</pre><pre class="inputline">        case IF_T    : expr = parseSelection();</pre>
<pre class="lineno">124</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">125</pre><pre class="inputline">        case INT_T   :</pre>
<pre class="lineno">126</pre><pre class="inputline">        case LP_T    : expr = parseMExp();</pre>
<pre class="lineno">127</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">128</pre><pre class="inputline">        case IDENT_T :</pre>
<pre class="lineno">129</pre><pre class="inputline">                    { // Must look at another token (peek)</pre>
<pre class="lineno">130</pre><pre class="inputline">                      Token next = tokenStream.getNextToken();</pre>
<pre class="lineno">131</pre><pre class="inputline">                      tokenStream.putBackToken();</pre>
<pre class="lineno">132</pre><pre class="inputline">                      switch (next.getType()) {</pre>
<pre class="lineno">133</pre><pre class="inputline">                        case INT_T   :</pre>
<pre class="lineno">134</pre><pre class="inputline">                        case IDENT_T :</pre>
<pre class="lineno">135</pre><pre class="inputline">                        case LP_T    : expr = parseFnApp(); break;</pre>
<pre class="lineno">136</pre><pre class="inputline">                        // let parseMExp() check for an error!</pre>
<pre class="lineno">137</pre><pre class="inputline">                        default: expr = parseMExp();</pre>
<pre class="lineno">138</pre><pre class="inputline">                      }</pre>
<pre class="lineno">139</pre><pre class="inputline">                    }</pre>
<pre class="lineno">140</pre><pre class="inputline">                    break;</pre>
<pre class="lineno">141</pre><pre class="inputline">        default: throw new ParseException("Expected SUB_T, IF_T, INT_T,"</pre>
<pre class="lineno">142</pre><pre class="inputline">                     + " LP_T, or IDENT_T", currentToken);</pre>
<pre class="lineno">143</pre><pre class="inputline"> </pre>
<pre class="lineno">144</pre><pre class="inputline">      }</pre>
<pre class="lineno">145</pre><pre class="inputline"> </pre>
<pre class="lineno">146</pre><pre class="inputline">      debug.show("Leaving parseExp");</pre>
<pre class="lineno">147</pre><pre class="inputline">      return expr;</pre>
<pre class="lineno">148</pre><pre class="inputline">    }</pre>
<pre class="lineno">149</pre><pre class="inputline"> </pre>
<pre class="lineno">150</pre><pre class="inputline">    private ExpST parseMExp() throws ParseException {</pre>
<pre class="lineno">151</pre><pre class="inputline">    // Grammar Rule: MExp -- Term RestOfMExp</pre>
<pre class="lineno">152</pre><pre class="inputline"> </pre>
<pre class="lineno">153</pre><pre class="inputline">      debug.show("Entering parseMExp");</pre>
<pre class="lineno">154</pre><pre class="inputline"> </pre>
<pre class="lineno">155</pre><pre class="inputline">      ExpST leftExpr = parseTerm();</pre>
<pre class="lineno">156</pre><pre class="inputline">      leftExpr = parseRestOfMExp(leftExpr);</pre>
<pre class="lineno">157</pre><pre class="inputline"> </pre>
<pre class="lineno">158</pre><pre class="inputline">      debug.show("Leaving parseMExp");</pre>
<pre class="lineno">159</pre><pre class="inputline">      return leftExpr;</pre>
<pre class="lineno">160</pre><pre class="inputline">    }</pre>
<pre class="lineno">161</pre><pre class="inputline"> </pre>
<pre class="lineno">162</pre><pre class="inputline">    private ExpST parseRestOfMExp(ExpST leftExpr) throws ParseException {</pre>
<pre class="lineno">163</pre><pre class="inputline">    // Grammar Rule: RestOfExp -- ( addT | subtT ) Term RestOfMExp | e</pre>
<pre class="lineno">164</pre><pre class="inputline"> </pre>
<pre class="lineno">165</pre><pre class="inputline">      debug.show("Entering parseRestOfMExp");</pre>
<pre class="lineno">166</pre><pre class="inputline"> </pre>
<pre class="lineno">167</pre><pre class="inputline">      ExpST expr = leftExpr;</pre>
<pre class="lineno">168</pre><pre class="inputline"> </pre>
<pre class="lineno">169</pre><pre class="inputline">      Token.TokenType type = currentToken.getType();</pre>
<pre class="lineno">170</pre><pre class="inputline">      if (type == Token.TokenType.ADD_T || type == Token.TokenType.SUB_T) {</pre>
<pre class="lineno">171</pre><pre class="inputline">        // Assert: type == ADD_T or SUB_T</pre>
<pre class="lineno">172</pre><pre class="inputline">        Token op = currentToken;</pre>
<pre class="lineno">173</pre><pre class="inputline">        consume(type);</pre>
<pre class="lineno">174</pre><pre class="inputline"> </pre>
<pre class="lineno">175</pre><pre class="inputline">        ExpST rightExpr = parseTerm();</pre>
<pre class="lineno">176</pre><pre class="inputline">        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);</pre>
<pre class="lineno">177</pre><pre class="inputline">        expr = parseRestOfMExp(combinedExpr);</pre>
<pre class="lineno">178</pre><pre class="inputline">      } // Else, do nothing!</pre>
<pre class="lineno">179</pre><pre class="inputline"> </pre>
<pre class="lineno">180</pre><pre class="inputline">      debug.show("Leaving parseRestOfMExp");</pre>
<pre class="lineno">181</pre><pre class="inputline">      return expr;</pre>
<pre class="lineno">182</pre><pre class="inputline">    }</pre>
<pre class="lineno">183</pre><pre class="inputline"> </pre>
<pre class="lineno">184</pre><pre class="inputline">    private ExpST parseTerm() throws ParseException {</pre>
<pre class="lineno">185</pre><pre class="inputline">    // Grammar Rule: Term -- Factor RestOfTerm</pre>
<pre class="lineno">186</pre><pre class="inputline"> </pre>
<pre class="lineno">187</pre><pre class="inputline">      debug.show("Entering parseTerm");</pre>
<pre class="lineno">188</pre><pre class="inputline"> </pre>
<pre class="lineno">189</pre><pre class="inputline">      ExpST expr;</pre>
<pre class="lineno">190</pre><pre class="inputline">      expr = parseFactor();</pre>
<pre class="lineno">191</pre><pre class="inputline">      expr = parseRestOfTerm(expr);</pre>
<pre class="lineno">192</pre><pre class="inputline"> </pre>
<pre class="lineno">193</pre><pre class="inputline">      debug.show("Leaving parseTerm");</pre>
<pre class="lineno">194</pre><pre class="inputline">      return expr;</pre>
<pre class="lineno">195</pre><pre class="inputline">    }</pre>
<pre class="lineno">196</pre><pre class="inputline"> </pre>
<pre class="lineno">197</pre><pre class="inputline">    private ExpST parseRestOfTerm(ExpST leftExpr) throws ParseException {</pre>
<pre class="lineno">198</pre><pre class="inputline">    // Grammar Rule: RestOfTerm -- ( mulT | divT | modT ) Factor RestOfTerm | e</pre>
<pre class="lineno">199</pre><pre class="inputline"> </pre>
<pre class="lineno">200</pre><pre class="inputline">      debug.show("Entering parseTerm");</pre>
<pre class="lineno">201</pre><pre class="inputline"> </pre>
<pre class="lineno">202</pre><pre class="inputline">      ExpST expr = leftExpr;</pre>
<pre class="lineno">203</pre><pre class="inputline"> </pre>
<pre class="lineno">204</pre><pre class="inputline">      Token.TokenType type = currentToken.getType();</pre>
<pre class="lineno">205</pre><pre class="inputline">      if (type == Token.TokenType.MUL_T ||</pre>
<pre class="lineno">206</pre><pre class="inputline">          type == Token.TokenType.DIV_T ||</pre>
<pre class="lineno">207</pre><pre class="inputline">          type == Token.TokenType.MOD_T) {</pre>
<pre class="lineno">208</pre><pre class="inputline">        // Assert: type == MUL_T or DIV_T or MOD_T</pre>
<pre class="lineno">209</pre><pre class="inputline">        Token op = currentToken;</pre>
<pre class="lineno">210</pre><pre class="inputline">        consume(type);</pre>
<pre class="lineno">211</pre><pre class="inputline"> </pre>
<pre class="lineno">212</pre><pre class="inputline">        ExpST rightExpr = parseFactor();</pre>
<pre class="lineno">213</pre><pre class="inputline">        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);</pre>
<pre class="lineno">214</pre><pre class="inputline">        expr = parseRestOfTerm(combinedExpr);</pre>
<pre class="lineno">215</pre><pre class="inputline">      } // Else, do nothing!</pre>
<pre class="lineno">216</pre><pre class="inputline"> </pre>
<pre class="lineno">217</pre><pre class="inputline">      debug.show("Leaving parseTerm");</pre>
<pre class="lineno">218</pre><pre class="inputline">      return expr;</pre>
<pre class="lineno">219</pre><pre class="inputline">    }</pre>
<pre class="lineno">220</pre><pre class="inputline"> </pre>
<pre class="lineno">221</pre><pre class="inputline"> </pre>
<pre class="lineno">222</pre><pre class="inputline">    private ExpST parseFactor() throws ParseException {</pre>
<pre class="lineno">223</pre><pre class="inputline">    // Grammar Rule: Factor -- intT</pre>
<pre class="lineno">224</pre><pre class="inputline">    //                      -- idenT</pre>
<pre class="lineno">225</pre><pre class="inputline">    //                      -- lpT Exp rpT</pre>
<pre class="lineno">226</pre><pre class="inputline"> </pre>
<pre class="lineno">227</pre><pre class="inputline">      debug.show("Entering parseFactor");</pre>
<pre class="lineno">228</pre><pre class="inputline"> </pre>
<pre class="lineno">229</pre><pre class="inputline">      ExpST expr;</pre>
<pre class="lineno">230</pre><pre class="inputline">      switch (currentToken.getType()) {</pre>
<pre class="lineno">231</pre><pre class="inputline">        case INT_T   : Token value = currentToken;</pre>
<pre class="lineno">232</pre><pre class="inputline">                       expr = new IntEXP(value);</pre>
<pre class="lineno">233</pre><pre class="inputline">                       consume(Token.TokenType.INT_T);</pre>
<pre class="lineno">234</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">235</pre><pre class="inputline">        case IDENT_T : Token name = currentToken;</pre>
<pre class="lineno">236</pre><pre class="inputline">                       consume(Token.TokenType.IDENT_T);</pre>
<pre class="lineno">237</pre><pre class="inputline">                       expr = new IdentEXP(name);</pre>
<pre class="lineno">238</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">239</pre><pre class="inputline">        case LP_T    : consume(Token.TokenType.LP_T);</pre>
<pre class="lineno">240</pre><pre class="inputline">                       expr = parseExp();</pre>
<pre class="lineno">241</pre><pre class="inputline">                       consume(Token.TokenType.RP_T);</pre>
<pre class="lineno">242</pre><pre class="inputline">                       break;</pre>
<pre class="lineno">243</pre><pre class="inputline">        default: throw new ParseException("Expected to see INT_T, IDENT_T, or LP_T",</pre>
<pre class="lineno">244</pre><pre class="inputline">                     currentToken);</pre>
<pre class="lineno">245</pre><pre class="inputline">      }</pre>
<pre class="lineno">246</pre><pre class="inputline"> </pre>
<pre class="lineno">247</pre><pre class="inputline">      debug.show("Leaving parseFactor");</pre>
<pre class="lineno">248</pre><pre class="inputline">      return expr;</pre>
<pre class="lineno">249</pre><pre class="inputline">    }</pre>
<pre class="lineno">250</pre><pre class="inputline">}</pre>
<?php require("footer-global.php"); ?>