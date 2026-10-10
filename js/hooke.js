window.Hooke = (() => {
  let state;
  function render(targetId) {
    state={k:50,force:8};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Механика / Упругость</div><h1>Закон Гука</h1><p class="page-subtitle">Изучите деформацию пружины и связь силы с её растяжением.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Симуляция пружины</div><span class="badge">ГОТОВО</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="hookeCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / ПРУЖИНА</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Сила / Деформация</div></div><div class="panel-body"><div class="canvas-wrap"><canvas id="hookeChart" width="900" height="250"></canvas></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("hookeK","Жёсткость пружины",10,120,1,50,"Н/м")}
              ${range("hookeF","Сила",0,20,.1,8,"Н")}
              <div class="button-row"><button class="btn btn-primary" id="runH">РАССЧИТАТЬ</button><button class="btn" id="resetH">СБРОС</button></div>
              <button class="btn" id="saveH">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Результат</div></div><div class="panel-body"><div class="metric-grid">
              ${metric("Жёсткость","hk")}${metric("Сила","hf")}${metric("Растяжение","hx")}${metric("Потенциальная энергия","he")}
            </div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body"><div class="formula">F = kx</div><div class="formula">x = F / k</div><div class="formula">E = ½kx²</div><p class="explanation">Чем больше сила или меньше жёсткость пружины, тем больше её удлинение.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>ЗАКОН ГУКА / МЕХАНИКА</span><span>МОДЕЛЬ: ЛИНЕЙНАЯ УПРУГОСТЬ</span></div>
      </section>`;
    ["hookeK","hookeF"].forEach(id=>{const a=document.getElementById(id),b=document.getElementById(id+"Value"),key={hookeK:"k",hookeF:"force"}[id];const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;update();draw();chart()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value));});
    document.getElementById("runH").addEventListener("click",()=>{update();draw();chart();LabApp.showToast("Расчёт выполнен")});
    document.getElementById("resetH").addEventListener("click",()=>{state={k:50,force:8};["hookeK","hookeF"].forEach((id,i)=>{const v=i?8:50;document.getElementById(id).value=v;document.getElementById(id+"Value").value=v});update();draw();chart()});
    document.getElementById("saveH").addEventListener("click",save);
    update();draw();chart();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function extension(){return state.force/state.k}
  function update(){const x=extension(),e=.5*state.k*x*x;set("hk",state.k.toFixed(1)+" Н/м");set("hf",state.force.toFixed(2)+" Н");set("hx",(x*100).toFixed(2)+" см");set("he",e.toFixed(3)+" Дж")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("hookeCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const top=70,base=top+170,x=450,x2=450+Math.min(250,extension()*500);ctx.strokeStyle="#485966";ctx.beginPath();ctx.moveTo(x-50,top);ctx.lineTo(x+50,top);ctx.stroke();spring(ctx,x,top,x2,base);ctx.fillStyle="#39d5e7";ctx.beginPath();ctx.arc(x2,base,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#65727e";ctx.font="10px DM Mono,monospace";ctx.fillText(`Δx = ${(extension()*100).toFixed(2)} см`,x2+28,base);ctx.fillText(`F = ${state.force.toFixed(2)} Н`,x2+28,base+18)}
  function spring(ctx,x,top,x2,base){const end=base-60;ctx.strokeStyle="#8a99a5";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,end);const coils=9,len=(end-top)/coils;for(let i=0;i<coils;i++){ctx.lineTo(x+(i%2?18:-18),top+len*(i+.5));ctx.lineTo(x+(i%2?-18:18),top+len*(i+1));}ctx.lineTo(x2,base);ctx.stroke()}
  function chart(){const c=document.getElementById("hookeChart"),ctx=c.getContext("2d"),w=c.width,h=c.height,l=55,r=18,t=18,b=34;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("F (Н)",10,14);ctx.fillText("x (см)",w-42,h-10);ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=100;i++){const xcm=20*i/100,x=xcm/20*(w-l-r)+l,F=state.k*(xcm/100);const y=h-b-(h-t-b)*Math.min(F,20)/20;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}
  function save(){LabStorage.save({type:"HOOKE",name:"Закон Гука",parameters:{springConstant:state.k,force:state.force},results:{extension:Number(extension().toFixed(5)),energy:Number((.5*state.k*extension()**2).toFixed(5))}});LabApp.showToast("Результат по закону Гука сохранён")}
  return {render}
})();
