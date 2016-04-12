// A very simple parser combinator library.
//
// The idea is to build complex parsers using very simple building blocks.
// Everything is done in code, which removes the need to learn a meta-parsing
// language.
//
// A parser is defined as a function which takes an input and either returns
// [false, input] or returns [token, remaining input].
//
// The simple building blocks take parsers and return a function
// (which is a parser).
//
// Another nice thing about parser combinators is that there is no need for a
// separate lexer. We do need to take whitespace into account explicitly.
//
// See parser_combinator_test.js for sample usage.
//
// Some useful reading
// * https://fsharpforfunandprofit.com/posts/understanding-parser-combinators/
// * https://wiki.haskell.org/Parsec
// * https://hackage.haskell.org/package/parsec-3.1.9/docs/src/Text-Parsec-Combinator.html

/**
 * Returns the result from the first parser which succeeds.
 */
var any = function(parsers) {
	return input => {
		for (var i=0; i<parsers.length; i++) {
			var t = parsers[i](input);
			if (t[0]) {
				return t;
			}
		}
    return [false, input];
	};
};
exports.any = any;

/**
 * Returns a success if all the parser succeed
 */
var seq = function(parsers) {
	return input => {
		var r = [];
    var input_ = input;
		for (var i=0; i<parsers.length; i++) {
			var t = parsers[i](input_);
			if (!t[0]) {
				return [false, input];
			}
      if (t[0] !== true) {
	      r.push(t[0]);
      }
      input_ = t[1];
		}
		return [r, input_];
	};
};
exports.seq = seq;

/**
 * Applies the parser as many times as possible. Useful for parsing
 * sequences. Always succeeds.
 */
var rep = function(parser) {
	return input => {
		var r = [];
    var input_ = input;
		while (1) {
			var t = parser(input_);
			if (!t[0]) {
				return [r, input_];
			}
      if (t[0] !== true) {
	      r.push(t[0]);
      }
      input_ = t[1];
		}
	};
};
exports.rep = rep;

/**
 * Tries to apply the parser. Always succeeds.
 */
var opt = function(parser) {
	return input => {
		var t = parser(input);
		if (t[0]) {
			return t;
		}
		return [true, input];
	};
};
exports.opt = opt;

/**
 * Useful for parsing comma delimited sequences.
 */
var repsep = function(parser, sep) {
  return input => {
    var t = seq([parser, rep(seq([sep, parser]))])(input);
    if (!t[0]) {
      return t;
    }
    // convert [1 [[, 2] [, 3] ...]] into [1 2 3 4]
    var u = t[0];
    var v = u[1].map(e => e[1]);
    v.unshift(u[0]);
    return [v, t[1]];
  };
};
exports.repsep = repsep;

/**
 * Parses using a regexp.
 */
var re = function(re) {
  return input => {
    var t = re.exec(input);
    if (!t) {
      return [false, input];
    }
    return [t[0], input.substr(t[0].length)];
  };
};
exports.re = re;
