
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

const mapObj=L.map('mapBox',{worldCopyJump:true});window.mapObj=mapObj;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapObj);
const icon=(txt,cls)=>L.divIcon({className:'',html:`<div class="marker ${cls}">${txt}</div>`,iconSize:[34,34],iconAnchor:[17,17]});
const label=(t,c='map-label')=>L.divIcon({className:'label-wrapper',html:`<div class="${c}">${t}</div>`,iconSize:[1,1]});
const points=[
{name:'Rennes',lat:48.1035,lon:-1.6722,ico:'🚄',cls:'europe'},
{name:'Lille',lat:50.6366,lon:3.0753,ico:'🚆',cls:'europe'},
{name:'Bruxelles',lat:50.8503,lon:4.3517,ico:'✈️',cls:'airport'},
...DAYS.slice(2).filter((d,i,a)=>a.findIndex(x=>x.place===d.place)===i).map(d=>({name:d.place,lat:d.lat,lon:d.lon,ico:'★',cls:'visit'}))
];
points.forEach(p=>{L.marker([p.lat,p.lon],{icon:icon(p.ico,p.cls)}).addTo(mapObj).bindPopup(`<b>${p.name}</b>`);L.marker([p.lat,p.lon],{icon:label(p.name)}).addTo(mapObj)});
SEGMENTS.forEach(s=>{const flight=s.t.includes('✈️');L.polyline([s.a,s.b],{color:flight?'#563c8c':'#8f2b24',weight:flight?3:4,dashArray:flight?'12,8':'8,6'}).addTo(mapObj);if(!flight||mapObj.getZoom()>3){const m=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2];L.marker(m,{icon:label(s.t,'time-label')}).addTo(mapObj)}});
const globalBounds=L.latLngBounds([[24,-6],[53,112]]),europeBounds=L.latLngBounds([[47,-3],[52,6]]),chinaBounds=L.latLngBounds([[24,102],[35,110]]);
function showGlobal(){mapObj.fitBounds(globalBounds,{padding:[30,30]})}function showEurope(){mapObj.fitBounds(europeBounds,{padding:[30,30]})}function showChina(){mapObj.fitBounds(chinaBounds,{padding:[30,30]})}window.showGlobal=showGlobal;window.showEurope=showEurope;window.showChina=showChina;showGlobal();
const leg=L.control({position:'bottomright'});leg.onAdd=()=>{const d=L.DomUtil.create('div','map-legend');d.innerHTML='🚄 Train · ✈️ Vol · ★ Site<br>Trait rouge : circuit en Chine';return d};leg.addTo(mapObj);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
