'use strict';
const imp=document.querySelector('#importDocument'), review=document.querySelector('#importReview'), info=document.querySelector('#importStatus');
const setMessage=x=>{info.textContent=x};
const pick=(text,pattern)=>{const m=text.match(pattern);return m?m[1].trim():''};
function parseCV(text){const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),email=pick(text,/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i),phone=pick(text,/(\+?\d[\d\s()-]{7,}\d)/),head=lines.slice(0,6),name=head.find(l=>l.length>5&&l.length<90&&!l.includes('@')&&!/curriculum|resume|contact|profile|education|experience/i.test(l))||'',summarySection=text.match(/(?:Professional Summary|Profile|About Me|Objective)\s*:?\s*([\s\S]{0,900}?)(?=\n(?:Experience|Education|Skills|Qualifications|Employment|Teaching Experience)\b|$)/i);
const scan=(start,end)=>{const p=new RegExp('(?:^|\\n)'+start+'\\s*:?\\s*([\\s\\S]*?)(?=\\n(?:'+end+')\\b|$)','i');return pick(text,p).slice(0,1800)};
return {name,email,phone,title:head.find(x=>/teacher|educator|principal|lecturer|instructor/i.test(x))||'',summary:(summarySection?.[1]||'').trim().slice(0,1200),experience:scan('(?:Teaching )?Experience|Employment History','Education|Skills|Awards|Certifications|Languages|References'),education:scan('Education|Qualifications','Skills|Experience|Awards|Certifications|Languages|References'),skills:scan('Skills|Competencies','Education|Experience|Awards|Certifications|Languages|References').replace(/\n/g,', ')};
}
function assignReview(data,text){for(const [key,id] of Object.entries({name:'reviewName',title:'reviewTitle',email:'reviewEmail',phone:'reviewPhone',summary:'reviewSummary',experience:'reviewExperience',education:'reviewEducation',skills:'reviewSkills'}))document.getElementById(id).value=data[key]||'';document.getElementById('extractedText').value=text;review.hidden=false;setMessage('Text extracted. Review and correct each proposed field before applying.');review.scrollIntoView({behavior:'smooth',block:'center'});}
imp.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;review.hidden=true;setMessage('Reading document locally...');try{if(f.size>10_000_000)throw Error('File exceeds 10 MB');const ext=f.name.split('.').pop().toLowerCase();let text='';
if(ext==='pdf'){if(!window.pdfjsLib)throw Error('PDF library did not load; connect to the internet and retry.');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;for(let i=1;i<=Math.min(pdf.numPages,40);i++){const page=await pdf.getPage(i),data=await page.getTextContent();text+='\n'+data.items.map(item=>item.str).join(' ')}}
else if(ext==='docx'){if(!window.mammoth)throw Error('DOCX extraction library did not load; connect to the internet.');const parsed=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});text=parsed.value||''}
else throw Error('Choose a PDF or DOCX file.');
if(text.trim().length<25)throw Error('Too little readable text. Scanned PDFs need OCR; please enter details manually.');assignReview(parseCV(text),text)}
catch(err){setMessage(err.message||'Unable to import this document.')}finally{e.target.value=''}});
document.querySelector('#discardImport').onclick=()=>{review.hidden=true;setMessage('Import discarded; existing CV unchanged.')};
document.querySelector('#applyImport').onclick=()=>{const app=window.AcademicCV;if(!app)return;const p=app.state.profile;
const entries={fullName:'reviewName',jobTitle:'reviewTitle',email:'reviewEmail',phone:'reviewPhone',summary:'reviewSummary',skills:'reviewSkills'};for(const [k,id] of Object.entries(entries)){const v=document.getElementById(id).value.trim();if(v)p[k]=v}
const exp=document.getElementById('reviewExperience').value.trim();if(exp)app.state.experience.push({role:'Teaching experience (review details)',school:'',dates:'',highlights:exp});
const edu=document.getElementById('reviewEducation').value.trim();if(edu)app.state.education.push({degree:edu.slice(0,100),school:'',dates:''});
app.fill();app.collect();review.hidden=true;setMessage('Reviewed information applied. Please verify the CV preview.');};
document.querySelector('#exportWord').onclick=async()=>{const app=window.AcademicCV;app.collect();if(!window.docx){app.notice('Word export library unavailable. Connect to the internet and retry.');return}
try{const {Document,Paragraph,TextRun,HeadingLevel,Packer}=docx,p=app.state.profile;
const nodes=[],line=(text,bold=false)=>new Paragraph({children:[new TextRun({text:String(text||''),bold})],spacing:{after:100}}),header=text=>new Paragraph({text,heading:HeadingLevel.HEADING_2,spacing:{before:260,after:90}});
nodes.push(new Paragraph({text:p.fullName||'Your Name',heading:HeadingLevel.TITLE}),line(p.jobTitle||'Teaching Professional'),line([p.email,p.phone,p.location,p.website].filter(Boolean).join(' | ')));
function block(title,body){if(!body)return;nodes.push(header(title));if(typeof body==='string')body.split(/\r?\n/).filter(Boolean).forEach(x=>nodes.push(line(x)));else body.forEach(x=>nodes.push(line(x)))}
block('Professional Summary',p.summary);
block('Teaching Experience',app.state.experience.map(x=>[x.role,x.school,x.dates].filter(Boolean).join(' | ')+'\n'+(x.highlights||'')));
block('Education',app.state.education.map(x=>[x.degree,x.school,x.dates].filter(Boolean).join(' | ')));
block('Subjects & Grade Levels',p.subjects);block('Teaching Skills',p.skills);block('Certifications & Development',p.certifications);block('Awards',p.awards);block('Leadership & Activities',p.activities);block('Languages',p.languages);
const doc=new Document({sections:[{properties:{},children:nodes}]}),blob=await Packer.toBlob(doc);app.download(blob,'academiccv-teacher-cv.docx');app.notice('Editable Word document downloaded. Check pagination in Word.')}
catch(err){app.notice('Word export failed: '+err.message)}};
