import { ServerRequest } from "../../deps.ts";
// deno-lint-ignore camelcase
import { Type_HttpHeaders, Type_HttpMethod } from "../Types.ts";

// deno-lint-ignore camelcase
export class WS_Context {
    private _req: ServerRequest;

    // deno-lint-ignore no-inferrable-types
    status: number = 200;
    headers: Type_HttpHeaders = {
        "content-type": "text/plain",
    };

    constructor(req: ServerRequest) {
        this._req = req;
    }

    get method(): Type_HttpMethod {
        return (this._req.method as unknown) as Type_HttpMethod;
    }

    get authorization(): string {
        return this._req.headers.get("authorization") || "";
    }

    get contentLength(): number {
        return Number(this._req.headers.get("content-length")) || 0;
    }

    get contentType(): string {
        return this._req.headers.get("content-type") || "";
    }

    buildHeaders(): Headers {
        const h = new Headers();
        for (const s in this.headers) {
            h.set(s, this.headers[s] as string);
        }
        return h;
    }
}
