/* Build replaces these placeholders with the exact assets for this release. */
const CACHE=__CACHE_NAME__;
const FILES=__PRECACHE__;
const base=new URL('./',self.location.href);
const index=new URL('index.html',base).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
    const prefix=`fieldops-${base.pathname}-`;
    for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==CACHE)await caches.delete(name);
    await self.clients.claim();
})()));
self.addEventListener('message',event=>{
    if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
    if(event.data?.type==='OFFLINE_READY')event.waitUntil(caches.open(CACHE).then(async cache=>event.ports[0]?.postMessage({ready:!!(await cache.match(index))})));
});
self.addEventListener('fetch',event=>{
    const url=new URL(event.request.url);
    if(event.request.method!=='GET' || url.origin!==base.origin || !url.pathname.startsWith(base.pathname))return;
    if(event.request.mode==='navigate'){
        event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(index)) || fetch(event.request)));
    }else if(FILES.some(file=>new URL(file,base).href===url.href)){
        // These are fixed, same-origin release assets; module requests can carry
        // an Origin header that differs from the precache request (Vary: Origin).
        event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request,{ignoreVary:true})) || fetch(event.request)));
    }
});
self.addEventListener('notificationclick',event=>{
    event.notification.close();
    event.waitUntil((async()=>{
        const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
        const current=windows.find(client=>client.url.startsWith(base.href));
        if(current){await current.focus();return current.navigate(new URL('./#/',base).href);}
        return self.clients.openWindow(new URL('./#/',base).href);
    })());
});
