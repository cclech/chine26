
const DAYS=window.DAYS,HOTELS=window.HOTELS,RESERVATIONS=window.RESERVATIONS,SEGMENTS=window.SEGMENTS;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function showView(id){$$('.view').forEach(v=>v.classList.remove('active'));$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#'+id).classList.add('active');if(id==='map'&&window.mapObj)setTimeout(()=>mapObj.invalidateSize(),100)}
$$('.tabs button').forEach(b=>b.onclick=()=>showView(b.dataset.view));

const keyDay=i=>'cn26_day_'+i,keyHotel=i=>'cn26_hotel_'+i,keyTrain=i=>'cn26_train_'+i;
const fallback={
"Rennes_station":"https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80",
"Air_China":"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80",
"Chengdu":"https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1600&q=80",
"Mount_Emei":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
"Leshan_Giant_Buddha":"https://images.unsplash.com/photo-1600093463592-2e8d28d7f1f6?auto=format&fit=crop&w=1600&q=80",
"Jiuzhaigou":"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
"Huanglong_Scenic_and_Historic_Interest_Area":"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
"Dujiangyan":"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80",
"Mount_Qingcheng":"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
"Chongqing":"https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80",
"Anshun":"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
"Huangguoshu_Waterfall":"https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80",
"Kaili_City":"https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80",
"Fanjing_Mountain":"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80",
"Qingyan":"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
"Chengdu_Tianfu_International_Airport":"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"};
async function setPhoto(el,page){let u='';try{const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`);if(r.ok){const j=await r.json();u=j.thumbnail?.source||j.originalimage?.source||''}}catch{};u=u||fallback[page]||fallback.Chengdu;el.style.backgroundImage=`url("${u}")`}

DAYS.forEach((d,i)=>{const a=document.createElement('article');a.className='day';a.innerHTML=`<div class="day-photo" id="photo-${i}"><div class="caption">${d.place}</div></div><div class="day-body"><div class="date">${d.date}</div><h3>${d.title}</h3><div class="muted">Nuit : ${d.night}</div><ul>${d.plan.map(x=>`<li>${x}</li>`).join('')}</ul><details><summary>Notre récit et nos notes</summary><textarea id="day-${i}" placeholder="Racontez la journée…"></textarea><div class="actions"><button onclick="saveDay(${i})">Enregistrer</button></div></details></div>`;$('#days').appendChild(a);$(`#day-${i}`).value=localStorage.getItem(keyDay(i))||'';setPhoto($(`#photo-${i}`),d.wiki)});setPhoto($('#mainHero'),'Jiuzhaigou');

RESERVATIONS.forEach(r=>{const d=document.createElement('article');d.className='card reservation-row';d.innerHTML=`<strong>${r.type}<br>${r.title}</strong><span>${r.date}<br>${r.time}</span><span class="ok">${r.status}</span><strong>${r.price}</strong>`;$('#reservationCards').appendChild(d)});
HOTELS.forEach((h,i)=>{const a=document.createElement('article');a.className='card hotel-card';a.innerHTML=`<div class="hotel-pick"><div class="muted">Suggestion Booking.com · ${h.city}</div><h3>${h.recommended}</h3><p>${h.why}</p><a href="${h.source}" target="_blank">Voir sur Booking.com</a></div><div><h3>Mon hôtel réservé</h3><input id="hotel-${i}" type="text" placeholder="Nom de l’hôtel"><textarea id="hotel-note-${i}" placeholder="Adresse, téléphone, réservation…"></textarea><div class="actions"><button onclick="saveHotel(${i})">Enregistrer</button></div></div>`;$('#hotelCards').appendChild(a);const v=JSON.parse(localStorage.getItem(keyHotel(i))||'{}');$(`#hotel-${i}`).value=v.name||'';$(`#hotel-note-${i}`).value=v.note||''});

SEGMENTS.forEach((s,i)=>{const r=document.createElement('div');r.className='train-row';r.innerHTML=`<strong>${s.t}</strong><input id="train-${i}" type="text" placeholder="N° et horaire"><input id="train-note-${i}" type="text" placeholder="Gare, siège, prix">`;$('#trainRows').appendChild(r);const v=JSON.parse(localStorage.getItem(keyTrain(i))||'{}');$(`#train-${i}`).value=v.train||'';$(`#train-note-${i}`).value=v.note||''});

const checks=['Passeports','Billets d’avion','Assurance voyage','Alipay et WeChat Pay','eSIM ou carte SIM','Billets de train','Réservations Jiuzhaigou et Huanglong','Réservation Mont Fanjing','Hôtels','Médicaments','Veste imperméable','Chaussures de marche'];
checks.forEach((x,i)=>{const l=document.createElement('label');l.className='check';l.innerHTML=`<input id="check-${i}" type="checkbox"><span>${x}</span>`;$('#checks').appendChild(l);$(`#check-${i}`).checked=localStorage.getItem('cn26_check_'+i)==='1';$(`#check-${i}`).onchange=e=>localStorage.setItem('cn26_check_'+i,e.target.checked?'1':'0')});
function saveDay(i){localStorage.setItem(keyDay(i),$(`#day-${i}`).value);flash()}function saveHotel(i){localStorage.setItem(keyHotel(i),JSON.stringify({name:$(`#hotel-${i}`).value,note:$(`#hotel-note-${i}`).value}));flash()}
function saveAll(){DAYS.forEach((_,i)=>localStorage.setItem(keyDay(i),$(`#day-${i}`).value));HOTELS.forEach((_,i)=>saveHotel(i));SEGMENTS.forEach((_,i)=>localStorage.setItem(keyTrain(i),JSON.stringify({train:$(`#train-${i}`).value,note:$(`#train-note-${i}`).value})));localStorage.setItem('cn26_general',$('#generalNotes').value);flash()}
function flash(){const s=$('#status');s.textContent='Enregistré ✓';setTimeout(()=>s.textContent='',1600)}$('#generalNotes').value=localStorage.getItem('cn26_general')||'';
function exportData(){saveAll();const d={general:$('#generalNotes').value,days:{},hotels:{},trains:{},checks:{},album:$('#sharedAlbum').value};DAYS.forEach((_,i)=>d.days[i]=$(`#day-${i}`).value);HOTELS.forEach((_,i)=>d.hotels[i]={name:$(`#hotel-${i}`).value,note:$(`#hotel-note-${i}`).value});SEGMENTS.forEach((_,i)=>d.trains[i]={train:$(`#train-${i}`).value,note:$(`#train-note-${i}`).value});checks.forEach((_,i)=>d.checks[i]=$(`#check-${i}`).checked);const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='notre-voyage-chine-2026.json';a.click()}
$('#sharedAlbum').value=localStorage.getItem('cn26_album')||'';function saveSharedAlbum(){const u=$('#sharedAlbum').value.trim();localStorage.setItem('cn26_album',u);const a=$('#openAlbum');if(u){a.href=u;a.classList.remove('hidden')}else a.classList.add('hidden')}saveSharedAlbum();
const galleryDB=[];$('#photoInput').onchange=e=>{[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{galleryDB.push(r.result);$('#localGallery').innerHTML=galleryDB.map(x=>`<img src="${x}">`).join('')};r.readAsDataURL(f)})};
function todayCard(){const now=new Date(),p=DAYS.map((d,i)=>{const m=d.date.match(/(\d+)\s+(juillet|août)/);if(!m)return null;return{i,date:new Date(2026,m[2]==='juillet'?6:7,+m[1])}}).filter(Boolean);const f=p.find(x=>x.date.toDateString()===now.toDateString())||p.find(x=>x.date>=now)||p.at(-1),d=DAYS[f.i];$('#today').innerHTML=`<strong>${d.date} — ${d.title}</strong><p>${d.plan.join(' · ')}</p>`}todayCard();


const mapObj=L.map('mapBox');window.mapObj=mapObj;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,attribution:'© OpenStreetMap'
}).addTo(mapObj);

const icon=(txt,cls)=>L.divIcon({
  className:'',
  html:`<div class="marker ${cls}">${txt}</div>`,
  iconSize:[34,34],iconAnchor:[17,17]
});
const label=(t,c='map-label')=>L.divIcon({
  className:'label-wrapper',
  html:`<div class="${c}">${t}</div>`,
  iconSize:[1,1]
});

const points=[
{name:'Chengdu',lat:30.5728,lon:104.0668,kind:'hotel'},
{name:'Mont Emei',lat:29.5229,lon:103.3321,kind:'visit'},
{name:'Grand Bouddha de Leshan',lat:29.5449,lon:103.7739,kind:'visit'},
{name:'Jiuzhaigou',lat:33.2600,lon:103.9186,kind:'visit'},
{name:'Huanglong',lat:32.7472,lon:103.8337,kind:'visit'},
{name:'Dujiangyan',lat:31.0050,lon:103.6194,kind:'hotel'},
{name:'Mont Qingcheng',lat:30.9000,lon:103.5650,kind:'visit'},
{name:'Chongqing',lat:29.5630,lon:106.5516,kind:'hotel'},
{name:'Anshun',lat:26.2456,lon:105.9322,kind:'hotel'},
{name:'Huangguoshu',lat:25.9926,lon:105.6671,kind:'visit'},
{name:'Kaili',lat:26.5835,lon:107.9785,kind:'hotel'},
{name:'Jiangkou',lat:27.6997,lon:108.8399,kind:'hotel'},
{name:'Mont Fanjing',lat:27.9150,lon:108.6990,kind:'visit'},
{name:'Guiyang',lat:26.6470,lon:106.6302,kind:'hotel'}
];

points.forEach(p=>{
  const cls=p.kind==='visit'?'visit':'hotel';
  const txt=p.kind==='visit'?'★':'🛏';
  L.marker([p.lat,p.lon],{icon:icon(txt,cls)}).addTo(mapObj).bindPopup(`<b>${p.name}</b>`);
  L.marker([p.lat,p.lon],{icon:label(p.name)}).addTo(mapObj);
});

const segments=[
{a:[30.5728,104.0668],b:[29.6012,103.4845],t:'🚄 1 h à 1 h 30'},
{a:[29.6012,103.4845],b:[29.5449,103.7739],t:'🚄 20 à 30 min'},
{a:[29.5449,103.7739],b:[30.5728,104.0668],t:'🚄 environ 1 h'},
{a:[30.5728,104.0668],b:[33.2600,103.9186],t:'🚄 + navette 3 h 30 à 4 h 30'},
{a:[33.2600,103.9186],b:[32.7472,103.8337],t:'🚌 environ 2 h'},
{a:[33.2600,103.9186],b:[31.0050,103.6194],t:'🚄 + transfert 3 h à 4 h'},
{a:[31.0050,103.6194],b:[29.5630,106.5516],t:'🚄 2 h à 2 h 30'},
{a:[29.5630,106.5516],b:[26.2456,105.9322],t:'🚄 environ 2 h 30'},
{a:[26.2456,105.9322],b:[25.9926,105.6671],t:'🚌 45 min à 1 h'},
{a:[25.9926,105.6671],b:[26.5835,107.9785],t:'🚄 + transfert 2 h 30 à 3 h 30'},
{a:[26.5835,107.9785],b:[27.6997,108.8399],t:'🚗 2 h 30 à 3 h 30'},
{a:[27.6997,108.8399],b:[27.9150,108.6990],t:'🚗 30 à 45 min'},
{a:[27.9150,108.6990],b:[26.6470,106.6302],t:'🚗 + 🚄 3 h à 4 h'},
{a:[26.6470,106.6302],b:[30.5728,104.0668],t:'🚄 3 h 30 à 4 h 30'}
];

segments.forEach(s=>{
  L.polyline([s.a,s.b],{color:'#8f2b24',weight:4,dashArray:'8,6'}).addTo(mapObj);
  const m=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];
  L.marker(m,{icon:label(s.t,'time-label')}).addTo(mapObj);
});

mapObj.fitBounds(points.map(p=>[p.lat,p.lon]),{padding:[30,30]});
const leg=L.control({position:'bottomright'});
leg.onAdd=()=>{
  const d=L.DomUtil.create('div','map-legend');
  d.innerHTML='★ Site à visiter<br>🛏 Ville-étape / hébergement';
  return d;
};
leg.addTo(mapObj);

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister()));
}
if('caches' in window){
  caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));
}
