
func-params
===========

Run-Time Function Parameter Name Determination

<p/>
<img src="https://nodei.co/npm/func-params.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/func-params.png" alt=""/>

About
-----

This is a tiny JavaScript function for determining the names of the
parameters of a function under run-time. It can be used as the building
block for Dependency Injection or Named-Parameter implementations.
The underlying problem is that there is no official JavaScript API
to determine the names of the parameters of a function under run-time,
except the ECMAScript 2015 `Function.prototype.toString()`. This
library determines the names of the function parameters by parsing
the source code of `Function.prototype.toString()`. Its parsing is not
100%, but is able to handle even complex syntax scenarios.

Installation
------------

```shell
$ npm install func-params
```

Usage
-----

```js
const funcParams = require("func-params")

/*  simple example  */
funcParams(function (a, b, c, d) {})
// --> [ "a", "b", "c", "d" ]

/*  complex example  */
funcParams(function (
    a /* x,y */ = /* x,y */ `foo\`baz${bar + ",)" + (42 / 7)}bar`,
    b = x(42, 7),
    c = { foo: { bar: x(42, 7), baz: [ 2 / 3 ] } },
    d = 42
) {})
// --> [ "a", "b", "c", "d" ]
```

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

