export async function existFile(path: string) {
    try {
        await Deno.stat(path);

        return true;
    } catch (error) {
        error;
        
        return false
    }
}

export function getBasePath(path: string, isImport = true): string {
    if (isImport) return `file:///${Deno.cwd()}${path.startsWith("/") ? path : "/"+path}`.replace(/\\/g, "/");
    return `${Deno.cwd()}${path.startsWith("/") ? path : "/"+path}`.replace(/\\/g, "/");
}

export function basePath(path: string, relative = false): string {
    if (relative) return `${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${path.startsWith("/") ? path : "/"+path}`, false);
}