window.Friction = (() => {
  let state = { mass: 5, coefficient: .25, force: 18, running: false, x: 0, velocity: 0, data: [] };
  let animation;

  function render(targetId) {
    state = { mass:5, coefficient:.25, force:18, running:false, x:0, velocity:0, data:[] };
    const target = document.getElementById(targetId);
    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Механика / Динамика</div>
            <h1>Сила трения</h1>
            <p class="page-subtitle">Проверьте, при какой внешней силе брусок начинает двигаться, и наблюдайте изменение скорости на живом графике.</p>
          </div>
        </div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Движение бруска</div><span class="badge" id="frictionStatus">ГОТОВО</span></div>
              <div class="panel-body">
                <div class="canvas-wrap"><canvas id="frictionCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / СИЛЫ И ДВИЖЕНИЕ</div></div>
              </div>
            </div>
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Скорость / Время</div><span class="chart-legend">ЖИВОЙ ГРАФИК</span></div>
              <div class="panel-body">
                <div class="canvas-wrap"><canvas id="frictionChart" width="900" height="250"></canvas></div>
                <div class="graph-caption"><span>След движения обновляется во время симуляции</span><span id="frictionLive">v = 0.00 м/с</span></div>
              </div>
            </div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("frMass","Масса",1,20,.1,5,"кг")}
              ${range("frCoeff","Коэффициент трения",.05,.9,.01,.25,"безразмерный")}
              ${range("frForce","Внешняя сила",0,60,.5,18,"Н")}
              <div class="button-row"><button class="btn btn-primary" id="runFr">ЗАПУСК</button><button class="btn" id="pauseFr">ПАУЗА</button><button class="btn" id="resetFr">СБРОС</button></div>
              <button class="btn" id="saveFr">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Силы</div></div><div class="panel-body"><div class="metric-grid">
              ${metric("Сила трения","frictionForce")}${metric("Результирующая","netForce")}${metric("Ускорение","frAcceleration")}${metric("Скорость","frVelocity")}
            </div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body">
              <div class="formula">Fтр = μN</div><div class="formula">N = mg</div><div class="formula">a = (F − Fтр) / m</div>
              <p class="explanation">При F ≤ Fтр брусок остаётся в покое. При превышении порога начинается движение.</p>
            </div></div>
          </aside>
        </div>
        <div class="footer-line"><span>СИЛА ТРЕНИЯ / МЕХАНИКА</span><span>МОДЕЛЬ: ГОРИЗОНТАЛЬНАЯ ПОВЕРХНОСТЬ</span></div>
      </section>`;

    ["frMass","frCoeff","frForce"].forEach(id=>{
      const a=document.getElementById(id), b=document.getElementById(id+"Value");
      const key={frMass:"mass",frCoeff:"coefficient",frForce:"force"}[id];
      const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;reset();};
      a.addEventListener("input",e=>sync(e.target.value)); b.addEventListener("input",e=>sync(e.target.value));
    });
    document.getElementById("runFr").addEventListener("click",run);
    document.getElementById("pauseFr").addEventListener("click",pause);
    document.getElementById("resetFr").addEventListener("click",reset);
    document.getElementById("saveFr").addEventListener("click",save);
    reset();
  }

  function range(id,label,min,max,step,value,unit){
    return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`;
  }
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function friction(){return state.coefficient*state.mass*9.81}
  function acceleration(){return state.force>friction()? (state.force-friction())/state.mass : 0}

  function reset(){if(animation)cancelAnimationFrame(animation);state.running=false;state.x=0;state.velocity=0;state.data=[];set("frictionStatus","ГОТОВО");update();draw();chart()}
  function run(){if(state.running)return;state.running=true;set("frictionStatus","РАБОТАЕТ");let last=performance.now();const tick=now=>{if(!state.running)return;const dt=Math.min((now-last)/1000,.04);last=now;state.velocity=Math.max(0,state.velocity+acceleration()*dt);state.x+=state.velocity*dt;record();update();draw();chart();animation=requestAnimationFrame(tick)};animation=requestAnimationFrame(tick)}
  function pause(){state.running=false;if(animation)cancelAnimationFrame(animation);set("frictionStatus","ПАУЗА")}
  function record(){if(!state.data.length || state.data[state.data.length-1].t<state.data.length*.035)state.data.push({t:state.data.length*.035,v:state.velocity})}
  function update(){set("frictionForce",friction().toFixed(2)+" Н");set("netForce",Math.max(0,state.force-friction()).toFixed(2)+" Н");set("frAcceleration",acceleration().toFixed(2)+" м/с²");set("frVelocity",state.velocity.toFixed(2)+" м/с");set("frictionLive","v = "+state.velocity.toFixed(2)+" м/с")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("frictionCanvas");if(!c)return;const ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const y=280,trackL=80,trackR=w-80,maxX=100,x=trackL+(state.x%maxX)/maxX*(trackR-trackL);ctx.strokeStyle="#566571";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(trackL,y+50);ctx.lineTo(trackR,y+50);ctx.stroke();ctx.fillStyle="#39d5e7";ctx.fillRect(x,y-10,90,60);ctx.fillStyle="#e4edf2";ctx.font="11px DM Mono,monospace";ctx.fillText("БРУСОК",x+19,y+21);ctx.fillStyle="#65737e";ctx.fillText(`F = ${state.force.toFixed(1)} Н`,20,28);ctx.fillText(`Fтр = ${friction().toFixed(2)} Н`,20,46);ctx.fillStyle="#39d5e7";ctx.fillText(`v = ${state.velocity.toFixed(2)} м/с`,20,64)}
  function chart(){const c=document.getElementById("frictionChart");if(!c)return;const ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const l=52,r=18,t=18,b=34,maxT=Math.max(6,state.data.length*.035),maxV=Math.max(1,state.velocity,acceleration()*maxT);ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("v (м/с)",7,14);ctx.fillText("t (с)",w-35,h-10);if(!state.data.length){ctx.fillText("Нажмите «ЗАПУСК», чтобы получить живые данные",l+14,h/2);return}ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();state.data.forEach((d,i)=>{const x=l+(w-l-r)*d.t/maxT,y=h-b-(h-t-b)*d.v/maxV;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke();const d=state.data[state.data.length-1];const px=l+(w-l-r)*d.t/maxT,py=h-b-(h-t-b)*d.v/maxV;ctx.fillStyle="#edf3f8";ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(57,213,231,.35)";ctx.beginPath();ctx.arc(px,py,11,0,Math.PI*2);ctx.stroke()}
  function save(){LabStorage.save({type:"FRICTION",name:"Сила трения",parameters:{mass:state.mass,coefficient:state.coefficient,force:state.force},results:{friction:Number(friction().toFixed(4)),acceleration:Number(acceleration().toFixed(4)),velocity:Number(state.velocity.toFixed(4))}});LabApp.showToast("Результат опыта сохранён")}
  return {render}
})();
