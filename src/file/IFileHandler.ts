// deno-lint-ignore camelcase
import { WS_Context } from "../core/WS_Context.ts";
// deno-lint-ignore camelcase
import { Type_Args } from "../Types.ts";

export interface IFileHandler {
    match(path: string): boolean;
    handle(ctx: WS_Context, path: string, args: Type_Args): Promise<Uint8Array>;
}
