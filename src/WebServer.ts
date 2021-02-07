import { serve } from "./../deps.ts";
import { QueryString } from "../src/util/QueryString.ts";
// deno-lint-ignore camelcase
import { WS_Error } from "../src/error/WS_Error.ts";
// deno-lint-ignore camelcase
import { WS_Context } from "./core/WS_Context.ts";
// deno-lint-ignore camelcase
import { WS_Router } from "./core/WS_Router.ts";
// deno-lint-ignore camelcase
import { Type_Args } from "./Types.ts";

export class WebServer {
    private _routerList: WS_Router[] = [];

    public registerRouter(wr: WS_Router): void {
        this._routerList.push(wr);
    }

    /**
     * Start web server
     * @param {number} port
     */
    async listen(port: number) {
        const s = serve({ port });

        for await (const req of s) {
            const ctx = new WS_Context(req);

            // Disable cors by default
            ctx.headers["Access-Control-Allow-Origin"] = "*";
            ctx.headers["Access-Control-Allow-Methods"] = "*";
            ctx.headers["Access-Control-Allow-Headers"] = "*";

            if (ctx.method === "OPTIONS") {
                req.respond({
                    status: ctx.status,
                    headers: ctx.buildHeaders(),
                    body: "",
                });
                return;
            }

            const handle = async (data: string) => {
                // Parse args
                let args = QueryString.parse(req.url) as Type_Args;

                // Add args from post
                if (ctx.contentType.match("application/json")) {
                    args = {
                        ...JSON.parse(data.toString()),
                        ...args,
                    };
                }

                try {
                    let isFound = false;

                    for (let i = 0; i < this._routerList.length; i++) {
                        const router = this._routerList[i];

                        // Check if router has matches
                        if (await router.match(req.url.split("?")[0])) {
                            const response = await router.resolve(
                                ctx,
                                req.url.split("?")[0],
                                args
                            );

                            if (response instanceof Uint8Array) {
                                req.respond({
                                    status: ctx.status,
                                    headers: ctx.buildHeaders(),
                                    body: response,
                                });
                            } else if (
                                typeof response === "string" ||
                                typeof response === "number"
                            ) {
                                req.respond({
                                    status: ctx.status,
                                    headers: ctx.buildHeaders(),
                                    body: response + "",
                                });
                            } else {
                                ctx.headers["content-type"] =
                                    "application/json";
                                req.respond({
                                    status: ctx.status,
                                    headers: ctx.buildHeaders(),
                                    body: JSON.stringify(response),
                                });
                            }

                            // Router has match, break search
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        req.respond({
                            status: ctx.status,
                            headers: ctx.buildHeaders(),
                            body: `Path not found`,
                        });
                    }
                } catch (e) {
                    if (e instanceof WS_Error) {
                        ctx.headers["content-type"] = "application/json";
                        ctx.status = e.code;
                        req.respond({
                            status: ctx.status,
                            headers: ctx.buildHeaders(),
                            body: JSON.stringify(e),
                        });
                    } else {
                        ctx.headers["content-type"] = "application/json";
                        ctx.status = 500;
                        req.respond({
                            status: ctx.status,
                            headers: ctx.buildHeaders(),
                            body: JSON.stringify({
                                description: e.message,
                                stack: e.stack,
                            }),
                        });
                        console.error(e);
                    }
                }
            };

            if (ctx.contentLength > 0) {
                if (ctx.contentType === "application/json") {
                    let b = new Uint8Array(16384);
                    const len = await req.body.read(b);
                    b = b.slice(0, len as number);
                    handle(new TextDecoder().decode(b) || "{}");
                } else {
                    req.respond({
                        status: 500,
                        headers: ctx.buildHeaders(),
                        body: "File not supported yet",
                    });
                }
            } else {
                handle("{}");
            }
        }
    }
}
