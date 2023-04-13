import { LaraServe } from "../mod.ts";
import { ILaraServeContext } from "../src/types.ts";
import { basePath } from "../src/utils.ts";

const server = new LaraServe({
    statics: {
        disable: true,
        folder: "public",
        watchIndexFile: true,
        watchTemplateDeno: true
    },
    serve: {
        port: 4000
    }
});

server.boot((context: ILaraServeContext) => {
    context.$template.setModifiers("include").base = basePath("resources");
    
    context.$template.setModifiers("include").processing = (path: string) => {
        path = path.startsWith("./") ? path.slice(1,) : path;
        path = path.replace(/\./g, "/");
        path = path + ".deno";
        return path;
    }
    
})

server.startRequest((request, connection, context: ILaraServeContext) => {
    if (context.$template.hasScoped("request")) {
        context.$template.setScope("request", request);
    } else {
        context.$template.registerScoped("request", request);
    }

    if (context.$template.hasScoped("ip")) {
        context.$template.setScope("ip", () => {
            const addr = connection.remoteAddr as Deno.NetAddr;
            const ip = addr.hostname;
    
            return ip;
        })
    } else {
        context.$template.registerScoped("ip", () => {
            const addr = connection.remoteAddr as Deno.NetAddr;
            const ip = addr.hostname;
    
            return ip;
        })
    }
})

await server.start();