import { Type } from "./type.interface";

export interface IModuleRef {
  get: (key: Type<any>) => any;
}
