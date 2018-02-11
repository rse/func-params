/*
**  func-params -- Run-Time Function Parameter Name Determination
**  Copyright (c) 2018 Ralf S. Engelschall <rse@engelschall.com>
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

var funcParams = require("../lib/func-params.node.js")

describe("func-params library", function () {
    it("should expose the official API", function () {
        expect(funcParams).to.be.a("function")
    })
    it("should correctly parse basic function declarations", function () {
        const B = () => class {}
        const tests = [
            { fn: function f () {}, params: [] },
            { fn: function f (a, b) {}, params: [ "a", "b" ] },
            { fn: function f (a, b = "foo", c = true, d = 42) {}, params: [ "a", "b", "c", "d" ] },
            { fn: function () {}, params: [] },
            { fn: function (a, b) {}, params: [ "a", "b" ] },
            { fn: function (a, b = "foo", c = true, d = 42) {}, params: [ "a", "b", "c", "d" ] },
            { fn: function * f () {}, params: [] },
            { fn: function * f (a, b) {}, params: [ "a", "b" ] },
            { fn: function * f (a, b = "foo", c = true, d = 42) {}, params: [ "a", "b", "c", "d" ] },
            { fn: function * () {}, params: [] },
            { fn: function * (a, b) {}, params: [ "a", "b" ] },
            { fn: function * (a, b = "foo", c = true, d = 42) {}, params: [ "a", "b", "c", "d" ] },
            { fn: () => {}, params: [] },
            { fn: (a) => {}, params: [ "a" ] },
            { fn: a => {}, params: [ "a" ] },
            { fn: (a, b) => {}, params: [ "a", "b" ] },
            { fn: (a, b = "foo", c = true, d = 42) => {}, params: [ "a", "b", "c", "d" ] },
            { fn: class A extends B(42) { a () {} constructor (a, b) { super() } }, params: [ "a", "b" ] },
            { fn: ({ a () {} }.a), params: [] },
            { fn: ({ * a () {} }.a), params: [] },
            { fn: ({ [0] () {} }[0]), params: [] },
            { fn: Object.getOwnPropertyDescriptor({ get a () {} }, "a").get, params: [] },
            { fn: Object.getOwnPropertyDescriptor({ set a (x) {} }, "a").set, params: [ "x" ] },
            { fn: Function.prototype.toString, params: [] },
            { fn: (function f () {}.bind(0)), params: [] },
            { fn: Function(), params: [] },
            { fn: Function("a", "b", "return"), params: [ "a", "b" ] },
            { fn: ({ a, b }, [ c, d ]) => {}, params: [ "", "" ] }
        ]
        Object.keys(tests).forEach((name) => {
            expect(funcParams(tests[name].fn)).to.be.deep.equal(tests[name].params)
        })
    })
    it("should correctly parse complex function declarations", function () {
        let bar = ""
        let x = () => ""
        expect(funcParams(
            function (
                a /* x,y */ = /* x,y */ `foo\`baz${bar + ",)" + (42 / 7)}bar`,
                b = x(42, 7),
                c = { foo: { bar: x(42, 7), baz: [ 2 / 3 ] } },
                d = 42
            ) {}
        )).to.be.deep.equal(
            [ "a", "b", "c", "d" ]
        )
    })
})

