/*
**  func-params -- Run-Time Function Parameter Name Determination
**  Copyright (c) 2018-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external dependency  */
const Tokenizr = require("tokenizr")
const CacheLRU = require("cache-lru")

/*  create global cache  */
const cache = new CacheLRU()

/*  the API function  */
function funcParams (fn, caching = true) {
    /*  determine function source code  */
    let src
    try { src = fn.toString() }
    catch (ex) { src = "function () {}" }

    /*  optionally fetch from cache  */
    const key = src
    if (caching) {
        const args = cache.get(key)
        if (typeof args === "object" && args instanceof Array)
            return args
    }

    /*  PASS 1: PREPROCESSING
        - replace special case of "class ..." functions
        - replace special case of "a => ..." fat arrow functions
        - replace newlines with single spaces  */
    src = src
        .replace(/^\s*class\s.*?constructor/, "")
        .replace(/^\s*class\s.*/, "function () {}")
        .replace(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*=>)/, "($1)$2")
        .replace(/\r?\n/g, " ")
        .replace(/ {2,}/g, " ")

    /*  PASS 2: STRING STRIPPING
        - strip double-quoted strings
        - strip single-quoted strings
        - strip multiline strings  */
    src = src
        .replace(/`(?:\\`|[^\r\n])*?`/g,    "")
        .replace(/'(?:\\'|[^\r\n])*?'/g,    "")
        .replace(/"(?:\\"|[^\r\n])*?"/g,    "")
        .replace(/\/\*(?:.|[\r\n])*?\*\//g, "")
        .replace(/\/\/[^\r\n]*\r?\n/g,      "")

    /*  PASS 3: INNER STRIPPING
        - cut at end of argument list (to not parse more than necessary)  */
    src = src.replace(/^.*?\(/, "(")
    let lexer = new Tokenizr()
    let level = 0
    lexer.rule(/\(/, (ctx, match) => {
        if (level === 0)
            ctx.ignore()
        else
            ctx.accept()
        level++
    })
    lexer.rule(/\)/, (ctx, match) => {
        level--
        if (level === 0) {
            ctx.ignore()
            ctx.stop()
        }
        else
            ctx.accept()
    })
    lexer.rule(/(?:.|[ \t\r\n]+)/, (ctx, match) => {
        ctx.accept()
    })
    lexer.input(src)
    src = ""
    lexer.tokens().forEach((token) => {
        src += token.value
    })

    /*  PASS 4: OUTER STRIPPING
        - strip parenthesis groups (as they can contain commas)
        - strip braces groups      (as they can contain commas)
        - strop bracket groups     (as they can contain commas)  */
    lexer = new Tokenizr()
    lexer.rule(/\(/,                    (ctx, match) => { ctx.ignore(); ctx.push("parenthesis") })
    lexer.rule("parenthesis", /\)/,     (ctx, match) => { ctx.ignore(); ctx.pop() })
    lexer.rule("parenthesis", /[^)]+?/, (ctx, match) => { ctx.ignore() })
    lexer.rule(/\{/,                    (ctx, match) => { ctx.ignore(); ctx.push("braces") })
    lexer.rule("braces", /\}/,          (ctx, match) => { ctx.ignore(); ctx.pop() })
    lexer.rule("braces", /[^}]+?/,      (ctx, match) => { ctx.ignore() })
    lexer.rule(/\[/,                    (ctx, match) => { ctx.ignore(); ctx.push("brackets") })
    lexer.rule("brackets", /\]/,        (ctx, match) => { ctx.ignore(); ctx.pop() })
    lexer.rule("brackets", /[^\]]+?/,   (ctx, match) => { ctx.ignore() })
    lexer.rule(/(?:.|[ \t\r\n]+)/,      (ctx, match) => { ctx.accept() })
    lexer.input(src)
    src = ""
    lexer.tokens().forEach((token) => {
        src += token.value
    })

    /*  PASS 5: SPLITTING
        - split at commas
        - finally remove default assignments  */
    const args = []
    src = src.replace(/^\s+$/, "")
    if (src !== "") {
        src.split(/\s*,\s*/).forEach((token) => {
            token = token
                .replace(/=.*$/, "")
                .replace(/^\s+/, "")
                .replace(/\s+$/, "")
            args.push(token)
        })
    }

    /*  optionally store to cache  */
    if (caching)
        cache.set(key, args)

    return args
}

/*  export the API function  */
module.exports = funcParams

