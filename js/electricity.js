window.Electricity = (() => {
  let state;

  function render(targetId) {
    state = {running: false, voltage: 9, resistance: 220};

    const target = document.getElementById(targetId);
    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Электричество / Постоянный ток</div>
            <h1>Закон Ома</h1>
            <p class="page-subtitle">Изменяйте напряжение и сопротивление, запускайте простую электрическую цепь и наблюдайте расчёт тока и мощности.</p>
          </div>
        </div>

        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Схема цепи</div><span class="badge" id="circuitStatus">ГОТОВО</span></div>
              <div class="panel-body">
                <div class="canvas-wrap">
                  <canvas id="circuitCanvas" width="900" height="430"></canvas>
                  <div class="canvas-hint">CANVAS / ПРОСТАЯ ПОСЛЕДОВАТЕЛЬНАЯ ЦЕПЬ</div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Ток / Сопротивление</div></div>
              <div class="panel-body">
                <div class="canvas-wrap"><canvas id="electricChart" width="900" height="250"></canvas></div>
              </div>
            </div>
          </div>

          <aside class="lab-side">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Параметры цепи</div></div>
              <div class="panel-body controls">
                <div class="control-block">
                  <label for="voltageE">Напряжение</label>
                  <input type="number" id="voltageE" value="9" min="0" max="24" step="0.1">
                  <div class="small-note">вольт</div>
                </div>
                <div class="control-block">
                  <label for="resistanceE">Сопротивление</label>
                  <input type="number" id="resistanceE" value="220" min="10" max="1000" step="1">
                  <div class="small-note">ом</div>
                </div>
                <div class="button-row">
                  <button class="btn btn-primary" id="runE">RUN</button>
                  <button class="btn" id="resetE">RESET</button>
                </div>
                <button class="btn" id="saveE">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Расчётные значения</div></div>
              <div class="panel-body">
                <div class="metric-grid">
                  ${metric("Напряжение","vOut")}
                  ${metric("Сопротивление","rOut")}
                  ${metric("Ток","iOut")}
                  ${metric("Мощность","pOut")}
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Формула</div></div>
              <div class="panel-body">
                <div class="formula"> В = I × R</div>
                <div class="formula">I =  В / R</div>
                <div class="formula">P =  В × I</div>
                <p class="explanation">В этой упрощённой модели яркость светодиода пропорциональна рассчитанному току.</p>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Выключатель</div></div>
              <div class="panel-body">
                <select id="switchState">
                  <option value="closed">Замкнут — ток проходит</option>
                  <option value="open">Разомкнут — цепь прервана</option>
                </select>
              </div>
            </div>
          </aside>
        </div>

        <div class="footer-line">
          <span>ЗАКОН ОМА / ЭЛЕКТРИЧЕСТВО</span>
          <span>МОДЕЛЬ: ИДЕАЛЬНАЯ ПОСЛЕДОВАТЕЛЬНАЯ ЦЕПЬ</span>
        </div>
      </section>
    `;

    bind();
    update();
    draw();
    drawChart();
  }

  function metric(label,id){ return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`; }

  function bind() {
    document.getElementById("voltageE").addEventListener("input", e => {
      state.voltage = Number(e.target.value) || 0; update(); draw(); drawChart();
    });
    document.getElementById("resistanceE").addEventListener("input", e => {
      state.resistance = Number(e.target.value) || 1; update(); drawChart();
    });
    document.getElementById("switchState").addEventListener("change", () => { update(); draw(); });
    document.getElementById("runE").addEventListener("click", () => {
      state.running = true;
      document.getElementById("circuitStatus").textContent = "RUNNING";
      draw();
      LabApp.showToast("Расчёт цепи обновлён");
    });
    document.getElementById("resetE").addEventListener("click", () => {
      state.voltage = 9;
      state.resistance = 220;
      document.getElementById("voltageE").value = 9;
      document.getElementById("resistanceE").value = 220;
      document.getElementById("switchState").value = "closed";
      state.running = false;
      document.getElementById("circuitStatus").textContent = "ГОТОВО";
      update(); draw(); drawChart();
    });
    document.getElementById("saveE").addEventListener("click", save);
  }

  function values() {
    const closed = document.getElementById("switchState")?.value === "closed";
    const current = closed ? state.voltage / Math.max(state.resistance, 0.0001) : 0;
    return {
      voltage: state.voltage,
      resistance: state.resistance,
      current,
      power: state.voltage * current,
      closed
    };
  }

  function update() {
    const v = values();
    set("vOut", v.voltage.toFixed(2) + "  В");
    set("rOut", v.resistance.toFixed(1) + "  Ом");
    set("iOut", v.current.toFixed(4) + "  А");
    set("pOut", v.power.toFixed(3) + "  Вт");
    updateDiagnostics(v);
  }

  function set(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}

  function draw() {
    const canvas = document.getElementById("circuitCanvas");
    if (!canvas) return;
    const ctx=canvas.getContext("2d"), w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h); ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);
    const y=215;
    const v=values();

    ctx.strokeStyle="#53616f"; ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(105,y);ctx.lineTo(200,y);ctx.lineTo(200,140);ctx.lineTo(355,140);ctx.lineTo(355,y);
    ctx.lineTo(510,y);ctx.lineTo(510,290);ctx.lineTo(670,290);ctx.lineTo(670,y);ctx.lineTo(795,y);ctx.lineTo(795,140);ctx.lineTo(105,140);ctx.lineTo(105,y);
    ctx.stroke();

    // battery
    ctx.strokeStyle="#dce6ed";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(155,122);ctx.lineTo(155,158);ctx.moveTo(177,116);ctx.lineTo(177,164);ctx.stroke();
    label(ctx,"БАТАРЕЯ",126,105);

    // resistor
    ctx.strokeStyle="#7a8a96";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(332,140);ctx.lineTo(344,126);ctx.lineTo(358,154);ctx.lineTo(372,126);ctx.lineTo(386,154);ctx.lineTo(400,126);ctx.lineTo(414,154);ctx.lineTo(430,140);ctx.stroke();
    label(ctx,"РЕЗИСТОР",340,182);

    // switch
    ctx.strokeStyle="#8a9aa7";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(490,215);ctx.lineTo(512,215);ctx.stroke();
    ctx.beginPath();
    if(v.closed){ctx.moveTo(512,215);ctx.lineTo(545,215);} else {ctx.moveTo(512,215);ctx.lineTo(544,195);}
    ctx.stroke();
    ctx.fillStyle="#c5d0d7";ctx.beginPath();ctx.arc(512,215,4,0,Math.PI*2);ctx.arc(570,215,4,0,Math.PI*2);ctx.fill();
    label(ctx,"ВЫКЛЮЧАТЕЛЬ",520,250);

    // СВЕТОДИОД
    const intensity=Math.min(1, v.current / 0.06);
    ctx.strokeStyle="#9aa7b1";ctx.lineWidth=2;ctx.beginPath();ctx.arc(670,290,23,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle = intensity > 0 ? `rgba(57,213,231,${0.12 + intensity*0.75})` : "rgba(255,255,255,.02)";
    ctx.beginPath();ctx.arc(670,290,17,0,Math.PI*2);ctx.fill();
    label(ctx,"СВЕТОДИОД",648,330);

    // current arrows
    if(v.closed && v.current > 0){
      ctx.fillStyle="#39d5e7";ctx.font="12px DM Mono,monospace";
      ctx.fillText("→",265,132);ctx.fillText("→",445,132);ctx.fillText("→",710,208);
      ctx.fillText("←",565,305);ctx.fillText("←",410,230);
    }

    ctx.fillStyle="#667582";ctx.font="10px DM Mono,monospace";
    ctx.fillText(v.closed ? `ТОК = ${v.current.toFixed(4)}  А` : "ЦЕПЬ РАЗОМКНУТА / I = 0 А",20,28);
  }

  function label(ctx,text,x,y){ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText(text,x,y);}

  function drawChart() {
    const canvas=document.getElementById("electricChart");
    if(!canvas)return;
    const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);
    const left=52,right=18,top=18,bottom=34;
    ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,h-bottom);ctx.lineTo(w-right,h-bottom);ctx.stroke();
    ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("I ( А)",10,14);ctx.fillText("R ( Ом)",w-38,h-10);

    const maxR=1000,maxI=24/10;
    ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=100;i++){
      const r=10+(maxR-10)*i/100;
      const I=state.voltage/r;
      const x=left+(w-left-right)*(r-10)/(maxR-10);
      const y=h-bottom-(h-top-bottom)*Math.min(I,maxI)/maxI;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();

    const v=values();
    const x=left+(w-left-right)*(v.resistance-10)/(maxR-10);
    const y=h-bottom-(h-top-bottom)*Math.min(v.current,maxI)/maxI;
    ctx.fillStyle="#edf3f8";ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
  }

  function updateDiagnostics(v) { const intensity=Math.min(1,v.current/0.06); const a=document.getElementById("currentBar"),b=document.getElementById("powerBar"),c=document.getElementById("ledBar"); if(a)a.style.width=Math.min(100,v.current/.1*100)+"%"; if(b)b.style.width=Math.min(100,v.power*100)+"%"; if(c)c.style.width=intensity*100+"%"; const av=document.getElementById("currentBarValue"),bv=document.getElementById("powerBarValue"),cv=document.getElementById("ledBarValue"),sv=document.getElementById("circuitLiveState"); if(av)av.textContent=v.current.toFixed(4)+" А"; if(bv)bv.textContent=v.power.toFixed(3)+" Вт"; if(cv)cv.textContent=Math.round(intensity*100)+"%"; if(sv)sv.textContent=v.closed?"ЗАМКНУТА":"РАЗОМКНУТА"; }

  function save() {
    const v=values();
    LabStorage.save({
      type:"OHMS_L А Вт",
      name:"Закон Ома",
      parameters:{voltage:state.voltage,resistance:state.resistance,switch:v.closed ? "closed":"open"},
      results:{current:Number(v.current.toFixed(6)),power:Number(v.power.toFixed(6))}
    });
    LabApp.showToast("Закон Ома result saved");
  }

  return {render};
})();
