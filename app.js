
const DAYS=window.DAYS,HOTELS=window.HOTELS,RESERVATIONS=window.RESERVATIONS,SEGMENTS=window.SEGMENTS,TRAIN_BOOKINGS=window.TRAIN_BOOKINGS||[];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function showView(id){$$('.view').forEach(v=>v.classList.remove('active'));$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#'+id).classList.add('active');if(id==='map'&&window.mapObj)setTimeout(()=>mapObj.invalidateSize(),100)}
$$('.tabs button').forEach(b=>b.onclick=()=>showView(b.dataset.view));

const keyDay=i=>'cn26_day_'+i,keyHotel=i=>'cn26_hotel_'+i,keyTrain=i=>'cn26_train_'+i;
const LOCAL_PHOTOS={"Rennes_station": "images/rennes.jpg", "Air_China": "images/air-china.jpg", "Chengdu": "images/chengdu.jpg", "Emeishan_City": "images/mont-emei.jpg", "Mount_Emei": "images/mont-emei.jpg", "Leshan_Giant_Buddha": "images/leshan.jpg", "Jiuzhaigou": "images/jiuzhaigou.jpg", "Huanglong_Scenic_and_Historic_Interest_Area": "images/huanglong.jpg", "Dujiangyan": "images/dujiangyan.jpg", "Mount_Qingcheng": "images/qingcheng.jpg", "Chongqing": "images/chongqing.jpg", "Anshun": "images/huangguoshu.jpg", "Huangguoshu_Waterfall": "images/huangguoshu.jpg", "Kaili_City": "images/kaili.jpg", "Jiangkou_County": "images/fanjing.jpg", "Fanjing_Mountain": "images/fanjing.jpg", "Qingyan": "images/qingyan.jpg", "Sichuan_opera": "images/opera-sichuan.jpg", "Chengdu_Tianfu_International_Airport": "images/tianfu-airport.jpg"};

function setPhoto(element,page){
  const url=LOCAL_PHOTOS[page]||LOCAL_PHOTOS["Chengdu"];
  if(element.tagName==="IMG"){
    element.src=url;
    element.alt=(page||"Photo du voyage").replaceAll("_"," ");
    element.hidden=false;
  }else{
    element.style.backgroundImage=`url("${url}")`;
  }
}

DAYS.forEach((d,i)=>{
  const a=document.createElement('article');
  a.className='day';
  const sourceLink=d.source?`<p class="source-link"><a href="${d.source}" target="_blank" rel="noopener">Vérifier les informations officielles</a></p>`:'';
  const schedule=(d.schedule||[]).map(x=>`<li>${x}</li>`).join('');
  const highlights=(d.highlights||[]).map(x=>`<li>${x}</li>`).join('');
  a.innerHTML=`
    <div class="day-body">
      <div class="date">${d.date}</div><div class="participant-badge">👥 ${d.participants||'2 voyageurs'}</div>
      <h3>${d.title}</h3>
      <div class="muted">Nuit : ${d.night}</div>
      <img class="day-image" id="photo-${i}" hidden>
      <div class="journal-grid">
        <section><h4>⏰ Horaires et ouverture</h4><p>${d.opening||'À vérifier.'}</p></section>
        <section><h4>🗓️ Programme conseillé</h4><ul>${schedule}</ul></section>
        <section><h4>⏱️ Durée</h4><p>${d.duration||''}</p></section>
        <section><h4>🎫 Billets</h4><p>${d.tickets||''}</p></section>
        <section><h4>📷 À ne pas manquer</h4><ul>${highlights}</ul></section>
        <section><h4>⚠️ Conseil</h4><p>${d.advice||''}</p></section>
      </div>
      ${sourceLink}
      <p class="verification-note">Horaires indicatifs pour l’été 2026 : vérifier à nouveau sur le billet ou le site officiel avant la visite.</p>
      <details>
        <summary>Notre récit et nos notes</summary>
        <textarea id="day-${i}" placeholder="Racontez la journée…"></textarea>
        <div class="actions"><button onclick="saveDay(${i})">Enregistrer</button></div>
      </details>
    </div>`;
  $('#days').appendChild(a);
  $(`#day-${i}`).value=localStorage.getItem(keyDay(i))||'';
  setPhoto($(`#photo-${i}`),d.wiki);
});
setPhoto($('#mainHero'),'Jiuzhaigou');

const defaultReservations=RESERVATIONS.map((r,i)=>({...r,id:`base-${i}`}));
let userReservations=JSON.parse(localStorage.getItem('cn26_reservations')||'[]');
function allReservations(){return [...defaultReservations,...userReservations]}
function money(v){return Number(v||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
function parsePrice(v){const m=String(v||'').replace(',','.').match(/\d+(?:\.\d+)?/);return m?Number(m[0]):0}
function renderReservations(){
  const box=$('#reservationCards');box.innerHTML='';
  allReservations().forEach((r,i)=>{const d=document.createElement('article');d.className='card reservation-row';const removable=String(r.id).startsWith('user-');d.innerHTML=`<strong>${r.type}<br>${r.title}</strong><span>${r.date||''}<br>${r.time||r.note||''}</span><span class="status-pill">${r.status||'À réserver'}</span><strong>${r.price||''}</strong>${removable?`<button class="danger small" onclick="removeReservation('${r.id}')">Supprimer</button>`:''}`;box.appendChild(d)});
  const rs=allReservations(),paid=rs.filter(r=>/payé/i.test(r.status||'')).reduce((a,r)=>a+parsePrice(r.price),0),due=rs.filter(r=>/sur place|à payer/i.test(r.status||'')).reduce((a,r)=>a+parsePrice(r.price),0);
  $('#reservationSummary').innerHTML=`<div class="stat"><span>Réservations</span><strong>${rs.length}</strong></div><div class="stat"><span>Payé</span><strong>${money(paid)}</strong></div><div class="stat"><span>À payer</span><strong>${money(due)}</strong></div>`;
}
function addReservation(){const r={id:'user-'+Date.now(),type:$('#resType').value||'Autre',title:$('#resTitle').value||'Nouvelle réservation',date:$('#resDate').value,price:$('#resPrice').value?money($('#resPrice').value):'',status:$('#resStatus').value,note:$('#resNote').value,time:$('#resNote').value};userReservations.push(r);localStorage.setItem('cn26_reservations',JSON.stringify(userReservations));renderReservations();renderBudget();['resType','resTitle','resDate','resPrice','resNote'].forEach(id=>$('#'+id).value='');}
function removeReservation(id){userReservations=userReservations.filter(r=>r.id!==id);localStorage.setItem('cn26_reservations',JSON.stringify(userReservations));renderReservations();renderBudget()}
renderReservations();
HOTELS.forEach((h,i)=>{const a=document.createElement('article');a.className='card hotel-card';a.innerHTML=`<div class="hotel-pick"><div class="muted">Suggestion Booking.com · ${h.city}</div><h3>${h.recommended}</h3><p>${h.why}</p><a href="${h.source}" target="_blank">Voir sur Booking.com</a></div><div><h3>Mon hôtel réservé</h3><input id="hotel-${i}" type="text" placeholder="Nom de l’hôtel"><textarea id="hotel-note-${i}" placeholder="Adresse, téléphone, réservation…"></textarea><div class="actions"><button onclick="saveHotel(${i})">Enregistrer</button></div></div>`;$('#hotelCards').appendChild(a);const v=JSON.parse(localStorage.getItem(keyHotel(i))||'{}');$(`#hotel-${i}`).value=v.name||'';$(`#hotel-note-${i}`).value=v.note||''});

TRAIN_BOOKINGS.forEach((t,i)=>{
  const row=document.createElement('article');
  row.className='train-booking-card';
  const saved=JSON.parse(localStorage.getItem(`cn26_train_booking_${i}`)||'{}');
  row.innerHTML=`
    <div class="train-booking-head">
      <div>
        <div class="train-route">${t.route}</div>
        <div class="muted">Trajet prévu le ${t.travel_date}</div>
      </div>
      <div class="sales-date">Réserver dès le<br><strong>${t.sales_date}</strong></div>
    </div>
    <div class="train-booking-grid">
      <div><span class="field-label">Durée indicative</span><p>${t.duration}</p></div>
      <div><span class="field-label">Conseil</span><p>${t.advice}</p></div>
      <label><span class="field-label">Statut</span>
        <select id="train-status-${i}">
          <option value="À réserver">⬜ À réserver</option>
          <option value="Pré-réservé">🟡 Pré-réservé</option>
          <option value="Réservé">✅ Réservé</option>
        </select>
      </label>
      <label><span class="field-label">N° et horaire</span>
        <input id="train-${i}" type="text" placeholder="Ex. Cxxxx · 14 h 20">
      </label>
      <label><span class="field-label">Gare, siège et prix</span>
        <input id="train-note-${i}" type="text" placeholder="Gare · voiture · siège · prix">
      </label>
    </div>
    <button onclick="saveTrain(${i})">Enregistrer ce trajet</button>`;
  $('#trainRows').appendChild(row);
  $(`#train-status-${i}`).value=saved.status||'À réserver';
  $(`#train-${i}`).value=saved.train||'';
  $(`#train-note-${i}`).value=saved.note||'';
});

const seedBudget=[
{id:'seed-flight',category:'Transport',label:'Vols Air China aller-retour · 2 passagers',amount:1767.84,status:'Payé'},
{id:'seed-brussels',category:'Hôtel',label:'Bedford Hotel Brussels',amount:98.68,status:'Payé'},
{id:'seed-chengdu',category:'Hôtel',label:'Holiday Inn Express Chengdu Phoenix Mountain',amount:53,status:'Réservé · à payer'},
{id:'seed-emei',category:'Hôtel',label:'Mount Emei Teddy Bear Hotel',amount:25.54,status:'Réservé · à payer'}];
let extraBudget=JSON.parse(localStorage.getItem('cn26_budget_items')||'[]');
function budgetItems(){return [...seedBudget,...extraBudget]}
function renderBudget(){const rows=$('#budgetRows');if(!rows)return;rows.innerHTML='';budgetItems().forEach(x=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${x.category}</td><td>${x.label}</td><td>${money(x.amount)}</td><td><span class="status-pill">${x.status}</span></td><td>${String(x.id).startsWith('user-')?`<button class="danger small" onclick="removeBudgetItem('${x.id}')">×</button>`:''}</td>`;rows.appendChild(tr)});const items=budgetItems(),total=items.reduce((a,x)=>a+Number(x.amount||0),0),paid=items.filter(x=>/payé/i.test(x.status)).reduce((a,x)=>a+Number(x.amount||0),0),due=items.filter(x=>/à payer|prévu/i.test(x.status)).reduce((a,x)=>a+Number(x.amount||0),0);$('#budgetSummary').innerHTML=`<div class="stat"><span>Total suivi</span><strong>${money(total)}</strong></div><div class="stat"><span>Déjà payé</span><strong>${money(paid)}</strong></div><div class="stat"><span>Reste / prévu</span><strong>${money(due)}</strong></div>`}
function addBudgetItem(){const amount=Number($('#budgetAmount').value);if(!amount)return;extraBudget.push({id:'user-'+Date.now(),category:$('#budgetCategory').value||'Autre',label:$('#budgetLabel').value||'Dépense',amount,status:$('#budgetStatus').value});localStorage.setItem('cn26_budget_items',JSON.stringify(extraBudget));renderBudget();$('#budgetAmount').value='';$('#budgetLabel').value='';}
function removeBudgetItem(id){extraBudget=extraBudget.filter(x=>x.id!==id);localStorage.setItem('cn26_budget_items',JSON.stringify(extraBudget));renderBudget()}
renderBudget();

const checks=['Passeports','Billets d’avion','Assurance voyage','Alipay et WeChat Pay','eSIM ou carte SIM','Billets de train','Réservations Jiuzhaigou et Huanglong','Réservation Mont Fanjing','Hôtels','Médicaments','Veste imperméable','Chaussures de marche'];
checks.forEach((x,i)=>{const l=document.createElement('label');l.className='check';l.innerHTML=`<input id="check-${i}" type="checkbox"><span>${x}</span>`;$('#checks').appendChild(l);$(`#check-${i}`).checked=localStorage.getItem('cn26_check_'+i)==='1';$(`#check-${i}`).onchange=e=>localStorage.setItem('cn26_check_'+i,e.target.checked?'1':'0')});
function saveTrain(i){
  localStorage.setItem(`cn26_train_booking_${i}`,JSON.stringify({
    status:$(`#train-status-${i}`).value,
    train:$(`#train-${i}`).value,
    note:$(`#train-note-${i}`).value
  }));
  flash();
}
function saveDay(i){localStorage.setItem(keyDay(i),$(`#day-${i}`).value);flash()}function saveHotel(i){localStorage.setItem(keyHotel(i),JSON.stringify({name:$(`#hotel-${i}`).value,note:$(`#hotel-note-${i}`).value}));flash()}
function saveAll(){
  DAYS.forEach((_,i)=>localStorage.setItem(keyDay(i),$(`#day-${i}`).value));
  HOTELS.forEach((_,i)=>saveHotel(i));
  TRAIN_BOOKINGS.forEach((_,i)=>saveTrain(i));
  localStorage.setItem('cn26_general',$('#generalNotes').value);
  flash();
}
function flash(){const s=$('#status');s.textContent='Enregistré ✓';setTimeout(()=>s.textContent='',1600)}$('#generalNotes').value=localStorage.getItem('cn26_general')||'';
function exportData(){
  saveAll();
  const data={version:'V9.2',exportedAt:new Date().toISOString(),localStorage:{}};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('cn26_'))data.localStorage[k]=localStorage.getItem(k)}
  const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='notre-voyage-chine-2026-sauvegarde-V9_2.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importDataObject(d){
  if(d&&d.localStorage){Object.entries(d.localStorage).forEach(([k,v])=>{if(k.startsWith('cn26_'))localStorage.setItem(k,String(v))});location.reload();return}
  if(d&&d.general!==undefined){localStorage.setItem('cn26_general',d.general||'');Object.entries(d.days||{}).forEach(([i,v])=>localStorage.setItem(keyDay(i),v||''));Object.entries(d.hotels||{}).forEach(([i,v])=>localStorage.setItem(keyHotel(i),JSON.stringify(v)));Object.entries(d.trains||{}).forEach(([i,v])=>localStorage.setItem(`cn26_train_booking_${i}`,JSON.stringify(v)));Object.entries(d.checks||{}).forEach(([i,v])=>localStorage.setItem('cn26_check_'+i,v?'1':'0'));if(d.album)localStorage.setItem('cn26_album',d.album);location.reload();return}
  throw new Error('Format non reconnu');
}
$('#importFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{importDataObject(JSON.parse(r.result))}catch(err){alert('Import impossible : '+err.message)}};r.readAsText(f)});
$('#sharedAlbum').value=localStorage.getItem('cn26_album')||'';function saveSharedAlbum(){const u=$('#sharedAlbum').value.trim();localStorage.setItem('cn26_album',u);const a=$('#openAlbum');if(u){a.href=u;a.classList.remove('hidden')}else a.classList.add('hidden')}saveSharedAlbum();
const galleryDB=[];$('#photoInput').onchange=e=>{[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{galleryDB.push(r.result);$('#localGallery').innerHTML=galleryDB.map(x=>`<img src="${x}">`).join('')};r.readAsDataURL(f)})};
function todayCard(){
  const monthMap={'juillet':6,'août':7};
  const now=new Date();
  const parsed=DAYS.map((d,i)=>{
    const m=d.date.match(/(\d+)\s+(juillet|août)\s+2026/);
    return m?{i,date:new Date(2026,monthMap[m[2]],Number(m[1]))}:null;
  }).filter(Boolean);
  const f=parsed.find(x=>x.date.toDateString()===now.toDateString())||parsed.find(x=>x.date>=now)||parsed.at(-1);
  const d=DAYS[f.i];
  $('#today').innerHTML=`<strong>${d.date} — ${d.title}</strong><p>${d.participants||''}</p><p>${d.plan.join(' · ')}</p>`;
}todayCard();


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
{name:'Holiday Inn Phoenix Mountain',lat:30.746,lon:104.071,kind:'hotel'},
{name:'Chez votre fils · Longtan Temple L8',lat:30.703240744407843,lon:104.16383585882713,kind:'family'},
{name:'Gare Chengdu East',lat:30.628,lon:104.141,kind:'station'},
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
  const cls=p.kind==='visit'?'visit':p.kind==='family'?'family':p.kind==='station'?'station':'hotel';
  const txt=p.kind==='visit'?'★':p.kind==='family'?'⌂':p.kind==='station'?'🚄':'🛏';
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
  d.innerHTML='★ Site à visiter<br>🛏 Hébergement<br>⌂ Logement de votre fils<br>🚄 Gare';
  return d;
};
leg.addTo(mapObj);

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));}
