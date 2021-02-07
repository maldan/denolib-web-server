// deno-lint-ignore camelcase
import { WS_Context } from "../core/WS_Context.ts";
// deno-lint-ignore camelcase
import { Type_Args } from "../Types.ts";
import { IFileHandler } from "./IFileHandler.ts";
import { FS, Path, Mime } from "../../deps.ts";

export class FileHandler {
    private _handlers: IFileHandler[] = [];

    public async handle(
        ctx: WS_Context,
        path: string,
        args: Type_Args
    ): Promise<Uint8Array> {
        // Check handlers
        for (let i = 0; i < this._handlers.length; i++) {
            if (this._handlers[i].match(path)) {
                return await this._handlers[i].handle(ctx, path, args);
            }
        }

        // Default return
        const extension = Path.extname(path);
        ctx.headers["content-type"] = Mime.getType(extension);
        return await Deno.readFile(path);
    }
}
