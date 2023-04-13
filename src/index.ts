// deno-lint-ignore-file no-explicit-any
import { basePath, existFile } from "./utils.ts";
import { depHttp, depPath, depTemplate } from "../dependencies.ts";
import { LaraDenoTemplate } from "https://deno.land/x/lara_template_deno@v1.0.0/mod.ts";
import { ILaraServeSettings, TLaraBootCallback, TLaraServeCallback, TLaraServeError, TLaraServeHandler, TLaraServeListen } from "./types.ts";

export class LaraServe {
    private DEFAULT_SETTINGS = {
        serve: {
            hostname: "0.0.0.0",
            port: 8080
        }
    }
    private SETTINGS: ILaraServeSettings;

    private $template: LaraDenoTemplate;

    private $boot: TLaraBootCallback;
    private $startRequest: TLaraServeCallback;
    private $handler: TLaraServeHandler;
    private $finishRequest: TLaraServeCallback;
    
    constructor(settings?: ILaraServeSettings) {
        this.SETTINGS = {
            ...this.DEFAULT_SETTINGS,
            ...settings
        };
        
        this.$boot = () => {};
        this.$startRequest = () => {};
        this.$finishRequest = () => {};
        this.$handler = () => new Response("Default Response Serve");

        this.$template = new depTemplate.LaraDenoTemplate();
    }

    public setSettings(settings: ILaraServeSettings) {
        this.SETTINGS = settings;
    }

    public boot(callback: TLaraBootCallback) {
        this.$boot = callback;
    }

    public startRequest(callback: TLaraServeCallback) {
        this.$startRequest = callback;
    }

    public finishRequest(callback: TLaraServeCallback) {
        this.$finishRequest = callback;
    }

    public handler(callback: TLaraServeHandler) {
        this.$handler = callback;
    }

    public onError(callback: TLaraServeError) {
        this.SETTINGS.serve.onError = callback;
    }

    public onListen(callback: TLaraServeListen) {
        this.SETTINGS.serve.onListen = callback;
    }

    public async start() {
        await this.$boot(this);

        await depHttp.serve(async (request, connection) => {
            let serveResponse;

            this.$startRequest(request, connection, this);

            serveResponse = await this.processFile(request);

            if (serveResponse) return serveResponse;

            serveResponse = await this.$handler(request, connection);

            this.$finishRequest(request, connection, this);

            return serveResponse;
        }, this.SETTINGS.serve);
    }

    protected async processFile(req: Request) {
        if (!this.SETTINGS.statics?.disable) return false;

        const { pathname } = new URLPattern(req.url);
        
        let fileName = basePath(`${this.SETTINGS.statics?.folder}${pathname}`);

        const extensionIndexFile = this.SETTINGS.statics?.watchTemplateDeno ? ".deno" : ".html";

        const fileIndex = await this.detectIndexFile(pathname, extensionIndexFile);

        if (fileIndex) fileName = fileIndex;

        if (!existFile(fileName)) return false;

        let fileResponse: any = await depHttp.serveFile(req, fileName);

        if (fileResponse.status === 404) return false;

        if (this.SETTINGS.statics?.watchTemplateDeno && depPath.extname(fileName) === ".deno")
            fileResponse = this.processTemplate((await fileResponse.text()), fileResponse.headers);

        return fileResponse;
    }

    protected async processTemplate(text: string, headers: any) {
        const result = await this.$template.render(text);

        if (!result) return false;

        return new Response(result, {
            headers: {
                ...headers,
                "Content-Type": "text/html"
            }
        })
    }

    protected async detectIndexFile(pathname: string, extension = ".html") {
        if (!this.SETTINGS.statics?.watchIndexFile) return false;

        if (!pathname.endsWith("/")) return false;

        const fileIndex = basePath(`${this.SETTINGS.statics?.folder}${pathname}index${extension}`);

        if (!(await existFile(fileIndex))) return false;        

        return fileIndex;
    }
}
