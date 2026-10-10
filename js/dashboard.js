window.Dashboard = (() => {
  function render(targetId, experiments) {
    const target = document.getElementById(targetId);
    const stats = LabStorage.stats();
    const recent = LabStorage.read().slice(0, 5);

    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Научное рабочее пространство</div>
            <h1>Виртуальная лаборатория</h1>
            <p class="page-subtitle">Добро пожаловать, исследователь. Проводите эксперименты, меняйте параметры, наблюдайте расчёты и сохраняйте результаты.</p>
          </div>
          <button class="btn btn-primary" id="quickStart">Быстрый запуск</button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Проведено опытов</div>
            <div class="stat-value">${stats.completed}</div>
            <div class="stat-meta">Сохранённых запусков в браузере</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Сохранено результатов</div>
            <div class="stat-value">${stats.saved}</div>
            <div class="stat-meta">Записей в localStorage</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Доступно опытов</div>
            <div class="stat-value">${Object.keys(experiments).length}</div>
            <div class="stat-meta">Интерактивных модулей</div>
          </div>
        </div>

        <div class="section">
          <div class="section-header"><div class="section-title">Доступные опыты</div></div>
          <div class="experiment-grid">
            ${Object.entries(experiments).map(([id, exp]) => `
              <article class="experiment-card">
                <div class="experiment-card-top">
                  <div class="experiment-symbol">${exp.symbol}</div>
                  <span class="experiment-tag">${exp.category}</span>
                </div>
                <h3>${exp.title}</h3>
                <p>${exp.description}</p>
                <button class="btn btn-primary btn-sm" data-open="${id}">Открыть опыт</button>
              </article>
            `).join("")}
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <div class="section-title">Последние опыты</div>
            <button class="btn btn-ghost btn-sm" id="openHistory">Вся история</button>
          </div>
          <div class="list-card">
            ${recent.length ? recent.map(item => `
              <div class="list-row">
                <div><div class="row-title">${escapeHtml(item.name)}</div><div class="row-muted">${item.type}</div></div>
                <div class="row-muted">${new Date(item.date).toLocaleDateString("ru-RU")}</div>
                <div class="row-muted">${summary(item)}</div>
                <div><span class="badge badge-cyan">СОХРАНЕНО</span></div>
                <div><button class="btn btn-sm" data-view-history>Открыть</button></div>
              </div>
            `).join("") : `<div class="empty-state">История пока пустая. Запустите первый опыт.</div>`}
          </div>
        </div>

        <div class="footer-line">
          <span>ВИРТУАЛЬНАЯ ЛАБОРАТОРИЯ / ГЛАВНАЯ</span>
          <span>ЛОКАЛЬНЫЙ СЕАНС</span>
        </div>
      </section>
    `;

    target.querySelectorAll("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => location.hash = `laboratories/${btn.dataset.open}`);
    });
    target.querySelector("#quickStart").addEventListener("click", () => location.hash = "laboratories/projectile");
    target.querySelector("#openHistory").addEventListener("click", () => location.hash = "history");
    target.querySelectorAll("[data-view-history]").forEach(btn => btn.addEventListener("click", () => location.hash = "history"));
  }

  function summary(item) {
    const values = Object.values(item.results || {});
    const numeric = values.find(v => typeof v === "number");
    return typeof numeric === "number" ? `${numeric.toFixed(2)} — результат` : "Выполнено";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  }

  return { render };
})();
