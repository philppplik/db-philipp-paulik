
const $=id=>document.getElementById(id);
async function derive(pw,salt){
  const enc=new TextEncoder();
  const km=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:600000,hash:"SHA-256"},km,{name:"AES-GCM",length:256},false,["decrypt"]);
}
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
if(location.protocol!=="https:"){$("gate").hidden=true;$("wait").hidden=false;}
else $("gate").addEventListener("submit",async e=>{
  e.preventDefault();
  $("err").textContent="";$("unlock").disabled=true;$("unlock").textContent="Wird entschlüsselt …";
  try{
    const r=await fetch("data/analytics.json.enc",{cache:"no-store"});
    if(!r.ok)throw new Error("Daten noch nicht verfügbar");
    const p=await r.json();
    const key=await derive($("pw").value,b64(p.salt));
    const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(p.iv)},key,b64(p.ct));
    render(JSON.parse(new TextDecoder().decode(pt)));
    $("access").hidden=true;$("dash").hidden=false;$("lock").hidden=false;$("pw").value="";drawChart(selectedMetric);
  }catch(_){$("err").textContent="Passwort falsch oder Daten nicht verfügbar. Bitte erneut versuchen.";}finally{$("unlock").disabled=false;$("unlock").innerHTML='Dashboard öffnen <span aria-hidden="true">↗</span>';}
});
const fmt=n=>Number(n||0).toLocaleString('de-DE');
let daily=[];
let selectedMetric='users';
const dateLabel=s=>/^\d{8}$/.test(s)?`${s.slice(6,8)}.${s.slice(4,6)}.${s.slice(0,4)}`:s;
function drawChart(metric){
  selectedMetric=metric;
  document.querySelectorAll('[data-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metric===metric)));
  const label={users:'Aktive Nutzer pro Tag',sessions:'Sitzungen pro Tag',views:'Seitenaufrufe pro Tag'}[metric];
  $('chart-description').textContent=label;
  const W=Math.max(280,Math.round($("chart").getBoundingClientRect().width)||960),H=W<500?220:240,P=36,max=Math.max(3,Math.ceil(Math.max(1,...daily.map(x=>x[metric]))/3)*3);
  $("chart").setAttribute("viewBox",`0 0 ${W} ${H}`);
  const pts=daily.map((x,i)=>[P+i*(W-2*P)/Math.max(1,daily.length-1),H-P-(x[metric]/max)*(H-2*P)]);
  let svg='<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#6aa2fc" stop-opacity=".25"/><stop offset="1" stop-color="#6aa2fc" stop-opacity="0"/></linearGradient></defs>';
  for(let i=0;i<4;i++){const y=P+i*(H-2*P)/3;svg+=`<line x1="${P}" y1="${y}" x2="${W-P}" y2="${y}" stroke="#29496e" stroke-dasharray="3 5"/><text x="0" y="${y+4}" fill="#a5b9d5" font-size="11">${fmt(Math.round(max*(3-i)/3))}</text>`;}
  if(pts.length){const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');svg+=`<path d="${line} L${pts.at(-1)[0]},${H-P} L${pts[0][0]},${H-P} Z" fill="url(#area)"/><path d="${line}" fill="none" stroke="#6aa2fc" stroke-width="3" stroke-linejoin="round"/>`;pts.forEach((p,i)=>{svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="${daily.length<10?4:2}" fill="#a8ccff"><title>${dateLabel(daily[i].date)}: ${fmt(daily[i][metric])}</title></circle>`;});}
  $('chart').innerHTML=svg;$('chart-empty').hidden=daily.length>0;
  $('date-start').textContent=daily.length?dateLabel(daily[0].date):'';$('date-end').textContent=daily.length?dateLabel(daily.at(-1).date):'';
}
function table(id,rows,a,b){
  const t=$(id);t.replaceChildren();const head=t.createTHead().insertRow();[a,b].forEach(s=>{const th=document.createElement('th');th.scope='col';th.textContent=s;head.append(th);});const body=t.createTBody();
  if(!rows.length){const td=body.insertRow().insertCell();td.colSpan=2;td.textContent='Noch keine Messwerte vorhanden.';return;}
  rows.forEach((r,i)=>{const tr=body.insertRow();const cell=tr.insertCell();const rank=document.createElement('span');rank.className='rank';rank.textContent=String(i+1).padStart(2,'0');cell.append(rank,document.createTextNode(r.d[0]||'(nicht zugeordnet)'));tr.insertCell().textContent=fmt(r.m[0]);});
}
function render(d){
  daily=(d.daily||[]).map(r=>({date:r.d[0],users:Number(r.m[0]),sessions:Number(r.m[1]),views:Number(r.m[2])})).sort((a,b)=>a.date.localeCompare(b.date));
  $('kUsers').textContent=fmt(daily.reduce((a,b)=>a+b.users,0));$('kSessions').textContent=fmt(daily.reduce((a,b)=>a+b.sessions,0));$('kViews').textContent=fmt(daily.reduce((a,b)=>a+b.views,0));
  const generated=new Date(d.generated);$('updated').textContent=Number.isNaN(generated.getTime())?'Snapshot-Zeit nicht verfügbar':'Snapshot: '+generated.toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'})+' (Berlin)';
  drawChart(selectedMetric);table('pages',d.pages||[],'Seite','Aufrufe');table('sources',d.sources||[],'Quelle','Sitzungen');
}
document.querySelectorAll('[data-metric]').forEach(b=>b.addEventListener('click',()=>drawChart(b.dataset.metric)));
$('lock').addEventListener('click',()=>{daily=[];$('dash').hidden=true;$('dash').querySelectorAll('table').forEach(t=>t.replaceChildren());$('chart').replaceChildren();['kUsers','kSessions','kViews'].forEach(id=>$(id).textContent='-');$('updated').textContent='';$('access').hidden=false;$('lock').hidden=true;$('pw').value='';$('pw').focus();});

let resizeFrame;window.addEventListener("resize",()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(!$("dash").hidden)drawChart(selectedMetric);});});
