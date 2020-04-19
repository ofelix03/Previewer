declare module "previewer" {
  export class Previewer {
    constructor(selector: string | HTMLElement, options: any): Previewer;

    init(): void;
  }
}
