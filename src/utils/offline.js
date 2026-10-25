let state={ready:false,waiting:null,error:false};
const publish=updates=>{state={...state,...updates};window.dispatchEvent(new Event('fieldops-offline'));};
export const offlineState=()=>state;
export async function registerOffline() {
    if(!import.meta.env.PROD || !('serviceWorker' in navigator))return;
    try{
        // Reuse the installed worker while offline; registration may require network.
        const existing=await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
        const registration=existing || await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}reminder-sw.js`,{updateViaCache:'none'});
        const ready=async()=>{
            const controller=navigator.serviceWorker.controller;
            if(!controller){publish({ready:false});return;}
            // Ask the worker controlling this page, not a newer waiting worker.
            const cached=await new Promise(resolve=>{
                const channel=new MessageChannel();
                const timer=setTimeout(()=>{channel.port1.close();resolve(false);},1500);
                channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data?.ready===true);};
                controller.postMessage({type:'OFFLINE_READY'},[channel.port2]);
            });
            if(controller===navigator.serviceWorker.controller)publish({ready:cached,waiting:registration.waiting || null});
        };
        await ready();
        navigator.serviceWorker.addEventListener('controllerchange',ready);
        if(registration.waiting)publish({waiting:registration.waiting});
        registration.addEventListener('updatefound',()=>{
            const worker=registration.installing;
            worker?.addEventListener('statechange',()=>{
                if(worker.state==='installed' && registration.waiting)publish({waiting:registration.waiting});
                if(worker.state==='activated')void ready();
            });
        });
        void navigator.serviceWorker.ready.then(ready);
        if(existing && navigator.onLine)void registration.update().catch(()=>{});
    }catch{publish({error:true});}
}
export function applyOfflineUpdate(){
    if(!state.waiting)return;
    navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});
    state.waiting.postMessage({type:'SKIP_WAITING'});
}
