import {
    // deno-lint-ignore camelcase
    Type_ApiClass,
    // deno-lint-ignore camelcase
    Type_MethodInfo,
    // deno-lint-ignore camelcase
    Type_Args,
    // deno-lint-ignore camelcase
    Type_HttpMethod,
} from "../Types.ts";
import { EString } from "../../deps.ts";
// deno-lint-ignore camelcase
import { WS_Context } from "./WS_Context.ts";
import FunctionHelper from "./../util/FunctionHelper.ts";

// deno-lint-ignore camelcase
export class WS_Controller {
    private readonly _sc: Type_ApiClass;
    private readonly _methodList: { [x: string]: Type_MethodInfo } = {};

    constructor(staticClass: Type_ApiClass) {
        this._sc = staticClass;

        // Get funstion list
        const methodList = Object.getOwnPropertyNames(this._sc);

        for (let i = 0; i < methodList.length; i++) {
            // Map functions to method list by get only prefixed functions
            const x = methodList[i].match(/^(get|post|delete|put|patch)_/);
            if (x) {
                this._methodList[EString(methodList[i]).camelToKebab] = {
                    httpMethod: x[1].toUpperCase() as Type_HttpMethod,
                    function: this._sc[methodList[i]] as () => void,
                };
            }
        }
    }

    /**
     * Call this controller function by name with argument
     * @param {WS_Context} ctx - Web server context
     * @param {string} fnName - function name
     * @param {Type_Args} args - function arguments
     */
    async execute(ctx: WS_Context, fnName: string, args: Type_Args) {
        fnName = EString(ctx.method.toLowerCase() + "_" + fnName).camelToKebab;

        const fn = this._methodList[fnName];
        if (!fn) {
            throw new Error(`[405] Method not found!`);
        }

        if (fn.httpMethod !== ctx.method) {
            throw new Error(`[405] Method not allowed!`);
        }

        return await FunctionHelper.callFunctionWithArgumentNames(
            this._methodList[fnName].function,
            {
                ...args,
                ctx,
            },
            this._sc
        );
    }
}
