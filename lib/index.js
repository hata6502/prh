"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var yaml = require("js-yaml");
var engine_1 = require("./engine");
exports.Engine = engine_1.Engine;
var changeset_1 = require("./changeset/");
exports.ChangeSet = changeset_1.ChangeSet;
exports.Diff = changeset_1.Diff;
function fromYAMLFilePaths() {
    var configPaths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        configPaths[_i] = arguments[_i];
    }
    var engine = fromYAMLFilePath(configPaths[0]);
    configPaths.splice(1).forEach(function (path) {
        engine.merge(fromYAMLFilePath(path));
    });
    return engine;
}
exports.fromYAMLFilePaths = fromYAMLFilePaths;
function fromYAMLFilePath(_configPath, _opts) {
    if (_opts === void 0) { _opts = {}; }
    throw new Error("Not implemented");
}
exports.fromYAMLFilePath = fromYAMLFilePath;
function fromYAML(configPath, yamlContent, opts) {
    if (opts === void 0) { opts = {}; }
    var rawConfig = yaml.load(yamlContent);
    return fromRowConfig(configPath, rawConfig, opts);
}
exports.fromYAML = fromYAML;
function fromRowConfig(configPath, rawConfig, opts) {
    if (opts === void 0) { opts = {}; }
    var engine = new engine_1.Engine(rawConfig);
    engine.sourcePaths.push(path.normalize(configPath));
    if (!opts.disableImports && rawConfig.imports) {
        // TODO この辺の処理をEngine側に移したい
        // なるべく破壊的変更を避ける
        // fsやyamlを使わずに同等のEngineを組み立てる余地を残す
        // async化したいけどprhの参照パッケージが壊れるのが辛い
        var importSpecs = void 0;
        if (typeof rawConfig.imports === "string") {
            importSpecs = [{
                    path: rawConfig.imports,
                }];
        }
        else {
            importSpecs = rawConfig.imports.map(function (imp) {
                if (typeof imp === "string") {
                    return {
                        path: imp,
                    };
                }
                return imp;
            });
        }
        importSpecs.forEach(function (importSpec) {
            var importedConfigPath = path.join(path.dirname(configPath), importSpec.path);
            var newEngine = fromYAMLFilePath(importedConfigPath, {
                disableImports: !!importSpec.disableImports,
            });
            var ignoreRules = (importSpec.ignoreRules || []).map(function (ignoreRule) {
                return typeof ignoreRule === "string" ? { pattern: ignoreRule } : ignoreRule;
            });
            newEngine.rules = newEngine.rules.filter(function (rule) {
                return ignoreRules.every(function (ignoreRule) {
                    return !rule._shouldIgnore(ignoreRule);
                });
            });
            engine.merge(newEngine);
        });
    }
    return engine;
}
exports.fromRowConfig = fromRowConfig;
function fromYAMLFilePathsAsync() {
    var configPaths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        configPaths[_i] = arguments[_i];
    }
    try {
        return Promise.resolve(fromYAMLFilePaths.apply(void 0, configPaths));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.fromYAMLFilePathsAsync = fromYAMLFilePathsAsync;
function fromYAMLFilePathAsync(configPath, opts) {
    if (opts === void 0) { opts = {}; }
    try {
        return Promise.resolve(fromYAMLFilePath(configPath, opts));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.fromYAMLFilePathAsync = fromYAMLFilePathAsync;
function fromYAMLAsync(configPath, yamlContent, opts) {
    if (opts === void 0) { opts = {}; }
    try {
        return Promise.resolve(fromYAML(configPath, yamlContent, opts));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.fromYAMLAsync = fromYAMLAsync;
function fromRowConfigAsync(configPath, rawConfig, opts) {
    if (opts === void 0) { opts = {}; }
    try {
        return Promise.resolve(fromRowConfig(configPath, rawConfig, opts));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.fromRowConfigAsync = fromRowConfigAsync;
function getRuleFilePath(_baseDir, _configFileName) {
    if (_configFileName === void 0) { _configFileName = "prh.yml"; }
    throw new Error("Not implemented");
}
exports.getRuleFilePath = getRuleFilePath;
//# sourceMappingURL=index.js.map