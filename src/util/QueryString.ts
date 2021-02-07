export class QueryString {
    static parse(url: string): { [x: string]: string | number | boolean } {
        let queryParams: string[] = url.split("?");
        if (queryParams.length > 1) {
            queryParams = queryParams.slice(1).join("?").split("&");
            const out: { [x: string]: string | number | boolean } = {};

            queryParams.map((x) => {
                const c: string[] = x.split("=");
                const temp = decodeURI(c[1]);

                // If number
                if (temp.match(/^\d+$/g)) {
                    out[c[0]] = parseFloat(temp);
                }

                // True
                else if (temp === "true") {
                    out[c[0]] = true;
                }

                // False
                else if (temp === "false") {
                    out[c[0]] = false;
                } else {
                    out[c[0]] = temp;
                }

                return null;
            });
            return out;
        }

        return {};
    }
}
