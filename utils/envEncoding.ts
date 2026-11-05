import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function getEnvFileEncoding(): 'utf8' | 'utf16le' {
    const envPath = resolve(process.cwd(), '.env');

    if (!existsSync(envPath)) {
        return 'utf8';
    }

    const signature = readFileSync(envPath).subarray(0, 2);
    return signature[0] === 0xff && signature[1] === 0xfe ? 'utf16le' : 'utf8';
}
