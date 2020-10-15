import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  url,
  filter,
  applyTemplates,
  noop,
  move,
  chain,
  branchAndMerge,
  SchematicsException,
  mergeWith, Tree, Rule
} from '@angular-devkit/schematics';
import {applyLintFix} from '@schematics/angular/utility/lint-fix';
import {parseName} from '@schematics/angular/utility/parse-name';
import {getWorkspace} from '@schematics/angular/utility/config';
import {buildDefaultPath} from '@schematics/angular/utility/workspace';
import {addImportToModule} from '@schematics/angular/utility/ast-utils';
import {InsertChange} from '@schematics/angular/utility/change';
import {buildRelativePath, findModuleFromOptions} from '@schematics/angular/utility/find-module';
import {validateName, validateHtmlSelector} from '@schematics/angular/utility/validation';
import * as ts from 'typescript';
import {forEach} from '@angular-devkit/schematics';
import {Schema} from './schema';

export function readIntoSourceFile(host: Tree, modulePath: string) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
export function buildRelativeModulePath(options: Schema, modulePath: string) {
    const importModulePath = normalize(`/${options.path}/`
        + (options.flat ? '' : strings.dasherize(options.name) + '/')
        + 'landing-'
        + strings.dasherize(options.name)
        + '.module');
    return buildRelativePath(modulePath, importModulePath);
}
export function addDeclarationToNgModule(options: Schema): Rule {
    return (host: Tree) => {
        if (!options.module) {
            return host;
        }
        const modulePath = options.module;
        const text = host.read(modulePath);
        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString();
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        const relativePath = buildRelativeModulePath(options, modulePath);


        // @ts-ignore
        const changes = addImportToModule(source, modulePath, 'Landing'+strings.classify(options.name) + 'Module', relativePath);
        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(recorder);
        return host;
    };
}
export function buildSelector(options: Schema, projectPrefix: string) {
    let selector = strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
export default function (options: Schema) {
    return (host: Tree) => {
const workspace = getWorkspace(host);
        if (!options.project) {
            throw new SchematicsException('Option (project) is required.');
        }
        const project = workspace.projects[options.project];
        if (options.path === undefined) {
            // @ts-ignore
            options.path = buildDefaultPath(project);
        }
        options.module = findModuleFromOptions(host, options);
        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        validateName(options.name);
        validateHtmlSelector(options.selector);

      const templateSource = apply(url('./files'), [
            options.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
            options.inlineStyle ? filter(path => !path.endsWith('.__style__.template')) : noop(),
            options.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
            applyTemplates({
                ...strings,
                'if-flat': (s: any) => options.flat ? '' : s,
                ...options,
            }),
            // @ts-ignore
            !options.type ? forEach((file => {
                if (!!file.path.match(new RegExp('..'))) {
                    return {
                        content: file.content,
                        path: file.path.replace('..', '.'),
                    };
                }
                else {
                    return file;
                }
            })) : noop(),
            move(parsedPath.path),
        ]);
        return chain([
            branchAndMerge(chain([
                addDeclarationToNgModule(options),
                mergeWith(templateSource),
            ])),
            // @ts-ignore
            options.lintFix ? applyLintFix(options.path) : noop(),
        ]);
    };
}

