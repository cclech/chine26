
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
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(mapObj);
const coords=[];
itinerary.forEach((d,i)=>{
 const marker=L.marker([d.lat,d.lon]).addTo(mapObj).bindPopup(`<strong>${d.date}</strong><br>${d.title}<br>Nuit : ${d.night}`);
 coords.push([d.lat,d.lon]);
});
L.polyline(coords,{color:'#9d2b22',weight:4,opacity:.8}).addTo(mapObj);
mapObj.fitBounds(coords,{padding:[30,30]});

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
$('#installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')}});

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
