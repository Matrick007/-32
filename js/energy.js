window.Energy = (() => {
  let state, animation;
  function render(targetId){
    state={mass:2,height:20,gravity:9.81,t:0,running:false,data:[]};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Физика / Энергия</div><h1>Закон сохранения энергии</h1><p class="page-subtitle">Наблюдайте, как потенциальная энергия тела превращается в кинетическую, пока их сумма остаётся постоянной.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Движение тела</div><span class="badge" id="energyStatus">ГОТОВО</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="energyCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / ЭНЕРГЕТИЧЕСКИЙ БАЛАНС</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Энергии / Время</div><span class="chart-legend">LIVE / PE + KE + TOTAL</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="energyChart" width="900" height="250"></canvas></div><div class="graph-caption"><span>Бирюзовая — потенциальная, серая — кинетическая, пунктирная — сумма</span><span id="energyLive">E = 0 Дж</span></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("energyMass","Масса",.5,10,.1,2,"кг")}
              ${range("energyHeight","Начальная высота",5,50,1,20,"м")}
              ${range("energyGravity","Гравитация",1,20,.01,9.81,"м/с²")}
              <div class="button-row"><button class="btn btn-primary" id="runEn">ЗАПУСК</button><button class="btn" id="pauseEn">ПАУЗА</button><button class="btn" id="resetEn">СБРОС</button></div>
              <button class="btn" id="saveEn">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Баланс</div></div><div class="panel-body"><div class="metric-grid">${metric("Потенциальная","potential")}${metric("Кинетическая","kinetic")}${metric("Полная","totalEnergy")}${metric("Скорость","energySpeed")}</div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body"><div class="formula">Eп = mgh</div><div class="formula">Eк = mv² / 2</div><div class="formula">Eп + Eк = const</div><p class="explanation">При отсутствии сопротивления воздуха полная механическая энергия сохраняется.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>ЭНЕРГИЯ / ФИЗИКА</span><span>МОДЕЛЬ: БЕЗ ПОТЕРЬ</span></div>
      </section>`;
    [["energyMass","mass"],["energyHeight","height"],["energyGravity","gravity"]].forEach(([id,key])=>{const a=document.getElementById(id),b=document.getElementById(id+"Value");const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;reset()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value))});
    document.getElementById("runEn").addEventListener("click",run);document.getElementById("pauseEn").addEventListener("click",pause);document.getElementById("resetEn").addEventListener("click",reset);document.getElementById("saveEn").addEventListener("click",save);reset();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function fallTime(){return Math.sqrt(2*state.height/state.gravity)}
  function values(){const total=state.mass*state.gravity*state.height,drop=.5*state.gravity*state.t*state.t,currentH=Math.max(0,state.height-drop),pe=state.mass*state.gravity*currentH,ke=Math.max(0,total-pe),v=Math.sqrt(2*ke/state.mass);return{total,pe,ke,v,currentH}}
  function reset(){if(animation)cancelAnimationFrame(animation);state.running=false;state.t=0;state.data=[];set("energyStatus","ГОТОВО");update();draw();chart()}
  function run(){if(state.running)return;state.running=true;set("energyStatus","РАБОТАЕТ");let last=performance.now();const tick=now=>{if(!state.running)return;const dt=Math.min((now-last)/1000,.04);last=now;state.t+=dt;if(state.t>=fallTime()){state.t=fallTime();update();draw();chart();state.running=false;set("energyStatus","ЗАВЕРШЕНО");return}state.data.push({t:state.t,...values()});update();draw();chart();animation=requestAnimationFrame(tick)};animation=requestAnimationFrame(tick)}
  function pause(){state.running=false;if(animation)cancelAnimationFrame(animation);set("energyStatus","ПАУЗА")}
  function update(){const v=values();set("potential",v.pe.toFixed(2)+" Дж");set("kinetic",v.ke.toFixed(2)+" Дж");set("totalEnergy",v.total.toFixed(2)+" Дж");set("energySpeed",v.v.toFixed(2)+" м/с");set("energyLive","E = "+v.total.toFixed(2)+" Дж")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("energyCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const ground=h-55,top=40,current=values().currentH,y=ground-current/state.height*(ground-top);ctx.strokeStyle="#566571";ctx.beginPath();ctx.moveTo(80,ground);ctx.lineTo(w-80,ground);ctx.stroke();ctx.strokeStyle="#293640";ctx.beginPath();ctx.moveTo(w/2,top);ctx.lineTo(w/2,ground);ctx.stroke();ctx.fillStyle="#39d5e7";ctx.beginPath();ctx.arc(w/2,y,13,0,Math.PI*2);ctx.fill();ctx.fillStyle="#dfe8ee";ctx.font="11px DM Mono,monospace";ctx.fillText(`h = ${current.toFixed(2)} м`,w/2+22,y);ctx.fillText(`v = ${values().v.toFixed(2)} м/с`,w/2+22,y+17)}
  function chart(){const c=document.getElementById("energyChart");if(!c)return;const ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const l=52,r=18,t=18,b=34,maxT=Math.max(fallTime(),2),maxE=state.mass*state.gravity*state.height;ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("энергия (Дж)",5,14);ctx.fillText("t (с)",w-35,h-10);if(!state.data.length){ctx.fillText("Нажмите «ЗАПУСК», чтобы увидеть три живые кривые",l+14,h/2);return}for(const [key,lineColor,dash] of [["pe","#39d5e7",[]],["ke","#73818e",[]],["total","#d6e0e5",[5,5]]]){ctx.strokeStyle=lineColor;ctx.lineWidth=key==="total"?1:2;ctx.setLineDash(dash);ctx.beginPath();state.data.forEach((d,i)=>{const x=l+(w-l-r)*d.t/maxT,y=h-b-(h-t-b)*d[key]/maxE;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke()}ctx.setLineDash([]);const last=state.data[state.data.length-1];const px=l+(w-l-r)*last.t/maxT;const py=h-b-(h-t-b)*last.pe/maxE;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill()}
  function save(){const v=values();LabStorage.save({type:"ENERGY",name:"Закон сохранения энергии",parameters:{mass:state.mass,height:state.height,gravity:state.gravity},results:{potential:Number(v.pe.toFixed(4)),kinetic:Number(v.ke.toFixed(4)),total:Number(v.total.toFixed(4))}});LabApp.showToast("Результат сохранён")}
  return{render}
})();
