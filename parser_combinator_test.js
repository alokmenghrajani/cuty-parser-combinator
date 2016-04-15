var Combinator = require('./parser_combinator.js');

// Parses any one a-z character.
var char = input => {
  var t = Combinator.re(/[a-z]/)(input);
  if (!t[0]) {
    return t;
  }
  return [{char: t[0]}, t[1]];
};

// Always fails
var fail = function(input) {
  return [false, input];
};

// Parses comma.
var comma = Combinator.re(/,/);

exports.testAny = function(test) {
  var p = Combinator.any([fail, char]);
  test.deepEqual(p("foobar"), [{char: "f"}, "oobar"]);

  p = Combinator.any([char, fail]);
  test.deepEqual(p("foobar"), [{char: "f"}, "oobar"]);

  p = Combinator.any([fail]);
  test.deepEqual(p("foobar"), [false, "foobar"]);

  p = Combinator.any([char]);
  test.deepEqual(p(",foobar"), [false, ",foobar"]);

  test.done();
};

exports.testSeq = function(test) {
  var p = Combinator.seq([char, char]);
  test.deepEqual(p("foobar"), [[{char: "f"}, {char: "o"}], "obar"]);

  test.done();
};

exports.testRep = function(test) {
  var p = Combinator.rep(comma);
  test.deepEqual(p(",,,bar"), [[",", ",", ","], "bar"]);

  test.done();
};

exports.testOpt = function(test) {
  var p = Combinator.opt(comma);
  test.deepEqual(p(",bar"), [",", "bar"]);
  test.deepEqual(p("bar"), [true, "bar"]);

  test.done();
};

exports.testRepSep = function(test) {
  var p = Combinator.repsep(char, comma);
  test.deepEqual(p("a,b,cdef"), [[{char: "a"}, {char: "b"}, {char: "c"}], "def"]);
  test.deepEqual(p("a"), [[{char: "a"}], ""]);
  test.deepEqual(p(""), [false, ""]);

  test.done();
};
