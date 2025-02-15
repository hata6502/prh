"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var regexpRegexp = /^\/(.*)\/([gimy]*)$/;
var hankakuAlphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var zenkakuAlphaNum = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９";
exports.supportRegExpUnicodeFlag = (function () {
    try {
        new RegExp("", "u");
        return true;
    }
    catch (e) {
        return false;
    }
})();
// http://www.tamasoft.co.jp/ja/general-info/unicode.html
exports.jpHira = /[ぁ-ゖ]/;
exports.jpKana = /[ァ-ヺ]/;
// http://tama-san.com/?p=196
exports.jpKanji = /(?:[々〇〻\u3400-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF])/;
exports.jpChar = combine([exports.jpHira, exports.jpKana, exports.jpKanji]);
var regexpSpecialChars = "¥*+.?{}()[]^$-|/".split("");
function concat(args, flags) {
    var prevFlags = flags || "";
    var foundRegExp = false;
    var result = args.reduce(function (p, c) {
        if (typeof c === "string") {
            return p + c;
        }
        else if (c instanceof RegExp) {
            c.flags.split("").sort();
            var currentFlags = c.flags.split("").sort().join("");
            if (foundRegExp) {
                if (prevFlags !== currentFlags) {
                    throw new Error("combining different flags " + prevFlags + " and " + currentFlags + ".\nThe pattern " + c + " has different flag with other patterns.");
                }
            }
            prevFlags = currentFlags;
            foundRegExp = true;
            return p + c.source;
        }
        else {
            throw new Error("unknown type: " + c);
        }
    }, "");
    return new RegExp(result, prevFlags);
}
exports.concat = concat;
function combine(args, flags) {
    var prevFlags = flags || "";
    var foundRegExp = false;
    var result = args.map(function (arg) {
        if (typeof arg === "string") {
            return arg;
        }
        else if (arg instanceof RegExp) {
            arg.flags.split("").sort();
            var currentFlags = arg.flags.split("").sort().join("");
            if (foundRegExp) {
                if (prevFlags !== currentFlags) {
                    throw new Error("combining different flags " + prevFlags + " and " + currentFlags + ".\nThe pattern " + arg + " has different flag with other patterns.");
                }
            }
            prevFlags = currentFlags;
            foundRegExp = true;
            return arg.source;
        }
        else {
            throw new Error("unknown type: " + arg);
        }
    }).join("|");
    return concat(["(?:", result, ")"], foundRegExp ? prevFlags : void 0);
}
exports.combine = combine;
function addBoundary(arg) {
    var result;
    var flags = "";
    if (typeof arg === "string") {
        result = arg;
    }
    else if (arg instanceof RegExp) {
        result = arg.source;
        flags = arg.flags;
    }
    else {
        throw new Error("unknown type: " + arg);
    }
    return concat(["\\b", result, "\\b"], flags);
}
exports.addBoundary = addBoundary;
function parseRegExpString(str) {
    var result = str.match(regexpRegexp);
    if (!result) {
        return null;
    }
    return new RegExp(result[1], result[2]);
}
exports.parseRegExpString = parseRegExpString;
function spreadAlphaNum(str) {
    var result = str.split("").map(function (v) {
        var tmpIdx1 = hankakuAlphaNum.indexOf(v.toUpperCase());
        var tmpIdx2 = hankakuAlphaNum.indexOf(v.toLowerCase());
        if (tmpIdx1 === -1 && tmpIdx2 === -1) {
            // not alpha num
            return v;
        }
        else if (tmpIdx1 === tmpIdx2) {
            // num
            return "[" + v + zenkakuAlphaNum.charAt(tmpIdx1) + "]";
        }
        else {
            return "[" + v.toUpperCase() + v.toLowerCase() + zenkakuAlphaNum.charAt(tmpIdx1) + zenkakuAlphaNum.charAt(tmpIdx2) + "]";
        }
    }).join("");
    return new RegExp(result);
}
exports.spreadAlphaNum = spreadAlphaNum;
function addDefaultFlags(regexp) {
    var flags = "gm";
    if (exports.supportRegExpUnicodeFlag) {
        flags += "u";
    }
    if (regexp.ignoreCase) {
        flags += "i";
    }
    return new RegExp(regexp.source, flags);
}
exports.addDefaultFlags = addDefaultFlags;
function escapeSpecialChars(str) {
    regexpSpecialChars.forEach(function (char) {
        str = str.replace(new RegExp("\\" + char, "g"), "\\" + char);
    });
    return str;
}
exports.escapeSpecialChars = escapeSpecialChars;
function collectAll(regexp, src) {
    if (!regexp.global) {
        throw new Error("g flag is required");
    }
    if (!regexp.source) {
        throw new Error("source is required");
    }
    var resultList = [];
    var result;
    do {
        result = regexp.exec(src);
        if (result) {
            resultList.push(result);
        }
    } while (result);
    return resultList;
}
exports.collectAll = collectAll;
function equals(a, b) {
    if (a.source !== b.source) {
        return false;
    }
    if (a.global !== b.global) {
        return false;
    }
    if (a.ignoreCase !== b.ignoreCase) {
        return false;
    }
    if (a.multiline !== b.multiline) {
        return false;
    }
    return true;
}
exports.equals = equals;
//# sourceMappingURL=regexp.js.map