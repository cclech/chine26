
const itinerary = window.ITINERARY;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

$$('.tabs button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tabs button').forEach(b=>b.classList.remove('active'));
    $$('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    $('#'+btn.dataset.target).classList.add('active');
    if(btn.dataset.target==='map' && window.mapObj) setTimeout(()=>mapObj.invalidateSize(),100);
  });
});

const dayKey=i=>`chine26_day_${i}`;
const travelKey=i=>`chine26_travel_${i}`;
const hotelKey=i=>`chine26_hotel_${i}`;

itinerary.forEach((d,i)=>{
  const el=document.createElement('article');
  el.className='day';
  el.innerHTML=`<div class="day-head"><div class="badge">${d.date}</div><div><h3>${d.title}</h3><div class="muted">${d.place} · Nuit : ${d.night}</div><ul>${d.plan.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
  <details><summary>Mes notes</summary><textarea id="day-${i}" placeholder="Réservation, adresse, impression, dépense…"></textarea><div class="actions"><button onclick="saveDay(${i})">Enregistrer</button></div></details>`;
  $('#daysList').appendChild(el);
  setTimeout(()=>{const n=$(`#day-${i}`);if(n)n.value=localStorage.getItem(dayKey(i))||''},0);
});

const transfers = [
"Chengdu → Emeishan","Emeishan → Leshan → Chengdu","Chengdu → Huanglongjiuzhai","Jiuzhaigou → Dujiangyan",
"Dujiangyan → Chongqing","Chongqing → Anshun","Anshun → Kaili","Kaili → Jiangkou","Jiangkou → Guiyang","Guiyang → Chengdu"
];
transfers.forEach((t,i)=>{
  const row=document.createElement('div');row.className='travel-row';
  row.innerHTML=`<strong>${t}</strong><input id="travel-time-${i}" type="text" placeholder="Horaire / train"><input id="travel-note-${i}" type="text" placeholder="Gare / prix / siège">`;
  $('#travelList').appendChild(row);
  const saved=JSON.parse(localStorage.getItem(travelKey(i))||'{}');
  setTimeout(()=>{ $(`#travel-time-${i}`).value=saved.time||''; $(`#travel-note-${i}`).value=saved.note||''; },0);
});

[...new Set(itinerary.map(x=>x.night).filter(x=>x!=='—'))].forEach((city,i)=>{
  const row=document.createElement('div');row.className='hotel-row';
  row.innerHTML=`<strong>${city}</strong><input id="hotel-${i}" type="text" placeholder="Nom, adresse, téléphone, réservation">`;
  $('#hotelList').appendChild(row);
  setTimeout(()=>{$(`#hotel-${i}`).value=localStorage.getItem(hotelKey(i))||''},0);
});

const checklist=["Passeports","Billets d’avion","Assurance voyage","Alipay / WeChat Pay","eSIM ou carte SIM","Billets de train","Réservations Jiuzhaigou / Huanglong","Réservation Mont Fanjing","Hôtels","Médicaments personnels","Veste imperméable","Chaussures de marche"];
checklist.forEach((label,i)=>{
 const div=document.createElement('label');div.className='check';
 div.innerHTML=`<input type="checkbox" id="check-${i}"><span>${label}</span>`;
 $('#checklistItems').appendChild(div);
 setTimeout(()=>{$(`#check-${i}`).checked=localStorage.getItem(`chine26_check_${i}`)==='1';$(`#check-${i}`).onchange=e=>localStorage.setItem(`chine26_check_${i}`,e.target.checked?'1':'0')},0);
});

function saveDay(i){localStorage.setItem(dayKey(i),$(`#day-${i}`).value);showSaved()}
function saveAll(){
 itinerary.forEach((_,i)=>localStorage.setItem(dayKey(i),$(`#day-${i}`).value));
 transfers.forEach((_,i)=>localStorage.setItem(travelKey(i),JSON.stringify({time:$(`#travel-time-${i}`).value,note:$(`#travel-note-${i}`).value})));
 [...new Set(itinerary.map(x=>x.night).filter(x=>x!=='—'))].forEach((_,i)=>localStorage.setItem(hotelKey(i),$(`#hotel-${i}`).value));
 localStorage.setItem('chine26_general',$('#generalNotes').value);showSaved();
}
function showSaved(){const s=$('#saveStatus');s.textContent='Enregistré ✓';setTimeout(()=>s.textContent='',1600)}
$('#generalNotes').value=localStorage.getItem('chine26_general')||'';

function exportData(){
 saveAll();
 const data={general:$('#generalNotes').value,days:{},travel:{},hotels:{},checklist:{}};
 itinerary.forEach((_,i)=>data.days[i]=$(`#day-${i}`).value);
 transfers.forEach((_,i)=>data.travel[i]={time:$(`#travel-time-${i}`).value,note:$(`#travel-note-${i}`).value});
 [...new Set(itinerary.map(x=>x.night).filter(x=>x!=='—'))].forEach((_,i)=>data.hotels[i]=$(`#hotel-${i}`).value);
 checklist.forEach((_,i)=>data.checklist[i]=$(`#check-${i}`).checked);
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='roadbook-chine26-sauvegarde.json';a.click();
}
$('#importFile').addEventListener('change',async e=>{
 try{
  const d=JSON.parse(await e.target.files[0].text());
  $('#generalNotes').value=d.general||'';
  itinerary.forEach((_,i)=>$(`#day-${i}`).value=d.days?.[i]||'');
  transfers.forEach((_,i)=>{$(`#travel-time-${i}`).value=d.travel?.[i]?.time||'';$(`#travel-note-${i}`).value=d.travel?.[i]?.note||''});
  [...new Set(itinerary.map(x=>x.night).filter(x=>x!=='—'))].forEach((_,i)=>$(`#hotel-${i}`).value=d.hotels?.[i]||'');
  checklist.forEach((_,i)=>$(`#check-${i}`).checked=!!d.checklist?.[i]);
  saveAll();alert('Sauvegarde importée.');
 }catch{alert('Fichier invalide.')}
});

function buildToday(){
 const now=new Date(),year=2026;
 const parsed=itinerary.map((d,i)=>{
  const m=d.date.match(/(\d+)\s+(juillet|août)/); if(!m)return null;
  const month=m[2]==='juillet'?6:7; return {i,date:new Date(year,month,+m[1])};
 }).filter(Boolean);
 const found=parsed.find(x=>x.date.toDateString()===now.toDateString()) || parsed.find(x=>x.date>=now) || parsed[parsed.length-1];
 const d=itinerary[found.i];
 $('#todayCard').innerHTML=`<strong>${d.date} — ${d.title}</strong><p>${d.plan.join(' · ')}</p>`;
}
buildToday();


const mapObj=L.map('mapCanvas').setView([29.4,105.2],6);window.mapObj=mapObj;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19, attribution:'© OpenStreetMap'
}).addTo(mapObj);

const visitIcon=L.divIcon({
  className:'custom-marker',
  html:'<div class="marker visit">★</div>',
  iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-18]
});
const hotelIcon=L.divIcon({
  className:'custom-marker',
  html:'<div class="marker hotel">🛏</div>',
  iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-18]
});

const visitSites=[
{name:'Chengdu',lat:30.5728,lon:104.0668,detail:'Ville, pandas, maisons de thé et opéra du Sichuan'},
{name:'Mont Emei',lat:29.5229,lon:103.3321,detail:'Sommet d’Or, temples et randonnée'},
{name:'Grand Bouddha de Leshan',lat:29.5449,lon:103.7739,detail:'Grand Bouddha et promenade sur le site'},
{name:'Parc national de Jiuzhaigou',lat:33.2600,lon:103.9186,detail:'Lacs turquoise, cascades et passerelles'},
{name:'Huanglong',lat:32.7472,lon:103.8337,detail:'Bassins turquoise et randonnée en altitude'},
{name:'Mont Qingcheng',lat:30.9000,lon:103.5650,detail:'Montagne taoïste et sentiers forestiers'},
{name:'Dujiangyan',lat:31.0050,lon:103.6194,detail:'Système d’irrigation historique'},
{name:'Chongqing',lat:29.5630,lon:106.5516,detail:'Hongyadong, Jiefangbei et téléphérique du Yangtsé'},
{name:'Chutes de Huangguoshu',lat:25.9926,lon:105.6671,detail:'Grand ensemble de cascades'},
{name:'Kaili',lat:26.5835,lon:107.9785,detail:'Culture Miao et Dong, marché et artisanat'},
{name:'Mont Fanjing',lat:27.9150,lon:108.6990,detail:'Sommet sacré et randonnée'},
{name:'Guiyang / Qingyan',lat:26.6470,lon:106.6302,detail:'Vieille ville de Qingyan et découverte de Guiyang'}
];

const hotelStops=[
{city:'Chengdu',lat:30.5850,lon:104.0900},
{city:'Emeishan',lat:29.6012,lon:103.4845},
{city:'Jiuzhaigou',lat:33.2450,lon:103.9000},
{city:'Dujiangyan',lat:31.0200,lon:103.6350},
{city:'Chongqing',lat:29.5800,lon:106.5700},
{city:'Anshun',lat:26.2456,lon:105.9322},
{city:'Kaili',lat:26.6000,lon:107.9950},
{city:'Jiangkou',lat:27.6997,lon:108.8399},
{city:'Guiyang',lat:26.6650,lon:106.6500}
];

const hotelCities=[...new Set(itinerary.map(x=>x.night).filter(x=>x!=='—'))];
const hotelIndexByCity=Object.fromEntries(hotelCities.map((c,i)=>[c,i]));

visitSites.forEach(s=>{
 L.marker([s.lat,s.lon],{icon:visitIcon}).addTo(mapObj)
  .bindPopup(`<strong>Site à visiter</strong><br><b>${s.name}</b><br>${s.detail}`);
});

const hotelMarkers=[];
hotelStops.forEach(s=>{
 const idx=hotelIndexByCity[s.city];
 const saved=idx!==undefined?(localStorage.getItem(hotelKey(idx))||''):'';
 const marker=L.marker([s.lat,s.lon],{icon:hotelIcon}).addTo(mapObj)
  .bindPopup(`<strong>Hébergement</strong><br><b>${s.city}</b><br>${saved||'Hébergement à confirmer'}`);
 marker.hotelCity=s.city;hotelMarkers.push(marker);
});

const routeCoords=itinerary.map(d=>[d.lat,d.lon]);
L.polyline(routeCoords,{color:'#9d2b22',weight:4,opacity:.75,dashArray:'8,6'}).addTo(mapObj);
mapObj.fitBounds(routeCoords,{padding:[30,30]});

const legend=L.control({position:'bottomright'});
legend.onAdd=function(){
 const div=L.DomUtil.create('div','map-legend');
 div.innerHTML='<div><span class="legend-dot visit-dot">★</span> Site à visiter</div>'+
 '<div><span class="legend-dot hotel-dot">🛏</span> Hébergement</div>'+
 '<div><span class="legend-line"></span> Itinéraire</div>';
 return div;
};
legend.addTo(mapObj);

function refreshHotelPopups(){
 hotelMarkers.forEach(marker=>{
  const idx=hotelIndexByCity[marker.hotelCity];
  const saved=idx!==undefined?(localStorage.getItem(hotelKey(idx))||''):'';
  marker.setPopupContent(`<strong>Hébergement</strong><br><b>${marker.hotelCity}</b><br>${saved||'Hébergement à confirmer'}`);
 });
}
$$('.tabs button').forEach(btn=>{
 btn.addEventListener('click',()=>{
  if(btn.dataset.target==='map')setTimeout(()=>{mapObj.invalidateSize();refreshHotelPopups()},120);
 });
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')}});

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
