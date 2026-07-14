
const DAYS=window.DAYS,HOTELS=window.HOTELS,SEGMENTS=window.SEGMENTS;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function showView(id){$$('.view').forEach(v=>v.classList.remove('active'));$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#'+id).classList.add('active');if(id==='map'&&window.mapObj)setTimeout(()=>mapObj.invalidateSize(),100)}
$$('.tabs button').forEach(b=>b.onclick=()=>showView(b.dataset.view));

const keyDay=i=>'cn26_day_'+i,keyHotel=i=>'cn26_hotel_'+i,keyTrain=i=>'cn26_train_'+i;
const photoCache={};
async function wikiPhoto(page){
 if(photoCache[page])return photoCache[page];
 try{
  const r=await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`);
  if(!r.ok)throw 0;const j=await r.json();const url=j.thumbnail?.source||j.originalimage?.source||'';photoCache[page]=url;return url;
 }catch{return ''}
}
async function setPhoto(el,page){
 const u=await wikiPhoto(page);if(u)el.style.backgroundImage=`url("${u}")`;
}

DAYS.forEach((d,i)=>{
 const a=document.createElement('article');a.className='day';
 a.innerHTML=`<div class="day-photo" id="photo-${i}"><div class="caption">${d.place}</div></div><div class="day-body"><div class="date">${d.date}</div><h3>${d.title}</h3><div class="muted">Nuit : ${d.night}</div><ul>${d.plan.map(x=>`<li>${x}</li>`).join('')}</ul><details><summary>Notre récit et nos notes</summary><textarea id="day-${i}" placeholder="Racontez la journée, ajoutez une adresse, une dépense ou un souvenir…"></textarea><div class="actions"><button onclick="saveDay(${i})">Enregistrer</button></div></details></div>`;
 $('#days').appendChild(a);$(`#day-${i}`).value=localStorage.getItem(keyDay(i))||'';setPhoto($(`#photo-${i}`),d.wiki);
});
setPhoto($('#mainHero'),'Jiuzhaigou');

HOTELS.forEach((h,i)=>{
 const a=document.createElement('article');a.className='card hotel-card';
 a.innerHTML=`<div class="hotel-pick"><div class="muted">Suggestion qualité-prix · ${h.city}</div><h3>${h.recommended}</h3><p>${h.why}</p><a href="${h.source}" target="_blank" rel="noopener">Vérifier les disponibilités</a></div><div><h3>Mon hôtel réservé</h3><input id="hotel-${i}" type="text" placeholder="Nom de l’hôtel"><textarea id="hotel-note-${i}" placeholder="Adresse, téléphone, numéro de réservation…"></textarea><div class="actions"><button onclick="saveHotel(${i})">Enregistrer</button></div></div>`;
 $('#hotelCards').appendChild(a);const v=JSON.parse(localStorage.getItem(keyHotel(i))||'{}');$(`#hotel-${i}`).value=v.name||'';$(`#hotel-note-${i}`).value=v.note||'';
});

SEGMENTS.forEach((s,i)=>{
 const from=nearestName(s.a),to=nearestName(s.b);const r=document.createElement('div');r.className='train-row';
 r.innerHTML=`<strong>${from} → ${to}<br><span class="muted">${s.t}</span></strong><input id="train-${i}" type="text" placeholder="N° et horaire"><input id="train-note-${i}" type="text" placeholder="Gare, siège, prix">`;
 $('#trainRows').appendChild(r);const v=JSON.parse(localStorage.getItem(keyTrain(i))||'{}');$(`#train-${i}`).value=v.train||'';$(`#train-note-${i}`).value=v.note||'';
});
function nearestName(coord){let best=DAYS[0],dist=Infinity;DAYS.forEach(d=>{const x=(d.lat-coord[0])**2+(d.lon-coord[1])**2;if(x<dist){dist=x;best=d}});return best.place}

const checks=['Passeports','Billets d’avion','Assurance voyage','Alipay et WeChat Pay','eSIM ou carte SIM','Billets de train','Réservations Jiuzhaigou et Huanglong','Réservation Mont Fanjing','Hôtels','Médicaments','Veste imperméable','Chaussures de marche'];
checks.forEach((x,i)=>{const l=document.createElement('label');l.className='check';l.innerHTML=`<input id="check-${i}" type="checkbox"><span>${x}</span>`;$('#checks').appendChild(l);$(`#check-${i}`).checked=localStorage.getItem('cn26_check_'+i)==='1';$(`#check-${i}`).onchange=e=>localStorage.setItem('cn26_check_'+i,e.target.checked?'1':'0')});

function saveDay(i){localStorage.setItem(keyDay(i),$(`#day-${i}`).value);flash()}
function saveHotel(i){localStorage.setItem(keyHotel(i),JSON.stringify({name:$(`#hotel-${i}`).value,note:$(`#hotel-note-${i}`).value}));flash()}
function saveAll(){DAYS.forEach((_,i)=>localStorage.setItem(keyDay(i),$(`#day-${i}`).value));HOTELS.forEach((_,i)=>saveHotel(i));SEGMENTS.forEach((_,i)=>localStorage.setItem(keyTrain(i),JSON.stringify({train:$(`#train-${i}`).value,note:$(`#train-note-${i}`).value})));localStorage.setItem('cn26_general',$('#generalNotes').value);flash()}
function flash(){const s=$('#status');s.textContent='Enregistré ✓';setTimeout(()=>s.textContent='',1600)}
$('#generalNotes').value=localStorage.getItem('cn26_general')||'';

function exportData(){saveAll();const d={general:$('#generalNotes').value,days:{},hotels:{},trains:{},checks:{},album:$('#sharedAlbum').value};DAYS.forEach((_,i)=>d.days[i]=$(`#day-${i}`).value);HOTELS.forEach((_,i)=>d.hotels[i]={name:$(`#hotel-${i}`).value,note:$(`#hotel-note-${i}`).value});SEGMENTS.forEach((_,i)=>d.trains[i]={train:$(`#train-${i}`).value,note:$(`#train-note-${i}`).value});checks.forEach((_,i)=>d.checks[i]=$(`#check-${i}`).checked);const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='notre-voyage-chine-2026.json';a.click()}
$('#importFile').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());$('#generalNotes').value=d.general||'';DAYS.forEach((_,i)=>$(`#day-${i}`).value=d.days?.[i]||'');HOTELS.forEach((_,i)=>{$(`#hotel-${i}`).value=d.hotels?.[i]?.name||'';$(`#hotel-note-${i}`).value=d.hotels?.[i]?.note||''});SEGMENTS.forEach((_,i)=>{$(`#train-${i}`).value=d.trains?.[i]?.train||'';$(`#train-note-${i}`).value=d.trains?.[i]?.note||''});checks.forEach((_,i)=>$(`#check-${i}`).checked=!!d.checks?.[i]);$('#sharedAlbum').value=d.album||'';saveSharedAlbum();saveAll();alert('Données importées.')}catch{alert('Fichier invalide.')}};

function saveSharedAlbum(){const u=$('#sharedAlbum').value.trim();localStorage.setItem('cn26_album',u);const a=$('#openAlbum');if(u){a.href=u;a.classList.remove('hidden')}else a.classList.add('hidden')}
$('#sharedAlbum').value=localStorage.getItem('cn26_album')||'';saveSharedAlbum();

const galleryDB=[];$('#photoInput').onchange=e=>{[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{galleryDB.push(r.result);renderGallery()};r.readAsDataURL(f)})};
function renderGallery(){$('#localGallery').innerHTML=galleryDB.map(x=>`<img src="${x}" alt="Photo du voyage">`).join('')}

function todayCard(){const now=new Date(),parsed=DAYS.map((d,i)=>{const m=d.date.match(/(\d+)\s+(juillet|août)/);if(!m)return null;return{i,date:new Date(2026,m[2]==='juillet'?6:7,+m[1])}}).filter(Boolean);const f=parsed.find(x=>x.date.toDateString()===now.toDateString())||parsed.find(x=>x.date>=now)||parsed.at(-1);const d=DAYS[f.i];$('#today').innerHTML=`<strong>${d.date} — ${d.title}</strong><p>${d.plan.join(' · ')}</p>`}todayCard();

const mapObj=L.map('mapBox').setView([29.4,105.2],6);window.mapObj=mapObj;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapObj);
const vi=L.divIcon({className:'',html:'<div class="marker visit">★</div>',iconSize:[34,34],iconAnchor:[17,17]}),hi=L.divIcon({className:'',html:'<div class="marker hotel">🛏</div>',iconSize:[34,34],iconAnchor:[17,17]});
const label=(t,c='map-label')=>L.divIcon({className:'label-wrapper',html:`<div class="${c}">${t}</div>`,iconSize:[1,1]});
const unique=[];DAYS.forEach(d=>{if(!unique.some(x=>x.place===d.place))unique.push(d)});
unique.forEach(d=>{L.marker([d.lat,d.lon],{icon:vi}).addTo(mapObj).bindPopup(`<b>${d.title}</b><br>${d.place}`);L.marker([d.lat,d.lon],{icon:label(d.place)}).addTo(mapObj)});
HOTELS.forEach((h,i)=>{const d=DAYS.find(x=>x.night===h.city)||DAYS.find(x=>x.place===h.city);if(d)L.marker([d.lat+.04,d.lon+.04],{icon:hi}).addTo(mapObj).bindPopup(`<b>Hébergement : ${h.city}</b><br>${$(`#hotel-${i}`).value||h.recommended}`)});
SEGMENTS.forEach(s=>{L.polyline([s.a,s.b],{color:'#8f2b24',weight:4,dashArray:'8,6'}).addTo(mapObj);const m=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];L.marker(m,{icon:label(s.t,'time-label')}).addTo(mapObj)});
mapObj.fitBounds(DAYS.map(d=>[d.lat,d.lon]),{padding:[30,30]});
const leg=L.control({position:'bottomright'});leg.onAdd=()=>{const d=L.DomUtil.create('div','map-legend');d.innerHTML='★ Site à visiter<br>🛏 Hébergement<br>--- Durée indicative';return d};leg.addTo(mapObj);

let deferredPrompt;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
