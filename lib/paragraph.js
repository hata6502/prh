"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 設計思想
// 文章の1ブロック毎にデータを保持する
// ファイル全体→Paragraphに分割→Paragraph毎にChangeSetを作成→ChangeSetをmerge
// Paragraphでは特定の検出を無効化したい場合がある
//   例えばてくぶ標準だと 良い→よい と変換するが漢字をわざと使いたい場合がある
var Paragraph = /** @class */ (function () {
    function Paragraph(index, content) {
        this.index = index;
        this.content = content;
        this.ignoreAll = false;
        // prh:disable:良い|悪い みたいなパターンからチェックをパスさせる表現を作る
        // prh:disable だけの場合は全部パスさせる
        var re = /^(?:.*?)prh:disable(?::([^\n\s]*))?/gm;
        this._pragmaRanges = [];
        this.ignorePatterns = [];
        while (true) {
            var matches = re.exec(content);
            if (!matches) {
                break;
            }
            // : の後の有無
            if (!matches[1]) {
                this.ignoreAll = true;
                continue;
            }
            var pattern = matches[1];
            this._pragmaRanges.push({ index: matches.index, tailIndex: matches.index + matches[0].length });
            this.ignorePatterns.push(new RegExp("(" + pattern + ")", "g"));
        }
    }
    Paragraph.prototype.makeDiffs = function (rules) {
        var _this = this;
        var diffs = rules.map(function (rule) { return rule.applyRule(_this.content); }).reduce(function (p, c) { return p.concat(c); }, []);
        // pragmaに被る範囲の検出は無視する
        diffs = diffs.filter(function (diff) { return _this._pragmaRanges.every(function (range) { return !diff.isCollide(range); }); });
        diffs.forEach(function (diff) { return diff.index += _this.index; });
        if (this.ignoreAll) {
            return [];
        }
        return diffs.filter(function (diff) {
            return _this.ignorePatterns.filter(function (ignorePattern) {
                return diff.matches[0].match(ignorePattern);
            }).length === 0;
        });
    };
    return Paragraph;
}());
exports.Paragraph = Paragraph;
//# sourceMappingURL=paragraph.js.map