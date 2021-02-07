// deno-lint-ignore camelcase
import { Type_ApiClass, Type_Args } from "../Types.ts";
// deno-lint-ignore camelcase
import { WS_Controller } from "./WS_Controller.ts";
// deno-lint-ignore camelcase
import { WS_Context } from "./WS_Context.ts";
import { EString } from "../../deps.ts";
import { FS } from "../../deps.ts";
import { FileHandler } from "../file/FileHandler.ts";

// deno-lint-ignore camelcase
export class WS_Router {
    readonly prefix: string = "";
    private _controllers: { [x: string]: WS_Controller } = {};
    private _folders: string[] = [];
    private _fileHandler: FileHandler = new FileHandler();

    constructor(
        prefix: string = "",
        // deno-lint-ignore no-explicit-any
        classes: any[] = [],
        folders: string[] = []
    ) {
        this.prefix = prefix;

        for (let i = 0; i < classes.length; i++) {
            this.registerClass(classes[i]);
        }
        for (let i = 0; i < folders.length; i++) {
            this.registerFolder(folders[i]);
        }
    }

    /**
     * Check if router can provide file by passed path.
     * @param {string} path - Url
     */
    async findInFolder(path: string): Promise<string> {
        if (path.slice(-1) === "/") {
            path += "index.html";
        }
        for (let i = 0; i < this._folders.length; i++) {
            if (await FS.exists(this._folders[i] + path)) {
                return this._folders[i] + path;
            }
        }

        return "";
    }

    /**
     * Return true if this path is valid for this router.
     * It doesn't matter if it controller method or file.
     * @param {string} path
     */
    async match(path: string): Promise<boolean> {
        if (path.slice(-1) === "/") {
            path += "index.html";
        }
        const t = path.split("/").filter(Boolean);

        if (this.prefix) {
            if (
                t[0] === this.prefix &&
                (await this.findInFolder("/" + t.slice(1).join("/")))
            ) {
                return true;
            }
            return !!(t[0] === this.prefix && this._controllers[t[1]]);
        } else {
            if (await this.findInFolder(path)) {
                return true;
            }
            return !!this._controllers[t[0]];
        }
    }

    /**
     * Call function of controller by path or else find a file
     * @param {WS_Context} ctx - Web Server Context
     * @param {string} path - Url path
     * @param {Type_Args} args - Args from url or body
     */
    async resolve(
        ctx: WS_Context,
        path: string,
        args: Type_Args
    ): Promise<unknown> {
        const t = path.split("/").filter(Boolean);
        const realPath = this.prefix ? "/" + t.slice(1).join("/") : path;
        const filePath = await this.findInFolder(realPath);

        if (filePath) {
            return await this._fileHandler.handle(ctx, filePath, args);
        }

        if (this.prefix) {
            if (!this._controllers[t[1]]) {
                throw new Error(`[405] Controller not found!`);
            }

            return await this._controllers[t[1]].execute(
                ctx,
                t[2] || "index",
                args
            );
        } else {
            if (!this._controllers[t[0]]) {
                throw new Error(`[405] Controller not found!`);
            }

            return await this._controllers[t[0]].execute(
                ctx,
                t[1] || "index",
                args
            );
        }
    }

    /**
     * Register class for api calls
     * @param {Type_ApiClass} - Class with api functions
     */
    registerClass(c: Type_ApiClass) {
        const controllerName = c.path ?? EString(c.name as string).camelToKebab;
        this._controllers[controllerName] = new WS_Controller(c);
    }

    /**
     * Register folder
     * @param {string} path
     */
    registerFolder(path: string) {
        this._folders.push(path);
    }
}
