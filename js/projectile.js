window.Projectile = (() => {
  let state = null;
  let animation = null;

  function render(targetId) {
    state = {
      running: false,
      t: 0,
      data: [],
      lastTime: null,
      params: { velocity: 20, angle: 45, gravity: 9.81 }
    };

    const target = document.getElementById(targetId);
    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Механика / Движение под углом</div>
            <h1>Движение тела под углом</h1>
            <p class="page-subtitle">Запустите тело под углом, наблюдайте траекторию и проверяйте значения, которые рассчитываются в реальном времени.</p>
          </div>
          <div class="mode-tabs">
            <button class="mode-tab active" data-mode="learn">ОБУЧЕНИЕ</button>
            <button class="mode-tab" data-mode="simulate">СИМУЛЯЦИЯ</button>
            <button class="mode-tab" data-mode="challenge">ЗАДАНИЕ</button>
          </div>
        </div>

        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">Симуляция траектории</div>
                <span class="badge" id="status">READY</span>
              </div>
              <div class="panel-body">
                <div class="canvas-wrap">
                  <canvas id="projectileCanvas" width="900" height="430"></canvas>
                  <div class="canvas-hint">CANVAS / ФИЗИЧЕСКАЯ МОДЕЛЬ</div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">Высота / Время</div>
                <div class="chart-legend">ДАННЫЕ В РЕАЛЬНОМ ВРЕМЕНИ</div>
              </div>
              <div class="panel-body">
                <div class="canvas-wrap">
                  <canvas id="projectileChart" width="900" height="250"></canvas>
                </div><div class="graph-caption"><span>Траектория и точка движения обновляются в реальном времени</span><span>h(t)</span></div>
              </div>
            </div>
          </div>

          <aside class="lab-side">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Параметры</div></div>
              <div class="panel-body controls">
                ${rangeControl("velocity", "Начальная скорость", 1, 50, 0.5, 20, "м/с")}
                ${rangeControl("angle", "Угол запуска", 5, 85, 1, 45, "°")}
                ${rangeControl("gravity", "Ускорение свободного падения", 1, 20, 0.01, 9.81, "м/с²")}
                <div class="divider"></div>
                <div class="button-row">
                  <button class="btn btn-primary" id="run">ЗАПУСК</button>
                  <button class="btn" id="pause">ПАУЗА</button>
                  <button class="btn" id="step">ШАГ</button>
                  <button class="btn" id="reset">СБРОС</button>
                </div>
                <button class="btn" id="save">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Текущие значения</div></div>
              <div class="panel-body">
                <div class="metric-grid">
                  ${metric("Текущий X", "currentX")}
                  ${metric("Текущий Y", "currentY")}
                  ${metric("Скорость", "velocityNow")}
                  ${metric("Ускорение", "acceleration")}
                  ${metric("Прошло времени", "elapsed")}
                  ${metric("Максимальная высота", "maxHeight")}
                  ${metric("Дальность", "range")}
                  ${metric("Время полёта", "flightTime")}
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Формулы</div></div>
              <div class="panel-body">
                <div class="formula">x = v₀ cos(θ)t</div>
                <div class="formula">y = v₀ sin(θ)t − ½gt²</div>
                <div class="formula">v = √(vₓ² + vᵧ²)</div>
                <p class="explanation">The simulation uses a simple projectile model without air resistance. Ускорение свободного падения and launch parameters are applied directly to the equations.</p>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Режим</div></div>
              <div class="panel-body" id="modePanel">
                <p class="explanation">Режим обучения объясняет опыт. В режиме симуляции можно свободно менять параметры, а в задании — попасть в целевую дальность.</p>
              </div>
            </div>
          </aside>
        </div>

        <div class="footer-line">
          <span>ДВИЖЕНИЕ ПОД УГЛОМ / МЕХАНИКА</span>
          <span>МОДЕЛЬ: ИДЕАЛЬНАЯ ГРАВИТАЦИЯ</span>
        </div>
      </section>
    `;

    bind(target);
    updateDerived();
    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
  }

  function rangeControl(id, label, min, max, step, value, unit) {
    return `
      <div class="control-block">
        <label for="${id}">${label}</label>
        <div class="control-row">
          <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
          <input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}">
        </div>
        <div class="small-note">${unit}</div>
      </div>
    `;
  }

  function metric(label, id) {
    return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`;
  }

  function bind(root) {
    ["velocity", "angle", "gravity"].forEach(id => {
      const range = root.querySelector(`#${id}`);
      const value = root.querySelector(`#${id}Value`);
      const sync = v => {
        state.params[id] = Number(v);
        range.value = v;
        value.value = v;
        reset();
      };
      range.addEventListener("input", e => sync(e.target.value));
      value.addEventListener("input", e => sync(e.target.value));
    });

    root.querySelector("#run").addEventListener("click", run);
    root.querySelector("#pause").addEventListener("click", pause);
    root.querySelector("#step").addEventListener("click", step);
    root.querySelector("#reset").addEventListener("click", reset);

    root.querySelector("#save").addEventListener("click", saveResult);

    root.querySelectorAll("[data-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-mode]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updateMode(btn.dataset.mode);
      });
    });
  }

  function resizeCanvas() {
    const canvas = document.getElementById("projectileCanvas");
    if (!canvas || !state) return;
    draw();
  }

  function maxHeight() {
    const {velocity, angle, gravity} = state.params;
    const vy = velocity * Math.sin(angle * Math.PI / 180);
    return (vy * vy) / (2 * gravity);
  }

  function rangeValue() {
    const {velocity, angle, gravity} = state.params;
    return (velocity * velocity * Math.sin(2 * angle * Math.PI / 180)) / gravity;
  }

  function flightTime() {
    const {velocity, angle, gravity} = state.params;
    return (2 * velocity * Math.sin(angle * Math.PI / 180)) / gravity;
  }

  function evaluate(t) {
    const {velocity, angle, gravity} = state.params;
    const theta = angle * Math.PI / 180;
    const vx = velocity * Math.cos(theta);
    const vy0 = velocity * Math.sin(theta);
    const x = vx * t;
    const y = Math.max(0, vy0 * t - 0.5 * gravity * t * t);
    const vy = vy0 - gravity * t;
    const speed = Math.sqrt(vx * vx + vy * vy);
    return {x, y, speed};
  }

  function updateDerived() {
    const e = evaluate(Math.min(state.t, flightTime()));
    set("currentX", LabApp.format(e.x, 2) + " m");
    set("currentY", LabApp.format(e.y, 2) + " m");
    set("velocityNow", LabApp.format(e.speed, 2) + " м/с");
    set("acceleration", state.params.gravity.toFixed(2) + " м/с²");
    set("elapsed", state.t.toFixed(2) + " s");
    set("maxHeight", maxHeight().toFixed(2) + " m");
    set("range", rangeValue().toFixed(2) + " m");
    set("flightTime", flightTime().toFixed(2) + " s");
  }

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function run() {
    if (state.running) return;
    state.running = true;
    document.getElementById("status").textContent = "ЗАПУСКNING";
    state.lastTime = performance.now();
    animation = requestAnimationFrame(tick);
  }

  function pause() {
    state.running = false;
    if (animation) cancelAnimationFrame(animation);
    document.getElementById("status").textContent = "ПАУЗАD";
  }

  function step() {
    state.running = false;
    state.t += 0.05;
    if (state.t > flightTime()) state.t = 0;
    record();
    updateDerived();
    draw();
  }

  function reset() {
    state.running = false;
    if (animation) cancelAnimationFrame(animation);
    state.t = 0;
    state.data = [];
    state.lastTime = null;
    const status = document.getElementById("status");
    if (status) status.textContent = "READY";
    updateDerived();
    draw();
    drawChart();
  }

  function tick(now) {
    if (!state.running) return;
    const delta = Math.min((now - state.lastTime) / 1000, 0.04);
    state.lastTime = now;
    state.t += delta;

    if (state.t >= flightTime()) {
      state.t = flightTime();
      record();
      updateDerived();
      draw();
      state.running = false;
      document.getElementById("status").textContent = "COMPLETED";
      drawChart();
      return;
    }

    record();
    updateDerived();
    draw();
    drawChart();
    animation = requestAnimationFrame(tick);
  }

  function record() {
    const e = evaluate(state.t);
    const last = state.data[state.data.length - 1];
    if (!last || state.t - last.t >= 0.035) {
      state.data.push({t: state.t, y: e.y, x: e.x});
    }
  }

  function draw() {
    const canvas = document.getElementById("projectileCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0e13";
    ctx.fillRect(0, 0, w, h);

    const margin = {left: 54, right: 22, top: 20, bottom: 38};
    const maxX = Math.max(rangeValue() * 1.08, 10);
    const maxY = Math.max(maxHeight() * 1.22, 5);
    const sx = (w - margin.left - margin.right) / maxX;
    const sy = (h - margin.top - margin.bottom) / maxY;

    // axes
    ctx.strokeStyle = "#26313d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, h - margin.bottom);
    ctx.lineTo(w - margin.right, h - margin.bottom);
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, h - margin.bottom);
    ctx.stroke();

    ctx.font = "10px DM Mono, monospace";
    ctx.fillStyle = "#55636f";
    for (let i = 0; i <= 5; i++) {
      const x = margin.left + ((w - margin.left - margin.right) * i / 5);
      const value = maxX * i / 5;
      ctx.fillText(value.toFixed(0) + " m", x - 12, h - 16);
      ctx.strokeStyle = "rgba(255,255,255,.04)";
      ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, h - margin.bottom); ctx.stroke();
    }

    for (let i = 0; i <= 4; i++) {
      const y = h - margin.bottom - ((h - margin.top - margin.bottom) * i / 4);
      const value = maxY * i / 4;
      ctx.fillStyle = "#55636f";
      ctx.fillText(value.toFixed(0), 17, y + 3);
      ctx.strokeStyle = "rgba(255,255,255,.035)";
      ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(w - margin.right, y); ctx.stroke();
    }

    // full trajectory
    ctx.strokeStyle = "#2d5d66";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const total = flightTime();
    for (let i = 0; i <= 90; i++) {
      const t = total * i / 90;
      const p = evaluate(t);
      const px = margin.left + p.x * sx;
      const py = h - margin.bottom - p.y * sy;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // traced path
    if (state.data.length > 1) {
      ctx.strokeStyle = "#39d5e7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.data.forEach((d, index) => {
        const px = margin.left + d.x * sx;
        const py = h - margin.bottom - d.y * sy;
        if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    const p = evaluate(state.t);
    const ox = margin.left + p.x * sx;
    const oy = h - margin.bottom - p.y * sy;

    ctx.fillStyle = "#39d5e7";
    ctx.beginPath();
    ctx.arc(ox, oy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(57,213,231,.34)";
    ctx.beginPath();
    ctx.arc(ox, oy, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#dfe8ee";
    ctx.font = "11px DM Mono, monospace";
    ctx.fillText(`x ${p.x.toFixed(2)} m`, Math.min(ox + 10, w - 130), Math.max(oy - 9, 16));
    ctx.fillText(`y ${p.y.toFixed(2)} m`, Math.min(ox + 10, w - 130), Math.max(oy + 9, 28));
  }

  function drawChart() {
    const canvas = document.getElementById("projectileChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0e13";
    ctx.fillRect(0, 0, w, h);

    const left = 52, right = 18, top = 18, bottom = 34;
    const maxT = flightTime();
    const maxH = Math.max(maxHeight(), 1);
    ctx.strokeStyle = "#2a343e";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();

    ctx.font = "9px DM Mono, monospace";
    ctx.fillStyle = "#596874";
    ctx.fillText("h (m)", 8, 14);
    ctx.fillText("t (s)", w - 37, h - 10);

    if (!state.data.length) {
      ctx.fillText("Run simulation to generate live graph", left + 12, h / 2);
      return;
    }

    ctx.strokeStyle = "#39d5e7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.data.forEach((d, i) => {
      const x = left + (w - left - right) * (d.t / maxT);
      const y = h - bottom - (h - top - bottom) * (d.y / maxH);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function updateMode(mode) {
    const panel = document.getElementById("modePanel");
    if (!panel) return;

    if (mode === "learn") {
      panel.innerHTML = `<p class="explanation">Тело движется по кривой, потому что горизонтальная составляющая скорости остаётся постоянной, а гравитация меняет вертикальную составляющую скорости.</p>`;
    } else if (mode === "simulate") {
      panel.innerHTML = `<p class="explanation">Change the three parameters and press ЗАПУСК. ШАГ advances the model by 0.05 seconds.</p>`;
    } else {
      panel.innerHTML = `<div class="challenge">Задание: подберите параметры так, чтобы дальность полёта была близка к <strong>30 м</strong>.</div>`;
    }
  }

  function saveResult() {
    const result = {
      type: "PROJECTILE",
      name: "Движение тела под углом",
      parameters: {...state.params},
      results: {
        range: Number(rangeValue().toFixed(3)),
        maxHeight: Number(maxHeight().toFixed(3)),
        flightTime: Number(flightTime().toFixed(3))
      }
    };
    LabStorage.save(result);
    LabApp.showToast("Результат сохранён");
  }

  return { render };
})();
