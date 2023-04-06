// deno-lint-ignore-file no-explicit-any
import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { LaraDenoTemplate } from "https://deno.land/x/lara_template_deno@v1.0.0/mod.ts";

export interface ILaraServeContext {
    $template: LaraDenoTemplate;
}

export interface ILaraServeSettings {
    serve: Deno.ServeOptions | Deno.ServeTlsOptions;
    statics?: {
        disable?: boolean;
        folder?: string;
        watchIndexFile?: boolean;
        watchTemplateDeno?: boolean;
    }
}

export type TLaraServeCallback = (request: Request, connection: ConnInfo, context: any) => Promise<void> | void;

export type TLaraServeHandler = (request?: Request, connection?: ConnInfo) => Promise<Response> | Response;

export type TLaraBootCallback = (context: any) => Promise<void> | void;

export type TLaraServeError = (error: unknown) => Promise<Response> | Response;

export type TLaraServeListen = (params: { port: number, hostname: string } ) => Promise<void> | void;