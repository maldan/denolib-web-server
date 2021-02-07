// deno-lint-ignore camelcase
export type Type_HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS";

// deno-lint-ignore camelcase
export type Type_MethodInfo = {
    httpMethod: Type_HttpMethod;
    function: () => unknown;
};

// deno-lint-ignore camelcase
export type Type_HttpHeaders = {
    [x: string]: unknown;
    "content-length"?: string;
    "content-type"?: string;
    location?: string;
};

// deno-lint-ignore camelcase
export type Type_ApiClass = {
    [x: string]: unknown;
    name?: string;
    path: string;
};

// deno-lint-ignore camelcase
export type Type_Args = { [x: string]: string | number };
