// Type definitions for previewerjs 1.0
// Project: previewerjs
// Definitions by: Felix Otoo <ofelix03@gmail.com>

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('[~THE MODULE~]');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from '[~THE MODULE~]';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
//  */
// export as namespace '@ofelix03/previewerjs';

// /*~ This declaration specifies that the class constructor function
//  *~ is the exported object from the file
//  */
// export = Previewer;

/*~ Write your module's methods and properties in this class */
declare module "@ofelix03/previewerjs" {
  export default class Previewer {
    constructor(selector: string, options: any);
  }
}
