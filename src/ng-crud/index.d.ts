import { Tree, Rule } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { Schema } from './schema';
export declare function readIntoSourceFile(host: Tree, modulePath: string): ts.SourceFile;
export declare function buildRelativeModulePath(options: Schema, modulePath: string): string;
export declare function addDeclarationToNgModule(options: Schema): Rule;
export declare function buildSelector(options: Schema, projectPrefix: string): string;
export default function (options: Schema): (host: Tree) => Rule;
