"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSelector = exports.addDeclarationToNgModule = exports.buildRelativeModulePath = exports.readIntoSourceFile = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const lint_fix_1 = require("@schematics/angular/utility/lint-fix");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const config_1 = require("@schematics/angular/utility/config");
const project_1 = require("@schematics/angular/utility/project");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular/utility/find-module");
const validation_1 = require("@schematics/angular/utility/validation");
const ts = require("typescript");
const schematics_2 = require("@angular-devkit/schematics");
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
exports.readIntoSourceFile = readIntoSourceFile;
function buildRelativeModulePath(options, modulePath) {
    const importModulePath = core_1.normalize(`/${options.path}/`
        + (options.flat ? '' : core_1.strings.dasherize(options.name) + '/')
        + 'landing-'
        + core_1.strings.dasherize(options.name)
        + '.module');
    return find_module_1.buildRelativePath(modulePath, importModulePath);
}
exports.buildRelativeModulePath = buildRelativeModulePath;
function addDeclarationToNgModule(options) {
    return (host) => {
        if (!options.module) {
            return host;
        }
        const modulePath = options.module;
        const text = host.read(modulePath);
        if (text === null) {
            throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString();
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        const relativePath = buildRelativeModulePath(options, modulePath);
        // @ts-ignore
        const changes = ast_utils_1.addImportToModule(source, modulePath, 'Landing' + core_1.strings.classify(options.name) + 'Module', relativePath);
        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof change_1.InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(recorder);
        return host;
    };
}
exports.addDeclarationToNgModule = addDeclarationToNgModule;
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
exports.buildSelector = buildSelector;
function default_1(options) {
    return (host) => {
        const workspace = config_1.getWorkspace(host);
        if (!options.project) {
            throw new schematics_1.SchematicsException('Option (project) is required.');
        }
        const project = workspace.projects[options.project];
        if (options.path === undefined) {
            options.path = project_1.buildDefaultPath(project);
        }
        options.module = find_module_1.findModuleFromOptions(host, options);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        validation_1.validateName(options.name);
        validation_1.validateHtmlSelector(options.selector);
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter(path => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__style__.template')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html.template')) : schematics_1.noop(),
            schematics_1.applyTemplates(Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => options.flat ? '' : s }), options)),
            // @ts-ignore
            !options.type ? schematics_2.forEach((file => {
                if (!!file.path.match(new RegExp('..'))) {
                    return {
                        content: file.content,
                        path: file.path.replace('..', '.'),
                    };
                }
                else {
                    return file;
                }
            })) : schematics_1.noop(),
            schematics_1.move(parsedPath.path),
        ]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addDeclarationToNgModule(options),
                schematics_1.mergeWith(templateSource),
            ])),
            // @ts-ignore
            options.lintFix ? lint_fix_1.applyLintFix(options.path) : schematics_1.noop(),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map