import { LaraDenoTemplate } from "https://deno.land/x/lara_template_deno@v1.0.0/mod.ts";
import { extname } from "https://deno.land/std@0.182.0/path/mod.ts";
import { serveFile } from "https://deno.land/std@0.182.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.182.0/http/mod.ts";

export const depPath = {
    extname
}

export const depHttp = {
    serve,
    serveFile
}

export const depTemplate = {
    LaraDenoTemplate
}

Deno.version