import { useServiceStore as store } from '../store/useServiceStore.js';
import { acceptOperation, snapshot, STORAGE_KEY } from './protocol.js';
import { storageProblem } from '../utils/storage.js';

let notice = '';
export const miniNotice = () => notice;
const report = text => { notice=text; window.dispatchEvent(new Event('fieldops-mini')); };
export function startMiniBridge() {
    const native = window.FieldOpsMini;
    if (!native?.postMessage) return;
    if (!store.getState().miniSync?.epoch) store.setState({miniSync:{epoch:crypto.randomUUID(),receipts:{}}});
    let busy=false, stopped=false;
    const send = message => native.postMessage(JSON.stringify(message));
    const tick = async () => {
        if (busy || stopped) return;
        busy=true;
        try {
            if (storageProblem()) throw new Error(storageProblem());
            // Publish only a durable state, never an unsaved phone edit.
            const durable = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.state;
            const state=store.getState();
            if (!durable?.miniSync || JSON.stringify(durable.services)!==JSON.stringify(state.services)) throw new Error('Saat eşitlemesi kayıtların kaydedilmesini bekliyor.');
            send({type:'snapshot',value:await snapshot(state)});
            send({type:'poll'});
        } catch (error) { report(error.message); }
        finally {busy=false;}
    };
    let chain=Promise.resolve();
    native.onmessage = event => {
        chain=chain.then(async () => {
            const message=JSON.parse(event.data);
            if (message.type === 'operations') {
                for (const op of message.value) send({type:'ack',value:await acceptOperation(store,op)});
                report('Saat bağlantısı hazır. Saatten gelen işlemler telefon açıkken kaydedilir.');
            } else if (message.type === 'error') report(message.message);
        }).catch(error=>report(error.message));
    };
    // Periodic polling also recovers a missed listener event and date rollover.
    void tick();
    const timer=setInterval(tick,4000);
    return () => {stopped=true;clearInterval(timer);native.onmessage=null;};
}
