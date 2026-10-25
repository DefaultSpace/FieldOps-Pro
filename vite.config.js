import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

function offlineBundle() {
    let base;
    return {name:'fieldops-offline',apply:'build',enforce:'post',configResolved(config){base=config.base;},generateBundle(_options,bundle){
        const publicFiles=['manifest.json','fieldops-icon.svg','fieldops-icon-192.png','fieldops-icon-512.png','fieldops-icon-180.png','fieldops-icon-32.png','logo.svg'];
        const assets=[...new Set(['index.html',...Object.keys(bundle),...publicFiles])];
        const template=readFileSync(new URL('./src/service-worker.js',import.meta.url),'utf8');
        const hash=createHash('sha256').update(Object.values(bundle).map(item=>item.code || item.source).join('')).update(template).update(readFileSync(new URL('./index.html',import.meta.url)));
        publicFiles.forEach(file=>hash.update(readFileSync(new URL(`./public/${file}`,import.meta.url))));
        const version=hash.digest('hex').slice(0,16);
        const source=template.replace('__CACHE_NAME__',JSON.stringify(`fieldops-${base}-${version}`)).replace('__PRECACHE__',JSON.stringify(assets.map(file=>base+file)));
        this.emitFile({type:'asset',fileName:'reminder-sw.js',source});
    }};
}

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.SITE_DEPLOY === '1' ? '/' : '/FieldOps-Pro/',
    plugins: [react(),offlineBundle()]
})
