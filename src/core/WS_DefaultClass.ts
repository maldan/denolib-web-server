// deno-lint-ignore camelcase
import { WS_Error } from "../error/WS_Error.ts";

// deno-lint-ignore camelcase
export class WS_DefaultClass {
    static isNotEmpty(args: { [x: string]: unknown }): void {
        for (const key in args) {
            const arg = args[key];

            if (arg === undefined || arg === null || arg === "") {
                throw new WS_Error(
                    "emptyField",
                    key,
                    `Field "${key}" is required!`
                );
            }
        }
    }

    static isValid(kv: { [x: string]: unknown }, type: string): void {
        if (type === "email") {
            for (const key in kv) {
                const arg = kv[key];

                if (typeof arg !== "string") {
                    throw new WS_Error(
                        "validation",
                        key,
                        `Field "${key}" must contain a valid email!`
                    );
                }

                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(arg.toLowerCase())) {
                    throw new WS_Error(
                        "validation",
                        key,
                        `Field "${key}" must contain a valid email!`
                    );
                }
            }
        }
    }

    static isMatch(
        kv: { [x: string]: unknown },
        values: (string | number)[]
    ): void {
        for (const key in kv) {
            const arg = kv[key];

            if (typeof arg !== "string" && typeof arg !== "number") {
                throw new WS_Error(
                    "match",
                    key,
                    `Field "${key}" must be equal one of this values ${values}!`
                );
            }

            if (!values.includes(arg)) {
                throw new WS_Error(
                    "match",
                    key,
                    `Field "${key}" must be equal one of this values ${values}!`
                );
            }
        }
    }
}
