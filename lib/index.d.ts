import * as raw from "./raw";
import { Engine } from "./engine";
import { ChangeSet, Diff } from "./changeset/";
export { Engine, ChangeSet, Diff };
export declare function fromYAMLFilePaths(...configPaths: string[]): Engine;
export interface Options {
    disableImports?: boolean;
}
export declare function fromYAMLFilePath(_configPath: string, _opts?: Options): Engine;
export declare function fromYAML(configPath: string, yamlContent: string, opts?: Options): Engine;
export declare function fromRowConfig(configPath: string, rawConfig: raw.Config, opts?: Options): Engine;
export declare function fromYAMLFilePathsAsync(...configPaths: string[]): Promise<Engine>;
export declare function fromYAMLFilePathAsync(configPath: string, opts?: Options): Promise<Engine>;
export declare function fromYAMLAsync(configPath: string, yamlContent: string, opts?: Options): Promise<Engine>;
export declare function fromRowConfigAsync(configPath: string, rawConfig: raw.Config, opts?: Options): Promise<Engine>;
export declare function getRuleFilePath(_baseDir: string, _configFileName?: string): string | null;
