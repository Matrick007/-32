window.FreeFall = (() => {
  let state, animation;

  function render(targetId) {
    state = {running:false, t:0, data:[], height:30, gravity:9.81, mass:1};
    const target = document.getElementById(targetId);

    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Механика / Свободное падение</div>
            <h1>Свободное падение</h1>
            <p class="page-subtitle">Уроните тело с заданной высоты и наблюдайте, как скорость изменяется под действием гравитации.</p>
          </div>
        </div>

        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Симуляция падения</div><span class="badge" id="fallStatus">ГОТОВО</span></div>
              <div class="panel-body"><div class="canvas-wrap"><canvas id="fallCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / МОДЕЛЬ СВОБОДНОГО ПАДЕНИЯ</div></div></div>
            </div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Скорость / Время</div></div>
              <div class="panel-body"><div class="canvas-wrap"><canvas id="fallChart" width="900" height="250"></canvas></div></div>
            </div>
          </div>

          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("fallHeight","Высота",5,100,1,30,"м")}
              ${range("fallGravity","Гравитация",1,20,.01,9.81,"м/с²")}
              ${range("fallMass","Масса",.1,10,.1,1,"кг")}
              <div class="button-row"><button class="btn btn-primary" id="runF">ЗАПУСК</button><button class="btn" id="pauseF">ПАУЗА</button><button class="btn" id="resetF">СБРОС</button></div>
              <button class="btn" id="saveF">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>

            <div class="panel"><div class="panel-header"><div class="panel-title">Расчётные значения</div></div><div class="panel-body"><div class="metric-grid">
              ${metric("Высота","fHeight")}${metric("Скорость","fVelocity")}${metric("Время падения","fTime")}${metric("Кинетическая энергия","fEnergy")}
            </div></div></div>

            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body">
              <div class="formula">s = ½gt²</div>
              <div class="formula">v = gt</div>
              <div class="formula">v = √(2gh)</div>
              <p class="explanation">В модели отсутствует сопротивление воздуха. Масса влияет только на значение кинетической энергии.</p>
            </div></div>
          </aside>
        </div>
        <div class="footer-line"><span>СВОБОДНОЕ ПАДЕНИЕ / МЕХАНИКА</span><span>МОДЕЛЬ: БЕЗ СОПРОТИВЛЕНИЯ ВОЗДУХА</span></div>
      </section>
    `;

    ["fallHeight","fallGravity","fallMass"].forEach(id => {
      const a = document.getElementById(id), b = document.getElementById(id+"Value");
      const key = {fallHeight:"height",fallGravity:"gravity",fallMass:"mass"}[id];
      const sync = v => {state[key]=Number(v);a.value=v;b.value=v;reset();};
      a.addEventListener("input",e=>sync(e.target.value));
      b.addEventListener("input",e=>sync(e.target.value));
    });

    document.getElementById("runF").addEventListener("click",run);
    document.getElementById("pauseF").addEventListener("click",pause);
    document.getElementById("resetF").addEventListener("click",reset);
    document.getElementById("saveF").addEventListener("click",save);
    reset();
  }

  function range(id,label,min,max,step,value,unit){
    return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`;
  }
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`;}
  function totalTime(){return Math.sqrt(2*state.height/state.gravity);}
  function currentHeight(){return Math.max(0,state.height-0.5*state.gravity*state.t*state.t);}
  function speed(){return state.gravity*state.t;}

  function reset(){
    if(animation)cancelAnimationFrame(animation);
    state.running=false;state.t=0;state.data=[];
    draw();chart();metrics();document.getElementById("fallStatus").textContent="ГОТОВО";
  }

  function run(){
    if(state.running)return;
    state.running=true;document.getElementById("fallStatus").textContent="РАБОТАЕТ";
    let last=performance.now();
    const tick=now=>{
      if(!state.running)return;
      const dt=Math.min((now-last)/1000,.04);last=now;state.t+=dt;
      if(state.t>=totalTime()){state.t=totalTime();record();metrics();draw();chart();state.running=false;document.getElementById("fallStatus").textContent="ЗАВЕРШЕНО";return;}
      record();metrics();draw();chart();animation=requestAnimationFrame(tick);
    };
    animation=requestAnimationFrame(tick);
  }

  function pause(){state.running=false;if(animation)cancelAnimationFrame(animation);document.getElementById("fallStatus").textContent="ПАУЗА";}
  function record(){if(!state.data.length || state.t-state.data[state.data.length-1].t>.035)state.data.push({t:state.t,v:speed()});}
  function metrics(){
    const h=currentHeight(),v=speed(),e=.5*state.mass*v*v;
    set("fHeight",h.toFixed(2)+" м");set("fVelocity",v.toFixed(2)+" м/с");set("fTime",state.t.toFixed(2)+" с");set("fEnergy",e.toFixed(2)+" Дж");
  }
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}

  function draw(){
    const c=document.getElementById("fallCanvas");if(!c)return;const ctx=c.getContext("2d"),w=c.width,h=c.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);
    const ground=h-55, top=35, px=170, usable=ground-top, y=ground-(currentHeight()/state.height)*usable;
    ctx.strokeStyle="#33404b";ctx.beginPath();ctx.moveTo(70,ground);ctx.lineTo(w-70,ground);ctx.stroke();
    ctx.strokeStyle="#27333d";ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,ground);ctx.stroke();
    ctx.fillStyle="#53636f";ctx.font="10px DM Mono,monospace";ctx.fillText(`${state.height.toFixed(0)} м`,90,top+5);ctx.fillText("0 м",105,ground-4);
    ctx.fillStyle="#39d5e7";ctx.beginPath();ctx.arc(px,y,10,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(57,213,231,.32)";ctx.beginPath();ctx.arc(px,y,18,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle="#dfe8ee";ctx.fillText(`v = ${speed().toFixed(2)} м/с`,px+18,Math.max(24,y-10));
    ctx.fillStyle="#5f6e7a";ctx.fillText(`t = ${state.t.toFixed(2)} с`,20,25);
  }

  function chart(){
    const c=document.getElementById("fallChart");if(!c)return;const ctx=c.getContext("2d"),w=c.width,h=c.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);
    const l=52,r=18,t=18,b=34,maxT=totalTime(),maxV=Math.sqrt(2*state.gravity*state.height);
    ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();
    ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("v (м/с)",7,14);ctx.fillText("t (с)",w-35,h-10);
    if(!state.data.length){ctx.fillText("Нажмите «ЗАПУСК», чтобы построить график",l+15,h/2);return;}
    ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();
    state.data.forEach((d,i)=>{const x=l+(w-l-r)*d.t/maxT,y=h-b-(h-t-b)*d.v/maxV;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
  }

  function save(){
    LabStorage.save({type:"FREE_FALL",name:"Свободное падение",parameters:{height:state.height,gravity:state.gravity,mass:state.mass},results:{fallTime:totalTime(),finalVelocity:Math.sqrt(2*state.gravity*state.height),energy:.5*state.mass*2*state.gravity*state.height}});
    LabApp.showToast("Результат свободного падения сохранён");
  }
  return {render};
})();
