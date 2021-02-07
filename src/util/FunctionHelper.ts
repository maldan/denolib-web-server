export default class FunctionHelper {
    static getFunctionParameterNames(fn: () => void): RegExpMatchArray {
        const fnStr = fn
            .toString()
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, "");
        const result = fnStr
            .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
            .match(/([^\s,]+)/g);
        if (result === null) {
            return [];
        }
        return result;
    }

    static async callFunctionWithArgumentNames(
        fn: () => void,
        args: { [x: string]: unknown } = {},
        context: unknown = null
    ): Promise<unknown> {
        const argNames = FunctionHelper.getFunctionParameterNames(fn);
        const finalArray = [];

        for (const name in args) {
            // deno-lint-ignore no-prototype-builtins
            if (!args.hasOwnProperty(name)) {
                continue;
            }
            const index = argNames.indexOf(name);
            if (index === -1) {
                continue;
            }

            finalArray[index] = args[name];
        }

        return await fn.apply(context, finalArray as []);
    }
}
