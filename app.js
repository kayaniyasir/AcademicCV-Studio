'use strict';
const KEY='academiccv-studio-v1', $=s=>document.querySelector(s), form=$('#cvForm');
const fields=['fullName','jobTitle','email','phone','location','website','summary','skills','subjects','certifications','awards','activities','languages'];
const state={profile:{},experience:[],education:[],template:'classic'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=x=>String(x||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const notice=x=>{$('#status').textContent=x};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notice('Browser storage is unavailable. Export your profile JSON.')}}
function fill(){fields.forEach(k=>form.elements.namedItem(k).value=state.profile[k]||'');document.querySelectorAll('[data-template]').forEach(b=>{const on=b.dataset.template===state.template;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});render()}
function collect(){fields.forEach(k=>state.profile[k]=form.elements.namedItem(k).value);save();render()}
function section(title,html){return html?'<section class="cv-section"><h3>'+esc(title)+'</h3>'+html+'</section>':''}
function render(){const p=state.profile, li=x=>'<ul>'+lines(x).map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>';
const exp=state.experience.map(e=>'<div class="cv-item"><b>'+esc(e.role||'Teacher')+'</b> · '+esc(e.school||'')+'<small>'+esc(e.dates||'')+'</small>'+li(e.highlights)+'</div>').join('');
const edu=state.education.map(e=>'<div class="cv-item"><b>'+esc(e.degree)+'</b> · '+esc(e.school)+'<small>'+esc(e.dates||'')+'</small></div>').join('');
const sections=[['Profile',p.summary?'<p>'+esc(p.summary)+'</p>':''],['Teaching Experience',exp],['Education',edu],['Subjects & Grade Levels',p.subjects?'<p>'+esc(p.subjects)+'</p>':''],['Teaching Skills',p.skills?'<p>'+esc(p.skills)+'</p>':''],['Certifications & Development',lines(p.certifications).length?li(p.certifications):''],['Awards',lines(p.awards).length?li(p.awards):''],['Leadership & Activities',lines(p.activities).length?li(p.activities):''],['Languages',p.languages?'<p>'+esc(p.languages)+'</p>':'']];
const order=state.template==='leadership'?[0,7,1,2,3,4,5,6,8]:[0,1,2,3,4,5,6,7,8];
const contact=[p.email,p.phone,p.location,p.website].filter(Boolean).map(esc).join(' · ');
const pv=$('#cvPreview');pv.className='cv-page '+state.template;pv.innerHTML='<div class="cv-head"><h2 class="cv-name">'+esc(p.fullName||'Your Name')+'</h2><div class="cv-role">'+esc(p.jobTitle||'Teaching Professional')+'</div><p class="cv-contact">'+contact+'</p></div>'+order.map(i=>section(...sections[i])).join('');
updateTeacherChecklist();for(const kind of ['experience','education']){const out=$('#'+kind+'Entries');out.replaceChildren();state[kind].forEach((row,i)=>{const e=document.createElement('div');e.className='entry';const label=document.createElement('span');label.textContent=Object.values(row).slice(0,2).join(' · ');const b=document.createElement('button');b.type='button';b.textContent='Remove';b.onclick=()=>{state[kind].splice(i,1);save();render()};e.append(label,b);out.append(e)})}}
function updateTeacherChecklist(){
 const p=state.profile;
 const checks=[
 ['Full name',Boolean(p.fullName?.trim())],
 ['School teaching experience',state.experience.some(x=>x.role?.trim()&&x.school?.trim())],
 ['Qualifications',state.education.some(x=>x.degree?.trim()&&x.school?.trim())],
 ['Subjects and grade levels',Boolean(p.subjects?.trim())],
 ['Teaching competencies',Boolean(p.skills?.trim())],
 ['Professional development / certifications',Boolean(p.certifications?.trim())],
 ['Professional summary',Boolean(p.summary?.trim())]
 ];
 const el=$('#teacherChecklist');if(!el)return;
 el.replaceChildren();const count=checks.filter(x=>x[1]).length;
 const heading=document.createElement('p');heading.className='checklist-count';heading.textContent=count+' of '+checks.length+' suggested sections completed';el.append(heading);
 for(const [label,ok] of checks){const row=document.createElement('div');row.className='check-row';const mark=document.createElement('span');mark.className=ok?'check-done':'check-missing';mark.textContent=ok?'✓':'○';const name=document.createElement('span');name.textContent=label;row.append(mark,name);el.append(row)}
}
form.addEventListener('input',collect);
function add(kind,fieldsMap){const row={};for(const [k,id] of Object.entries(fieldsMap))row[k]=$('#'+id).value.trim();if(!Object.values(row).some(Boolean)){notice('Enter some information before adding.');return}state[kind].push(row);for(const id of Object.values(fieldsMap))$('#'+id).value='';save();render();notice('Item added.')}
$('#addExperience').onclick=()=>add('experience',{role:'expRole',school:'expSchool',dates:'expDates',highlights:'expHighlights'});
$('#addEducation').onclick=()=>add('education',{degree:'eduDegree',school:'eduSchool',dates:'eduDates'});
$('#templates').onclick=e=>{const b=e.target.closest('[data-template]');if(b){state.template=b.dataset.template;save();fill()}};
$('#save').onclick=()=>{collect();notice('Saved locally in this browser.')};
$('#reset').onclick=()=>{if(!confirm('Clear your locally saved CV?'))return;state.profile={};state.education=[];state.experience=[];state.template='classic';form.reset();save();fill();notice('Profile cleared.')};
$('#print').onclick=()=>{collect();window.print()};
function download(blob,name){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),5000)}
$('#downloadData').onclick=()=>{collect();download(new Blob([JSON.stringify({version:1,...state},null,2)],{type:'application/json'}),'academiccv-profile.json')};
$('#importData').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1e6)throw Error('JSON exceeds 1 MB');const obj=JSON.parse(await f.text());if(obj.version!==1||!obj.profile)throw Error('Not a valid profile');state.profile=Object.fromEntries(fields.map(k=>[k,String(obj.profile[k]||'').slice(0,2600)]));state.experience=Array.isArray(obj.experience)?obj.experience.slice(0,50):[];state.education=Array.isArray(obj.education)?obj.education.slice(0,50):[];state.template=['classic','modern','minimal','leadership'].includes(obj.template)?obj.template:'classic';save();fill();notice('Profile loaded.')}catch(err){notice(err.message)}finally{e.target.value=''}};
try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&data.profile){state.profile=data.profile;state.education=Array.isArray(data.education)?data.education:[];state.experience=Array.isArray(data.experience)?data.experience:[];state.template=['classic','modern','minimal','leadership'].includes(data.template)?data.template:'classic'}}catch(e){}
fill();
window.AcademicCV={state,fill,collect,download,notice};
