const CACHE='chine-2026-v12';
const CORE=['./styles.css','./app.js','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
      return response;
    }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response && response.status===200 && response.type==='basic'){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
    }
    return response;
  })));
});
