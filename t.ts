// deno-lint-ignore camelcase
import { WS_Router } from "./src/core/WS_Router.ts";
import { WebServer } from "./src/WebServer.ts";

class G {
    static path = "g";

    static post_s(a: string, b: string) {
        return a + b;
    }
}

const web = new WebServer();
const r = new WS_Router(`api`, [G]);
web.registerRouter(r);

web.listen(15500);
console.log("start web server");
