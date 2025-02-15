"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var regexp_1 = require("./utils/regexp");
var paragraph_1 = require("./paragraph");
var target_1 = require("./target");
var rule_1 = require("./rule");
var changeset_1 = require("./changeset");
var Engine = /** @class */ (function () {
    function Engine(src) {
        if (!src) {
            throw new Error("src is requried");
        }
        this.version = +src.version || 1;
        this.targets = (src.targets || []).map(function (target) { return new target_1.Target(target); });
        this.rules = (src.rules || []).map(function (rule) { return new rule_1.Rule(rule); });
        this.sourcePaths = [];
    }
    Engine.prototype.merge = function (other) {
        var _this = this;
        if (!other) {
            throw new Error("other is required");
        }
        if (this.version !== other.version) {
            throw new Error("version mismatch!");
        }
        other.sourcePaths.forEach(function (sourcePath) {
            var exists = _this.sourcePaths.filter(function (otherSourcePath) { return otherSourcePath === sourcePath; }).length !== 0;
            if (!exists) {
                _this.sourcePaths.push(sourcePath);
            }
        });
        other.targets.forEach(function (otherTarget) {
            var exists = _this.targets.filter(function (target) { return regexp_1.equals(target.file, otherTarget.file); }).length !== 0;
            if (!exists) {
                _this.targets.push(otherTarget);
            }
        });
        // NOTE https://github.com/vvakame/prh/issues/18#issuecomment-222524140
        var reqRules = other.rules.filter(function (otherRule) {
            return _this.rules.filter(function (rule) { return rule.expected === otherRule.expected; }).length === 0;
        });
        this.rules = this.rules.concat(reqRules);
    };
    Engine.prototype.makeChangeSet = function (filePath, contentText) {
        var _this = this;
        if (contentText == null) {
            throw new Error("contentText is required");
        }
        var content = contentText;
        var re = /([^]*?)\n{2,}/g;
        var paragraphs = [];
        {
            var lastIndex = 0;
            while (true) {
                var matches = re.exec(content);
                if (!matches) {
                    paragraphs.push(new paragraph_1.Paragraph(lastIndex, content.substr(lastIndex)));
                    break;
                }
                paragraphs.push(new paragraph_1.Paragraph(matches.index, matches[1]));
                lastIndex = re.lastIndex;
            }
        }
        var diffs = paragraphs.map(function (p) { return p.makeDiffs(_this.rules); }).reduce(function (p, c) { return p.concat(c); }, []);
        var changeSet = new changeset_1.ChangeSet({ filePath: filePath, content: content, diffs: diffs });
        var includes = null;
        var excludes = null;
        this.targets.forEach(function (target) {
            target.reset();
            if (!target.file.test(filePath)) {
                return;
            }
            if (target.includes.length !== 0) {
                // .ts の // の後や /* */ の内部だけ対象にしたい場合のための機能
                target.includes.forEach(function (include) {
                    var intersect = changeset_1.makeChangeSet(filePath, content, include.pattern);
                    if (includes) {
                        includes = includes.concat(intersect);
                    }
                    else {
                        includes = intersect;
                    }
                });
            }
            if (target.excludes.length !== 0) {
                // .re の #@ の後を対象にしたくない場合のための機能
                target.excludes.forEach(function (exclude) {
                    var subsract = changeset_1.makeChangeSet(filePath, content, exclude.pattern);
                    if (excludes) {
                        excludes = excludes.concat(subsract);
                    }
                    else {
                        excludes = subsract;
                    }
                });
            }
        });
        if (includes) {
            changeSet = changeSet.intersect(includes);
        }
        if (excludes) {
            changeSet = changeSet.subtract(excludes);
        }
        return changeSet;
    };
    Engine.prototype.replaceByRule = function (filePath, content) {
        if (content == null) {
            throw new Error("content is required");
        }
        var changeSet = this.makeChangeSet(filePath, content);
        return changeSet.applyChangeSets(content);
    };
    return Engine;
}());
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map