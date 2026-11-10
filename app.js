/* CODEWAY — Korean coding practice PWA. No accounts, ads, energy, or daily caps. */
(() => {
'use strict';
const COURSES = window.CODEWAY_COURSES;
const LESSONS = window.CODEWAY_LESSONS;
const app = document.getElementById('app');
const toastBox = document.getElementById('toast');
const names = Object.keys(COURSES);
const courseLessons = Object.fromEntries(names.map(k => [k, LESSONS.filter(l => l.course === k)]));
const DEFAULT_PLAY = {
  html: '<h1>나의 첫 페이지</h1>\n<p>원하는 HTML을 적어보세요.</p>',
  css: '.card {\n  background: #eceaff;\n  padding: 24px;\n  border-radius: 16px;\n}\nh2 {\n  color: #5e59df;\n}',
  javascript: 'const name = "코딩 친구";\nconsole.log(`안녕, ${name}!`);',
  python: 'name = "코딩 친구"\nprint(f"안녕, {name}!")'
};
const DEFAULT_STATE = {done:{},drafts:{},playDrafts:{},lastCourse:'html',lastLesson:null,activities:{}};
const ui = {page:'home',course:'html',lesson:null,language:'html',hint:false,answer:false,runResult:null,quizSelected:null,busy:false};
function loadState() {
  try { let obj=JSON.parse(localStorage.getItem('codeway_state_v1')||'{}');return {...DEFAULT_STATE,...obj,done:obj.done||{},drafts:obj.drafts||{},playDrafts:obj.playDrafts||{},activities:obj.activities||{}}; }
  catch { return {...DEFAULT_STATE}; }
}
const state = loadState();
let toastTimer;
function save() { try { localStorage.setItem('codeway_state_v1',JSON.stringify(state)); } catch { /* Browsers with restricted storage still allow the current session. */ } }
function E(value) { return String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function today(delta=0) { const d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+delta); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function totalDone() { return Object.keys(state.done).length; }
function courseDone(course) { return courseLessons[course].filter(l=>!!state.done[l.id]).length; }
function xp() { return Object.values(state.done).reduce((v,d)=>v+(d?.type==='quiz'?15:10),0); }
function streak() { let n=0;let off=state.activities[today()]?0:-1;while(state.activities[today(off)]>0){n++;off--;}return n; }
function emojiFor(course) { return COURSES[course].emoji; }
function tint(course) {return ({html:'#fff0e9',css:'#e9f1ff',javascript:'#fff7dd',python:'#f0eaff'})[course];}
function courseVars(course) {return `style="--accent:${COURSES[course].color};--tint:${tint(course)}"`;}
function icon(name) {
 const d={
 home:'<path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-8h6v8"/>',
 terminal:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
 chart:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 17v-4m4 4V8m4 9v-6"/>',
 layers:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h10M7 16h6"/>'};
 return `<svg aria-hidden="true" viewBox="0 0 24 24">${d[name]}</svg>`;
}
function nav(active, desktopOnly=false) {
 return `<nav class="bottom-nav ${desktopOnly?'desktop-only':''}" aria-label="주 메뉴">
 <button class="nav-item ${active==='home'?'active':''}" data-action="nav" data-page="home">${icon('home')}<span>배우기</span></button>
 <button class="nav-item ${active==='playground'?'active':''}" data-action="nav" data-page="playground">${icon('terminal')}<span>연습장</span></button>
 <a class="nav-item" href="./studio.html">${icon('layers')}<span>프로젝트</span></a>
 <button class="nav-item ${active==='progress'?'active':''}" data-action="nav" data-page="progress">${icon('chart')}<span>내 기록</span></button></nav>`;
}
function topbar() {
 return `<header class="topbar"><div class="brand"><div class="brand-mark">{ }</div><span>CODEWAY</span></div>
 <div class="top-right"><div class="metric"><span class="spark">✦</span> ${xp()} XP</div><div class="metric">🔥 ${streak()}일</div></div></header>`;
}
function progressBar(n,total=28) {return `<div class="progress-line"><span style="width:${Math.max(0,Math.min(100,Math.round(n/total*100)))}%"></span></div>`;}
function courseCard(course) {
 const c=COURSES[course], n=courseDone(course);
 return `<button class="course-card" ${courseVars(course)} data-action="course" data-course="${course}">
 <span class="course-logo">${E(c.emoji)}</span><strong>${E(c.name)}</strong><small>${E(c.subtitle)}</small>
 ${progressBar(n)}<span class="progress-meta">${n}/28 단계 완료</span></button>`;
}
function nextUndone(course) {return courseLessons[course].find(l=>!state.done[l.id]) || courseLessons[course][0];}
function resumeLesson() {
 if(state.lastLesson){const found=LESSONS.find(l=>l.id===state.lastLesson);if(found&&!state.done[found.id])return found;}
 return nextUndone(state.lastCourse in COURSES?state.lastCourse:'html');
}
function home() {
 let resume=resumeLesson();
 return `<div class="screen">${topbar()}<main>
  <div class="hero"><div class="eyebrow">LEARN WITHOUT LIMITS</div><h1>코딩 실력,<br>매일 무제한 성장.</h1><p>하트도 기다림도 없이! 내가 원하는 만큼 직접 코드를 쓰면서 배워요.</p>
  <button class="primary" data-action="lesson" data-id="${resume.id}">▶ &nbsp; ${totalDone()?'이어서 배우기':'첫 강의 시작하기'}</button></div>
  <a class="lab-teaser" href="./studio.html"><span class="lab-teaser-icon">✳</span><span><small>NEW · PROJECT LAB</small><strong>튜토리얼은 이제 그만. 직접 만들자.</strong><em>포트폴리오 프로젝트 6개 + 중급·고급 챌린지 14개</em></span><b>↗</b></a>
  <div class="section-head"><h2>배우고 싶은 언어</h2><span class="helper">4개 과정 · 112단계</span></div>
  <div class="cards">${names.map(courseCard).join('')}</div>
  <div class="section-head"><h2>오늘 더 연습하고 싶다면?</h2></div>
  <div class="home-challenges"><button class="callout" style="width:100%;text-align:left" data-action="random"><div class="callout-icon">⚡</div><div class="callout-copy"><strong>랜덤 코딩 챌린지</strong><p>준비된 문제를 마음껏 복습해요. 시도 횟수 제한 0.</p></div><span class="callout-arrow">›</span></button>
  <button class="callout" style="width:100%;text-align:left" data-action="nav" data-page="playground"><div class="callout-icon" style="background:#e8eeff;color:#5e59df">&lt;/&gt;</div><div class="callout-copy"><strong>나만의 코드 실험실</strong><p>문제 없이 자유롭게 코드를 실행해 보세요.</p></div><span class="callout-arrow">›</span></button>
  </div><p class="footer-note">광고 없음 · 일일 학습 제한 없음 · 계정 가입 없음<br>학습 기록은 이 기기에 저장돼요.</p></main></div>${nav('home')}`;
}
function course() {
 const k=ui.course,c=COURSES[k];
 return `<div class="screen"><header class="topbar"><button class="back" data-action="nav" data-page="home">‹ &nbsp;전체 과정</button><div class="metric">${courseDone(k)}/28 완료</div></header><main>
 <div class="course-head" ${courseVars(k)}><span class="course-logo">${E(c.emoji)}</span><div><strong>${E(c.name)}</strong><p>${E(c.subtitle)}</p></div></div>
 <p class="page-subtitle">원하는 강의부터 자유롭게 시작할 수 있어요. 잠겨 있는 단계는 없어요.</p>
 <div class="chapter-grid">${c.chapters.map((ch,i)=>{
  const ls=courseLessons[k].filter(l=>l.chapter===i);
  const count=ls.filter(l=>state.done[l.id]).length;
  return `<section class="chapter"><div class="chapter-head"><span class="chapter-num">${String(i+1).padStart(2,'0')}</span><div><strong>${E(ch)}</strong><p>${count}/7 단계 완료</p></div></div>
   ${ls.map((l,j)=>`<button class="lesson-row" data-action="lesson" data-id="${l.id}"><span class="lesson-symbol ${state.done[l.id]?'done':l.type==='quiz'?'quiz':''}">${state.done[l.id]?'✓':l.type==='quiz'?'★':String(j+1).padStart(2,'0')}</span><strong>${E(l.title)}</strong><span class="chevron">›</span></button>`).join('')}</section>`;
 }).join('')}</div>
 </main></div>${nav('home')}`;
}
function editor(id,value,lang,label='code',height=195) {
 const keys=['Tab','<','>','(',')','{','}','"',"'",':',';','='];
 return `<div class="editor-wrap"><div class="editor-top"><span class="dots"><i></i><i></i><i></i>&nbsp;&nbsp; ${E(label)}</span><span>${E(lang.toUpperCase())}</span></div>
 <textarea class="code-input" id="${id}" data-editor="${id==='lesson-editor'?'lesson':'play'}" aria-label="코드를 입력하는 편집기" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" style="min-height:${height}px">${E(value)}</textarea>
 <div class="keyboard-row">${keys.map((key,i)=>`<button type="button" class="keycap" data-action="insert" data-key="${E(key)}" data-target="${id}" aria-label="${E(key)} 입력">${E(key)}</button>`).join('')}</div></div>`;
}
function lessonTop(l) {
 const all=courseLessons[l.course], idx=all.findIndex(x=>x.id===l.id);
 const percent= idx / all.length*100;
 return `<div class="lesson-top"><button class="close-x" data-action="course" data-course="${l.course}" aria-label="과정으로 돌아가기">×</button><div class="progress-line"><span style="width:${Math.round(percent)}%;background:${COURSES[l.course].color}"></span></div><span class="lesson-count">${idx+1} / 28</span></div>`;
}
function feedback(result) {
 if(!result)return '';
 const isPass=result.type==='pass';
 return `<div id="feedback" class="feedback ${result.type}"><strong>${isPass?'✓ 정답이에요!':result.type==='fail'?'거의 다 왔어요! 다시 시도해 보세요.':'코드를 확인해 보세요.'}</strong><div>${E(result.message||'')}</div>${result.output!==undefined?`<pre>${E(result.output||'(출력 없음)')}</pre>`:''}
 ${isPass?`<div class="finish-actions"><button class="outline" data-action="retry">다시 풀기</button><button class="primary" data-action="next">다음 강의 →</button></div>`:''}</div>`;
}
function lesson() {
 const l=ui.lesson, code=state.drafts[l.id]??l.starter;
 const done=!!state.done[l.id];
 if(l.type==='quiz'){
  const selected=ui.quizSelected;
  const correct=selected===l.correct;
  return `${lessonTop(l)}<div class="lesson-screen"><span class="pill">★ 단원 마무리</span><h1 class="lesson-heading">${E(l.title)}</h1>
   <div class="lesson-explain">여기까지 배운 내용을 확인해 봐요. 틀려도 다시 고를 수 있어요.</div>
   <p class="quiz-question">${E(l.question)}</p><div class="quiz-options">${l.options.map((o,i)=>`<button class="quiz-option ${selected===i?(correct?'correct':'incorrect'):''}" data-action="quiz-select" data-choice="${i}"><span class="opt-letter">${'ABCD'[i]}</span>${E(o)}</button>`).join('')}</div>
   ${selected!==null?feedback(correct?{type:'pass',message:l.explain}:{type:'fail',message:'다른 선택지를 골라보세요. 힌트: 앞에서 배운 개념을 생각해 보세요.'}):done?'<p class="mini-text">이미 완료한 퀴즈예요. 언제든 다시 풀 수 있어요.</p>':''}</div>${nav('home',true)}`;
 }
 return `${lessonTop(l)}<div class="lesson-screen"><div class="lesson-grid"><section class="lesson-guide"><span class="pill">${E(COURSES[l.course].name)} · 직접 코딩하기</span><h1 class="lesson-heading">${E(l.title)}</h1>
 <div class="lesson-explain">${E(l.explain)}</div>
 <div class="lesson-subhead">이렇게 쓰는 거예요 <span class="mini-text">예시 코드</span></div><pre class="sample">${E(l.example)}</pre>
 <div class="task-box"><div class="task-label">YOUR MISSION</div><p>${E(l.task)}</p></div></section>
 <section class="lesson-workspace"><div class="lesson-subhead">내 코드 <span class="mini-text">직접 수정할 수 있어요</span></div>${editor('lesson-editor',code,l.course,`lesson_${l.id}.code`,190)}
 <div class="editor-tools"><button class="outline" data-action="toggle-hint">${ui.hint?'힌트 숨기기':'💡 힌트'}</button><button class="outline" data-action="toggle-answer">${ui.answer?'정답 숨기기':'정답 보기'}</button><button class="outline" data-action="reset-lesson">초기화</button></div>
 ${ui.hint?`<div class="hint">💡 ${E(l.hint)}</div>`:''}${ui.answer?`<div class="answer">${E(l.solution)}</div><button class="secondary" style="margin-top:8px" data-action="fill-answer">정답을 편집기에 넣기</button>`:''}
 ${l.course==='python'?'<div class="mini-text" style="margin-top:12px">Python 실행에는 첫 실행 시 인터넷 연결이 필요해요.</div>':''}
 <div class="run-bar"><button id="run-button" class="primary large" data-action="run-lesson" ${ui.busy?'disabled':''}>${ui.busy?'<span class="loading-spinner"></span> 실행 중...':'▶ &nbsp; 코드 실행하고 확인하기'}</button></div>
 ${feedback(ui.runResult)}
 <div id="preview-slot"></div>
 ${done&&!ui.runResult?'<div class="info-note">✓ 이 단계는 이미 완료했어요. 코드를 수정해 다시 연습해도 돼요.</div>':''}
 </section></div></div>${nav('home',true)}`;
}
function playground() {
 const lang=ui.language, code=state.playDrafts[lang]??DEFAULT_PLAY[lang];
 return `<div class="screen">${topbar()}<main><h1 class="page-title">코드 실험실</h1><p class="page-subtitle">틀려도 괜찮아요. 직접 만들어 보고 무제한으로 실행해요.</p>
 <div class="playground-intro"><h2>자유롭게 코딩해 봐요 ✨</h2><p>정해진 정답 없이 코드를 실행할 수 있어요. HTML/CSS는 화면 미리보기, JavaScript/Python은 출력 결과를 확인해요.</p></div>
 <div class="playground-workspace"><section class="playground-code"><div class="lang-tabs">${names.map(k=>`<button class="lang-tab ${k===lang?'active':''}" data-action="play-lang" data-lang="${k}">${E(COURSES[k].name)}</button>`).join('')}</div>
 ${editor('play-editor',code,lang,'my_practice.code',290)}
 <div class="editor-tools"><button class="outline" data-action="reset-play">예시로 초기화</button><button class="outline" data-action="copy-play">코드 복사</button></div>
 ${lang==='python'?'<p class="mini-text">Python 실행은 인터넷에서 무료 오픈소스 Pyodide 엔진을 불러와요. 첫 실행 시 데이터가 사용돼요.</p>':''}
 <div class="run-bar"><button id="run-button" class="primary large" data-action="run-play" ${ui.busy?'disabled':''}>${ui.busy?'<span class="loading-spinner"></span> 실행 중...':'▶ &nbsp; 실행하기'}</button></div>
 </section><section class="playground-results"><div class="result-title">실행 결과 <span class="mini-text">코드를 실행하면 여기에 표시돼요</span></div>${feedback(ui.runResult)}<div id="preview-slot"></div>${!ui.runResult?'<div class="result-empty"><span>⌘</span><strong>결과를 확인할 준비가 됐어요</strong><p>왼쪽 편집기에 코드를 입력하고 실행 버튼을 눌러 보세요.</p></div>':''}</section></div>
 <p class="footer-note">작성한 코드는 이 브라우저에만 저장돼요. 서버로 업로드하지 않아요.</p>
 </main></div>${nav('playground')}`;
}
function progress() {
 const days=Array.from({length:7},(_,i)=>({date:today(i-6),count:state.activities[today(i-6)]||0}));
 const m=Math.max(1,...days.map(d=>d.count));
 return `<div class="screen">${topbar()}<main><h1 class="page-title">나의 성장 기록</h1><p class="page-subtitle">작은 한 줄의 코드가 쌓여 실력이 돼요.</p>
  <div class="record-banner"><div><div class="eyebrow" style="color:#aaaaf5">YOUR CODING JOURNEY</div><h2>LEVEL ${Math.floor(xp()/100)+1}</h2><p>계속 배우는 것 자체가 최고의 성과예요.</p></div><div class="record-star">✦</div></div>
  <div class="stats-grid"><div class="stat-tile"><strong>${totalDone()} <span style="font-size:14px">/ 112</span></strong><p>완료한 학습 단계</p></div><div class="stat-tile"><strong>${xp()} XP</strong><p>획득 경험치</p></div><div class="stat-tile"><strong>${streak()}일</strong><p>연속 학습 기록</p></div><div class="stat-tile"><strong>${names.filter(k=>courseDone(k)===28).length} / 4</strong><p>완료한 과정</p></div></div>
  <div class="section-head"><h2>최근 7일 활동</h2><span class="helper">완료한 단계 수</span></div>
  <div class="stat-tile"><div class="activity">${days.map(d=>`<div class="day"><div class="bar-track"><div class="bar-fill" style="height:${d.count?Math.max(9,d.count/m*100):0}%"></div></div><span>${new Date(d.date+'T12:00:00').toLocaleDateString('ko-KR',{weekday:'short'})}</span></div>`).join('')}</div></div>
  <div class="section-head"><h2>과정별 진도</h2></div>
  ${names.map(k=>`<button class="course-progress-row" style="width:100%;text-align:left" data-action="course" data-course="${k}"><div class="line"><span>${E(COURSES[k].name)}</span><small>${courseDone(k)}/28</small></div><div ${courseVars(k)}>${progressBar(courseDone(k))}</div></button>`).join('')}
  <div class="info-note">진도는 지금 사용하는 브라우저에 저장돼요. 앱을 삭제하거나 브라우저의 웹사이트 데이터를 지우면 기록이 사라질 수 있어요.</div>
  <div class="editor-tools"><button class="outline" data-action="export-progress">내 기록 백업 파일 저장</button><button class="outline" data-action="import-progress">백업 가져오기</button><input id="import-file" type="file" accept="application/json,.json" hidden></div>
  </main></div>${nav('progress')}`;
}
function render(keepScroll=false) {
 const y=window.scrollY;
 app.innerHTML=ui.page==='home'?home():ui.page==='course'?course():ui.page==='lesson'?lesson():ui.page==='playground'?playground():progress();
 if(keepScroll)window.scrollTo(0,y);else window.scrollTo(0,0);
}
function notify(message) {
 clearTimeout(toastTimer);toastBox.textContent=message;toastBox.classList.add('show');toastTimer=setTimeout(()=>toastBox.classList.remove('show'),2900);
}
function go(page) {ui.page=page;ui.runResult=null;ui.hint=false;ui.answer=false;ui.quizSelected=null;ui.busy=false;render();}
function openCourse(k) {if(!(k in COURSES))return;ui.course=k;state.lastCourse=k;save();go('course');}
function openLesson(id) {
 const l=LESSONS.find(x=>x.id===id);if(!l)return;
 ui.lesson=l;ui.course=l.course;state.lastCourse=l.course;state.lastLesson=id;save();go('lesson');
}
function randomLesson() {
 // Completed lessons first when available, then all challenges. All are always unlocked.
 const finished=LESSONS.filter(l=>l.type==='code'&&state.done[l.id]);
 const pool=finished.length?finished:LESSONS.filter(l=>l.type==='code');
 openLesson(pool[Math.floor(Math.random()*pool.length)].id);
}
function complete(l) {
 if(state.done[l.id])return false;
 state.done[l.id]={at:new Date().toISOString(),type:l.type};
 state.activities[today()]=(state.activities[today()]||0)+1;
 save();return true;
}
function norm(s) {return String(s??'').replace(/\r\n?/g,'\n').trim();}
function checkPatterns(code,l) {
 const misses=(l.patterns||[]).filter(p=>{try{return !new RegExp(p,'i').test(code);}catch{return true;}});
 if(misses.length===0)return {type:'pass',message:'필요한 태그/스타일을 모두 찾았어요. 직접 만든 결과를 확인하세요!'};
 return {type:'fail',message:`미션에 필요한 코드가 아직 ${misses.length}개 부족해요. 설명과 힌트를 참고해서 다시 시도해 보세요.`};
}
function showPreview(lang,code,markup) {
 const el=document.getElementById('preview-slot');if(!el)return;
 let srcdoc='';
 if(lang==='html') srcdoc=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;padding:16px;color:#283044}button{padding:8px 14px}</style></head><body>${code}</body></html>`;
 else srcdoc=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;padding:15px;color:#283044}.card{box-sizing:border-box;max-width:100%}button{background:#e2e5fb;border:none;border-radius:7px;padding:8px 12px}${code}</style></head><body>${markup||'<div class="card"><h2>미리보기 카드</h2><p class="note">CSS를 바꿔보세요!</p><button>클릭</button></div>'}</body></html>`;
 // Sandboxed document cannot access CODEWAY storage or parent document.
 el.innerHTML='<div class="lesson-subhead">👀 화면 미리보기</div><iframe title="코드 실행 미리보기" class="preview" sandbox="allow-scripts"></iframe>';
 el.querySelector('iframe').srcdoc=srcdoc;
}
function runJavaScript(code) {
 const workerSrc=`self.onmessage=e=>{let lines=[];const fmt=v=>{if(typeof v==='object')try{return JSON.stringify(v)}catch(_){};return String(v)};const log={log:(...args)=>lines.push(args.map(fmt).join(' ')),error:(...args)=>lines.push(args.map(fmt).join(' ')),warn:(...args)=>lines.push(args.map(fmt).join(' '))};try{new Function('console',e.data)(log);self.postMessage({output:lines.join('\\n')})}catch(err){self.postMessage({output:lines.join('\\n'),error:String(err)})}}`;
 return new Promise(resolve=>{
  let worker,timer;try{worker=new Worker(URL.createObjectURL(new Blob([workerSrc],{type:'text/javascript'})));}catch(err){resolve({error:'이 브라우저에서는 코드 실행을 시작할 수 없어요: '+err.message});return;}
  let settled=false;const done=r=>{if(settled)return;settled=true;clearTimeout(timer);worker.terminate();resolve(r)};
  worker.onmessage=e=>done(e.data);worker.onerror=e=>done({error:e.message||'실행 오류'});timer=setTimeout(()=>done({error:'실행 시간이 3초를 넘었어요. 무한 반복문이 있는지 확인하세요.'}),3000);worker.postMessage(code);
 });
}
let pyWorker=null, pyReady=false, pyPending=null, pySeq=0;
function pythonWorker() {
 const source=`let py=null;self.onmessage=async e=>{const id=e.data.id,code=e.data.code;let output=[];try{if(!py){importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});}py.setStdout({batched:s=>output.push(s)});py.setStderr({batched:s=>output.push(s)});await py.runPythonAsync(code);self.postMessage({id,output:output.join('\\n'),ready:true});}catch(error){self.postMessage({id,output:output.join('\\n'),error:String(error),ready:!!py});}}`;
 const blob=new Blob([source],{type:'text/javascript'});
 const url=URL.createObjectURL(blob);const w=new Worker(url);URL.revokeObjectURL(url);return w;
}
function runPython(code) {
 return new Promise(resolve=>{
  if(!navigator.onLine&&!pyReady){resolve({error:'Python 실행에는 인터넷 연결이 필요해요. Wi-Fi 또는 데이터를 연결한 후 다시 시도해 주세요.'});return;}
  if(!pyWorker){try{pyWorker=pythonWorker();}catch(err){resolve({error:'Python 엔진 시작 실패: '+String(err)});return;}}
  const id=++pySeq;let settled=false;
  let timer;const finish=(obj,reset=false)=>{if(settled)return;settled=true;clearTimeout(timer);pyPending=null;if(reset){pyWorker?.terminate();pyWorker=null;pyReady=false;}resolve(obj);};
  pyPending={id};
  pyWorker.onmessage=e=>{if(e.data.id!==id)return;pyReady=e.data.ready;finish(e.data);};
  pyWorker.onerror=e=>finish({error:'Python 엔진을 불러오지 못했어요. 인터넷 연결을 확인해 주세요. '+(e.message||'')},true);
  timer=setTimeout(()=>finish({error:pyReady?'실행 시간이 길어 중단했어요. 반복문을 확인하세요.':'Python 실행 엔진 다운로드에 실패하거나 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도하세요.'},true),pyReady?7500:45000);
  pyWorker.postMessage({id,code});
 });
}
function setBusy(on){ui.busy=on;const b=document.getElementById('run-button');if(b){b.disabled=on;b.innerHTML=on?'<span class="loading-spinner"></span> 실행 중...':'▶ &nbsp; 코드 실행하고 확인하기';}}
function editorCode(which){const e=document.getElementById(which==='lesson'?'lesson-editor':'play-editor');return e?e.value:'';}
async function runLesson() {
 if(ui.busy)return;const l=ui.lesson;const code=editorCode('lesson');state.drafts[l.id]=code;save();ui.runResult=null;setBusy(true);
 let result;
 if(l.course==='html'||l.course==='css'){
  result=checkPatterns(code,l);
 }else{
  const execution=await(l.course==='javascript'?runJavaScript(code):runPython(code));
  if(execution.error)result={type:'error',message:execution.error,output:execution.output};
  else{const passed=norm(execution.output)===norm(l.expected);result={type:passed?'pass':'fail',message:passed?'출력 결과가 정확해요!':`목표 출력: ${l.expected.replace(/\n/g,' / ')}\n현재 출력을 비교해 보세요.`,output:execution.output};}
 }
 ui.runResult=result;if(result.type==='pass'){if(complete(l))notify('+10 XP! 단계 완료 🎉');}
 setBusy(false);render(true);
 if(l.course==='html'||l.course==='css')showPreview(l.course,code,l.preview);
 if(result.type==='pass')setTimeout(()=>document.getElementById('feedback')?.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
}
async function runPlay() {
 if(ui.busy)return;const lang=ui.language,code=editorCode('play');state.playDrafts[lang]=code;save();ui.runResult=null;setBusy(true);
 let result=null;
 if(lang==='html'||lang==='css'){result={type:'pass',message:'미리보기를 만들었어요. 원하는 만큼 수정해 보세요!'};}
 else{const out=await(lang==='javascript'?runJavaScript(code):runPython(code));result={type:out.error?'error':'pass',message:out.error||'실행이 끝났어요.',output:out.output};}
 ui.runResult=result;setBusy(false);render(true);
 if(lang==='html'||lang==='css')showPreview(lang,code);
}
function nextLesson() {
 const l=ui.lesson,ls=courseLessons[l.course],i=ls.findIndex(x=>x.id===l.id);
 if(i<ls.length-1)openLesson(ls[i+1].id);
 else {notify('과정을 끝까지 살펴봤어요! 다른 언어도 배워보세요.');openCourse(l.course);}
}
function insertAtCursor(input,text){
 const a=input.selectionStart,b=input.selectionEnd;
 input.value=input.value.slice(0,a)+text+input.value.slice(b);
 input.selectionStart=input.selectionEnd=a+text.length;
 input.focus();input.dispatchEvent(new Event('input',{bubbles:true}));
}
function exportProgress(){
 const data=JSON.stringify({app:'codeway',version:1,exportedAt:new Date().toISOString(),state},null,2);
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='codeway-progress.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('학습 기록 백업 파일을 만들었어요.');
}
async function importProgress(file){
 if(!file)return;
 try{const data=JSON.parse(await file.text());if(data.app!=='codeway'||!data.state?.done||!data.state?.drafts)throw Error('CODEWAY 백업 파일이 아니에요.');
  if(!confirm('현재 학습 기록을 이 백업 기록으로 바꿀까요?'))return;
  for(const k of ['done','drafts','playDrafts','lastCourse','lastLesson','activities'])if(data.state[k]!==undefined)state[k]=data.state[k];
  save();render();notify('학습 기록을 복구했어요.');
 }catch(err){notify('가져오기 실패: '+err.message);}
}
app.addEventListener('input',e=>{
 if(e.target?.id==='lesson-editor'&&ui.lesson){state.drafts[ui.lesson.id]=e.target.value;save();}
 if(e.target?.id==='play-editor'){state.playDrafts[ui.language]=e.target.value;save();}
});
app.addEventListener('keydown',e=>{
 if(e.target?.matches('.code-input')&&e.key==='Tab'){e.preventDefault();insertAtCursor(e.target,'  ');}
});
app.addEventListener('change',e=>{if(e.target?.id==='import-file')importProgress(e.target.files?.[0]);});
app.addEventListener('click',async e=>{
 const target=e.target.closest('[data-action]');if(!target)return;
 const action=target.dataset.action;
 if(ui.busy&&['nav','course','lesson','next','play-lang','random','quiz-select'].includes(action)){notify('코드 실행을 마친 뒤 이동할 수 있어요.');return;}
 switch(action){
  case 'nav':go(target.dataset.page);break;
  case 'course':openCourse(target.dataset.course);break;
  case 'lesson':openLesson(target.dataset.id);break;
  case 'random':randomLesson();break;
  case 'next':nextLesson();break;
  case 'toggle-hint':ui.hint=!ui.hint;render(true);break;
  case 'toggle-answer':ui.answer=!ui.answer;render(true);break;
  case 'reset-lesson':if(ui.lesson){delete state.drafts[ui.lesson.id];save();ui.runResult=null;render(true);}break;
  case 'fill-answer':if(ui.lesson){state.drafts[ui.lesson.id]=ui.lesson.solution;save();ui.runResult=null;render(true);notify('정답 코드를 채웠어요. 직접 실행해 보세요.');}break;
  case 'retry':ui.runResult=null;ui.quizSelected=null;render(true);break;
  case 'run-lesson':await runLesson();break;
  case 'play-lang':ui.language=target.dataset.lang;ui.runResult=null;go('playground');break;
  case 'run-play':await runPlay();break;
  case 'reset-play':delete state.playDrafts[ui.language];save();ui.runResult=null;render(true);break;
  case 'copy-play':try{await navigator.clipboard.writeText(editorCode('play'));notify('코드를 복사했어요.');}catch{notify('복사 권한을 확인해 주세요.');}break;
  case 'insert':{
   const input=document.getElementById(target.dataset.target);if(!input)return;
   const key=target.dataset.key;insertAtCursor(input,key==='Tab'?'  ':key);break;
  }
  case 'quiz-select':{
   if(!ui.lesson||ui.lesson.type!=='quiz')return;
   ui.quizSelected=Number(target.dataset.choice);
   if(ui.quizSelected===ui.lesson.correct){if(complete(ui.lesson))notify('+15 XP! 퀴즈 통과 🎉');}
   render(true);break;
  }
  case 'export-progress':exportProgress();break;
  case 'import-progress':document.getElementById('import-file')?.click();break;
 }
});
render();
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=4.0.0', {updateViaCache:'none'}).catch(()=>{}));
}
})();
