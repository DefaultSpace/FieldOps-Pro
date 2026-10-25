let problem='';
let unreadable=false;
function report(message){problem=message;if(typeof window!=='undefined')window.dispatchEvent(new Event('fieldops-storage'));}
export const storageProblem=()=>problem;
export function saveCheckpoint(state) {
 if(unreadable)return;
 try {localStorage.setItem('fieldops-checkpoint',JSON.stringify({version:3,exportedAt:Date.now(),s:state.services,a:state.archive,activity:state.activity || []}));}
 catch {report('İşlem öncesi yerel kurtarma kopyası kaydedilemedi. Yedek indir ile kayıtlarını al.');}
}
export function readCheckpoint(){try{return localStorage.getItem('fieldops-checkpoint');}catch{return null;}}
export const safeStorage={
 getItem(key){try {const value=localStorage.getItem(key);if(value)JSON.parse(value);return value;}catch{unreadable=true;report('Kaydedilmiş veriler okunamadı. Mevcut tarayıcı kaydı üzerine yazılmıyor. Yedeğini kontrol et; site verilerini silme.');return null;}},
 setItem(key,value){if(unreadable)return;try{localStorage.setItem(key,value);report('');}catch{report('Değişiklikler tarayıcıya kaydedilemedi. Sayfayı kapatmadan Yedek indir ile kayıtlarını al.');}},
 removeItem(key){try{localStorage.removeItem(key);}catch{report('Tarayıcı depolamasına erişilemiyor.');}},
};
