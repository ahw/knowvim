<?php require("header.php"); ?>
<pre class="num">  1</pre><pre class="line">/*</pre>
<pre class="num">  2</pre><pre class="line"> *</pre>
<pre class="num">  3</pre><pre class="line"> *       A shout out to Jerud J. Mead.</pre>
<pre class="num">  4</pre><pre class="line"> *</pre>
<pre class="num">  5</pre><pre class="line"> */</pre>
<pre class="num">  6</pre><pre class="line">package parser;</pre>
<pre class="num">  7</pre><pre class="line"> </pre>
<pre class="num">  8</pre><pre class="line">import java.util.*;</pre>
<pre class="num">  9</pre><pre class="line">import tokenizer.*;</pre>
<pre class="num"> 10</pre><pre class="line">import syntaxTree.*;</pre>
<pre class="num"> 11</pre><pre class="line">import exceptions.*;</pre>
<pre class="num"> 12</pre><pre class="line">import debug.*;</pre>
<pre class="num"> 13</pre><pre class="line"> </pre>
<pre class="num"> 14</pre><pre class="line">public class Parser {</pre>
<pre class="num"> 15</pre><pre class="line"> </pre>
<pre class="num"> 16</pre><pre class="line">    public Parser(Tokenizer tokenStream) {</pre>
<pre class="num"> 17</pre><pre class="line">    // Pre:  tokenStream has a value</pre>
<pre class="num"> 18</pre><pre class="line">    // Post: debug == new ParserDebug() AND</pre>
<pre class="num"> 19</pre><pre class="line">    //       this.tokenStream == tokenStream AND</pre>
<pre class="num"> 20</pre><pre class="line">    //       class invariant is true</pre>
<pre class="num"> 21</pre><pre class="line">        this.debug = new ParserDebug();</pre>
<pre class="num"> 22</pre><pre class="line">        this.tokenStream = tokenStream;</pre>
<pre class="num"> 23</pre><pre class="line"> </pre>
<pre class="num"> 24</pre><pre class="line">        currentToken = tokenStream.getNextToken();</pre>
<pre class="num"> 25</pre><pre class="line">        // This makes the class invariant true</pre>
<pre class="num"> 26</pre><pre class="line">        // for the call to parseProgram</pre>
<pre class="num"> 27</pre><pre class="line">    }</pre>
<pre class="num"> 28</pre><pre class="line"> </pre>
<pre class="num"> 29</pre><pre class="line">    public ProgramST parseProgram() throws ParseException {</pre>
<pre class="num"> 30</pre><pre class="line">    // Grammar Rule:  Program -- Exp [ Where ] eotT</pre>
<pre class="num"> 31</pre><pre class="line"> </pre>
<pre class="num"> 32</pre><pre class="line">        debug.show("Entering parseProgram");</pre>
<pre class="num"> 33</pre><pre class="line"> </pre>
<pre class="num"> 34</pre><pre class="line">        ExpST expr = parseExp();</pre>
<pre class="num"> 35</pre><pre class="line">        if (currentToken.getType() == Token.TokenType.WHERE_T)</pre>
<pre class="num"> 36</pre><pre class="line">          fnDefList = parseWhere();</pre>
<pre class="num"> 37</pre><pre class="line">        consume(Token.TokenType.EOT_T);</pre>
<pre class="num"> 38</pre><pre class="line"> </pre>
<pre class="num"> 39</pre><pre class="line">        debug.show("Leaving parseProgram");</pre>
<pre class="num"> 40</pre><pre class="line">        return new ProgramST(expr, fnDefList);</pre>
<pre class="num"> 41</pre><pre class="line">    }</pre>
<pre class="num"> 42</pre><pre class="line"> </pre>
<pre class="num"> 43</pre><pre class="line">    private LinkedList parseFnDefList() throws ParseException {</pre>
<pre class="num"> 44</pre><pre class="line">    // Grammar Rule: FnDefList -- FnDef { scolonT FnDef }</pre>
<pre class="num"> 45</pre><pre class="line"> </pre>
<pre class="num"> 46</pre><pre class="line">      debug.show("Entering parseFnDefList");</pre>
<pre class="num"> 47</pre><pre class="line"> </pre>
<pre class="num"> 48</pre><pre class="line">      LinkedList fnDefList = new LinkedList();</pre>
<pre class="num"> 49</pre><pre class="line">      fnDefList.add(parseFnDef());</pre>
<pre class="num"> 50</pre><pre class="line"> </pre>
<pre class="num"> 51</pre><pre class="line">      while (currentToken.getType() == Token.TokenType.SCOLON_T) {</pre>
<pre class="num"> 52</pre><pre class="line">        consume(Token.TokenType.SCOLON_T);</pre>
<pre class="num"> 53</pre><pre class="line">        fnDefList.add(parseFnDef());</pre>
<pre class="num"> 54</pre><pre class="line">      }</pre>
<pre class="num"> 55</pre><pre class="line"> </pre>
<pre class="num"> 56</pre><pre class="line">      debug.show("Leaving parseFnDefList");</pre>
<pre class="num"> 57</pre><pre class="line">      return fnDefList;</pre>
<pre class="num"> 58</pre><pre class="line">    }</pre>
<pre class="num"> 59</pre><pre class="line"> </pre>
<pre class="num"> 60</pre><pre class="line">    private FnDefST parseFnDef() throws ParseException {</pre>
<pre class="num"> 61</pre><pre class="line">    // Grammar Rule: FnDef -- identT ParamList assignT Exp [ Where ]</pre>
<pre class="num"> 62</pre><pre class="line"> </pre>
<pre class="num"> 63</pre><pre class="line">      debug.show("Entering parseFnDef");</pre>
<pre class="num"> 64</pre><pre class="line"> </pre>
<pre class="num"> 65</pre><pre class="line">      Token name = currentToken;</pre>
<pre class="num"> 66</pre><pre class="line">      consume(Token.TokenType.IDENT_T);</pre>
<pre class="num"> 67</pre><pre class="line"> </pre>
<pre class="num"> 68</pre><pre class="line">      LinkedList paramList = parseParamList();</pre>
<pre class="num"> 69</pre><pre class="line">      consume(Token.TokenType.ASSIGN_T);</pre>
<pre class="num"> 70</pre><pre class="line">      ExpST expr = parseExp();</pre>
<pre class="num"> 71</pre><pre class="line">      LinkedList fnDefList = new LinkedList();</pre>
<pre class="num"> 72</pre><pre class="line">      if (currentToken.getType() == Token.TokenType.WHERE_T)</pre>
<pre class="num"> 73</pre><pre class="line">        fnDefList = parseWhere();</pre>
<pre class="num"> 74</pre><pre class="line"> </pre>
<pre class="num"> 75</pre><pre class="line">      debug.show("Leaving parseFnDef");</pre>
<pre class="num"> 76</pre><pre class="line">      return new FnDefST(name, paramList, expr, fnDefList);</pre>
<pre class="num"> 77</pre><pre class="line">    }</pre>
<pre class="num"> 78</pre><pre class="line"> </pre>
<pre class="num"> 79</pre><pre class="line">    private LinkedList parseWhere() throws ParseException {</pre>
<pre class="num"> 80</pre><pre class="line">    // Grammar Rule: Where -- whereT FnDefList endwT</pre>
<pre class="num"> 81</pre><pre class="line"> </pre>
<pre class="num"> 82</pre><pre class="line">      debug.show("Entering parseWhere");</pre>
<pre class="num"> 83</pre><pre class="line"> </pre>
<pre class="num"> 84</pre><pre class="line">      consume(Token.TokenType.WHERE_T);</pre>
<pre class="num"> 85</pre><pre class="line">      LinkedList fnDefList = parseFnDefList();</pre>
<pre class="num"> 86</pre><pre class="line">      consume(Token.TokenType.ENDW_T);</pre>
<pre class="num"> 87</pre><pre class="line"> </pre>
<pre class="num"> 88</pre><pre class="line">      debug.show("Leaving parseWhere");</pre>
<pre class="num"> 89</pre><pre class="line">      return fnDefList;</pre>
<pre class="num"> 90</pre><pre class="line">    }</pre>
<pre class="num"> 91</pre><pre class="line"> </pre>
<pre class="num"> 92</pre><pre class="line">    private LinkedList parseParamList() throws ParseException {</pre>
<pre class="num"> 93</pre><pre class="line">    // Grammar Rule: ParamList -- identT { identT }</pre>
<pre class="num"> 94</pre><pre class="line"> </pre>
<pre class="num"> 95</pre><pre class="line">      debug.show("Entering parseParamList");</pre>
<pre class="num"> 96</pre><pre class="line"> </pre>
<pre class="num"> 97</pre><pre class="line">      LinkedList paramList = new LinkedList();</pre>
<pre class="num"> 98</pre><pre class="line">      paramList.add(currentToken);</pre>
<pre class="num"> 99</pre><pre class="line">      consume(Token.TokenType.IDENT_T);</pre>
<pre class="num">100</pre><pre class="line"> </pre>
<pre class="num">101</pre><pre class="line">      while (currentToken.getType() == Token.TokenType.IDENT_T) {</pre>
<pre class="num">102</pre><pre class="line">        paramList.add(currentToken);</pre>
<pre class="num">103</pre><pre class="line">        consume(Token.TokenType.IDENT_T);</pre>
<pre class="num">104</pre><pre class="line">      }</pre>
<pre class="num">105</pre><pre class="line"> </pre>
<pre class="num">106</pre><pre class="line">      debug.show("Leaving parseParamList");</pre>
<pre class="num">107</pre><pre class="line">      return paramList;</pre>
<pre class="num">108</pre><pre class="line">    }</pre>
<pre class="num">109</pre><pre class="line"> </pre>
<pre class="num">110</pre><pre class="line">    private ExpST parseExp() throws ParseException {</pre>
<pre class="num">111</pre><pre class="line">    // Grammar Rule: Exp -- subtT Factor</pre>
<pre class="num">112</pre><pre class="line">    //                   -- FnApp</pre>
<pre class="num">113</pre><pre class="line">    //                   -- Selection</pre>
<pre class="num">114</pre><pre class="line">    //                   -- MExp</pre>
<pre class="num">115</pre><pre class="line"> </pre>
<pre class="num">116</pre><pre class="line">      debug.show("Entering parseExp");</pre>
<pre class="num">117</pre><pre class="line"> </pre>
<pre class="num">118</pre><pre class="line">      ExpST expr;</pre>
<pre class="num">119</pre><pre class="line">      switch (currentToken.getType()) {</pre>
<pre class="num">120</pre><pre class="line">        case SUB_T   : consume(Token.TokenType.SUB_T);</pre>
<pre class="num">121</pre><pre class="line">                       expr = new NegEXP(parseFactor());</pre>
<pre class="num">122</pre><pre class="line">                       break;</pre>
<pre class="num">123</pre><pre class="line">        case IF_T    : expr = parseSelection();</pre>
<pre class="num">124</pre><pre class="line">                       break;</pre>
<pre class="num">125</pre><pre class="line">        case INT_T   :</pre>
<pre class="num">126</pre><pre class="line">        case LP_T    : expr = parseMExp();</pre>
<pre class="num">127</pre><pre class="line">                       break;</pre>
<pre class="num">128</pre><pre class="line">        case IDENT_T :</pre>
<pre class="num">129</pre><pre class="line">                    { // Must look at another token (peek)</pre>
<pre class="num">130</pre><pre class="line">                      Token next = tokenStream.getNextToken();</pre>
<pre class="num">131</pre><pre class="line">                      tokenStream.putBackToken();</pre>
<pre class="num">132</pre><pre class="line">                      switch (next.getType()) {</pre>
<pre class="num">133</pre><pre class="line">                        case INT_T   :</pre>
<pre class="num">134</pre><pre class="line">                        case IDENT_T :</pre>
<pre class="num">135</pre><pre class="line">                        case LP_T    : expr = parseFnApp(); break;</pre>
<pre class="num">136</pre><pre class="line">                        // let parseMExp() check for an error!</pre>
<pre class="num">137</pre><pre class="line">                        default: expr = parseMExp();</pre>
<pre class="num">138</pre><pre class="line">                      }</pre>
<pre class="num">139</pre><pre class="line">                    }</pre>
<pre class="num">140</pre><pre class="line">                    break;</pre>
<pre class="num">141</pre><pre class="line">        default: throw new ParseException("Expected SUB_T, IF_T, INT_T,"</pre>
<pre class="num">142</pre><pre class="line">                     + " LP_T, or IDENT_T", currentToken);</pre>
<pre class="num">143</pre><pre class="line"> </pre>
<pre class="num">144</pre><pre class="line">      }</pre>
<pre class="num">145</pre><pre class="line"> </pre>
<pre class="num">146</pre><pre class="line">      debug.show("Leaving parseExp");</pre>
<pre class="num">147</pre><pre class="line">      return expr;</pre>
<pre class="num">148</pre><pre class="line">    }</pre>
<pre class="num">149</pre><pre class="line"> </pre>
<pre class="num">150</pre><pre class="line">    private ExpST parseMExp() throws ParseException {</pre>
<pre class="num">151</pre><pre class="line">    // Grammar Rule: MExp -- Term RestOfMExp</pre>
<pre class="num">152</pre><pre class="line"> </pre>
<pre class="num">153</pre><pre class="line">      debug.show("Entering parseMExp");</pre>
<pre class="num">154</pre><pre class="line"> </pre>
<pre class="num">155</pre><pre class="line">      ExpST leftExpr = parseTerm();</pre>
<pre class="num">156</pre><pre class="line">      leftExpr = parseRestOfMExp(leftExpr);</pre>
<pre class="num">157</pre><pre class="line"> </pre>
<pre class="num">158</pre><pre class="line">      debug.show("Leaving parseMExp");</pre>
<pre class="num">159</pre><pre class="line">      return leftExpr;</pre>
<pre class="num">160</pre><pre class="line">    }</pre>
<pre class="num">161</pre><pre class="line"> </pre>
<pre class="num">162</pre><pre class="line">    private ExpST parseRestOfMExp(ExpST leftExpr) throws ParseException {</pre>
<pre class="num">163</pre><pre class="line">    // Grammar Rule: RestOfExp -- ( addT | subtT ) Term RestOfMExp | e</pre>
<pre class="num">164</pre><pre class="line"> </pre>
<pre class="num">165</pre><pre class="line">      debug.show("Entering parseRestOfMExp");</pre>
<pre class="num">166</pre><pre class="line"> </pre>
<pre class="num">167</pre><pre class="line">      ExpST expr = leftExpr;</pre>
<pre class="num">168</pre><pre class="line"> </pre>
<pre class="num">169</pre><pre class="line">      Token.TokenType type = currentToken.getType();</pre>
<pre class="num">170</pre><pre class="line">      if (type == Token.TokenType.ADD_T || type == Token.TokenType.SUB_T) {</pre>
<pre class="num">171</pre><pre class="line">        // Assert: type == ADD_T or SUB_T</pre>
<pre class="num">172</pre><pre class="line">        Token op = currentToken;</pre>
<pre class="num">173</pre><pre class="line">        consume(type);</pre>
<pre class="num">174</pre><pre class="line"> </pre>
<pre class="num">175</pre><pre class="line">        ExpST rightExpr = parseTerm();</pre>
<pre class="num">176</pre><pre class="line">        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);</pre>
<pre class="num">177</pre><pre class="line">        expr = parseRestOfMExp(combinedExpr);</pre>
<pre class="num">178</pre><pre class="line">      } // Else, do nothing!</pre>
<pre class="num">179</pre><pre class="line"> </pre>
<pre class="num">180</pre><pre class="line">      debug.show("Leaving parseRestOfMExp");</pre>
<pre class="num">181</pre><pre class="line">      return expr;</pre>
<pre class="num">182</pre><pre class="line">    }</pre>
<pre class="num">183</pre><pre class="line"> </pre>
<pre class="num">184</pre><pre class="line">    private ExpST parseTerm() throws ParseException {</pre>
<pre class="num">185</pre><pre class="line">    // Grammar Rule: Term -- Factor RestOfTerm</pre>
<pre class="num">186</pre><pre class="line"> </pre>
<pre class="num">187</pre><pre class="line">      debug.show("Entering parseTerm");</pre>
<pre class="num">188</pre><pre class="line"> </pre>
<pre class="num">189</pre><pre class="line">      ExpST expr;</pre>
<pre class="num">190</pre><pre class="line">      expr = parseFactor();</pre>
<pre class="num">191</pre><pre class="line">      expr = parseRestOfTerm(expr);</pre>
<pre class="num">192</pre><pre class="line"> </pre>
<pre class="num">193</pre><pre class="line">      debug.show("Leaving parseTerm");</pre>
<pre class="num">194</pre><pre class="line">      return expr;</pre>
<pre class="num">195</pre><pre class="line">    }</pre>
<pre class="num">196</pre><pre class="line"> </pre>
<pre class="num">197</pre><pre class="line">    private ExpST parseRestOfTerm(ExpST leftExpr) throws ParseException {</pre>
<pre class="num">198</pre><pre class="line">    // Grammar Rule: RestOfTerm -- ( mulT | divT | modT ) Factor RestOfTerm | e</pre>
<pre class="num">199</pre><pre class="line"> </pre>
<pre class="num">200</pre><pre class="line">      debug.show("Entering parseTerm");</pre>
<pre class="num">201</pre><pre class="line"> </pre>
<pre class="num">202</pre><pre class="line">      ExpST expr = leftExpr;</pre>
<pre class="num">203</pre><pre class="line"> </pre>
<pre class="num">204</pre><pre class="line">      Token.TokenType type = currentToken.getType();</pre>
<pre class="num">205</pre><pre class="line">      if (type == Token.TokenType.MUL_T ||</pre>
<pre class="num">206</pre><pre class="line">          type == Token.TokenType.DIV_T ||</pre>
<pre class="num">207</pre><pre class="line">          type == Token.TokenType.MOD_T) {</pre>
<pre class="num">208</pre><pre class="line">        // Assert: type == MUL_T or DIV_T or MOD_T</pre>
<pre class="num">209</pre><pre class="line">        Token op = currentToken;</pre>
<pre class="num">210</pre><pre class="line">        consume(type);</pre>
<pre class="num">211</pre><pre class="line"> </pre>
<pre class="num">212</pre><pre class="line">        ExpST rightExpr = parseFactor();</pre>
<pre class="num">213</pre><pre class="line">        ExpEXP combinedExpr = new ExpEXP(leftExpr, rightExpr, op);</pre>
<pre class="num">214</pre><pre class="line">        expr = parseRestOfTerm(combinedExpr);</pre>
<pre class="num">215</pre><pre class="line">      } // Else, do nothing!</pre>
<pre class="num">216</pre><pre class="line"> </pre>
<pre class="num">217</pre><pre class="line">      debug.show("Leaving parseTerm");</pre>
<pre class="num">218</pre><pre class="line">      return expr;</pre>
<pre class="num">219</pre><pre class="line">    }</pre>
<pre class="num">220</pre><pre class="line"> </pre>
<pre class="num">221</pre><pre class="line"> </pre>
<pre class="num">222</pre><pre class="line">    private ExpST parseFactor() throws ParseException {</pre>
<pre class="num">223</pre><pre class="line">    // Grammar Rule: Factor -- intT</pre>
<pre class="num">224</pre><pre class="line">    //                      -- idenT</pre>
<pre class="num">225</pre><pre class="line">    //                      -- lpT Exp rpT</pre>
<pre class="num">226</pre><pre class="line"> </pre>
<pre class="num">227</pre><pre class="line">      debug.show("Entering parseFactor");</pre>
<pre class="num">228</pre><pre class="line"> </pre>
<pre class="num">229</pre><pre class="line">      ExpST expr;</pre>
<pre class="num">230</pre><pre class="line">      switch (currentToken.getType()) {</pre>
<pre class="num">231</pre><pre class="line">        case INT_T   : Token value = currentToken;</pre>
<pre class="num">232</pre><pre class="line">                       expr = new IntEXP(value);</pre>
<pre class="num">233</pre><pre class="line">                       consume(Token.TokenType.INT_T);</pre>
<pre class="num">234</pre><pre class="line">                       break;</pre>
<pre class="num">235</pre><pre class="line">        case IDENT_T : Token name = currentToken;</pre>
<pre class="num">236</pre><pre class="line">                       consume(Token.TokenType.IDENT_T);</pre>
<pre class="num">237</pre><pre class="line">                       expr = new IdentEXP(name);</pre>
<pre class="num">238</pre><pre class="line">                       break;</pre>
<pre class="num">239</pre><pre class="line">        case LP_T    : consume(Token.TokenType.LP_T);</pre>
<pre class="num">240</pre><pre class="line">                       expr = parseExp();</pre>
<pre class="num">241</pre><pre class="line">                       consume(Token.TokenType.RP_T);</pre>
<pre class="num">242</pre><pre class="line">                       break;</pre>
<pre class="num">243</pre><pre class="line">        default: throw new ParseException("Expected to see INT_T, IDENT_T, or LP_T",</pre>
<pre class="num">244</pre><pre class="line">                     currentToken);</pre>
<pre class="num">245</pre><pre class="line">      }</pre>
<pre class="num">246</pre><pre class="line"> </pre>
<pre class="num">247</pre><pre class="line">      debug.show("Leaving parseFactor");</pre>
<pre class="num">248</pre><pre class="line">      return expr;</pre>
<pre class="num">249</pre><pre class="line">    }</pre>
<pre class="num">250</pre><pre class="line">}</pre>
<?php require("footer.php"); ?>
