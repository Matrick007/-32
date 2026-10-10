window.HistoryView = (() => {
  function render(targetId) {
    const target = document.getElementById(targetId);
    const items = LabStorage.read();

    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Локальные записи</div>
            <h1>История опытов</h1>
            <p class="page-subtitle">Сохранённые эксперименты находятся в этом браузере. Их можно удалить или экспортировать в удобный формат.</p>
          </div>
          <div class="button-row">
            <button class="btn btn-sm" id="exportJson">Экспорт JSON</button>
            <button class="btn btn-sm" id="exportCsv">Экспорт CSV</button>
            ${items.length ? '<button class="btn btn-danger btn-sm" id="clearHistory">Очистить</button>' : ""}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><div class="panel-title">${items.length} сохранённых записей</div></div>
          ${items.length ? `<div>${items.map(item => row(item)).join("")}</div>` : `<div class="empty-state">История пустая. Завершите и сохраните первый опыт.</div>`}
        </div>

        <div class="footer-line">
          <span>ВИРТУАЛЬНАЯ ЛАБОРАТОРИЯ / ИСТОРИЯ</span>
          <span>ХРАНЕНИЕ: БРАУЗЕР</span>
        </div>
      </section>
    `;

    target.querySelector("#exportJson").addEventListener("click", () => {
      LabStorage.exportJSON(items);
      LabApp.showToast("Файл JSON создан");
    });

    target.querySelector("#exportCsv").addEventListener("click", () => {
      LabStorage.exportCSV(items);
      LabApp.showToast("Файл CSV создан");
    });

    const clear = target.querySelector("#clearHistory");
    if (clear) {
      clear.addEventListener("click", () => {
        if (!confirm("Удалить всю историю опытов?")) return;
        LabStorage.clear();
        LabApp.showToast("История очищена", "warning");
        render(targetId);
      });
    }

    target.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        LabStorage.remove(btn.dataset.delete);
        LabApp.showToast("Запись удалена", "warning");
        render(targetId);
      });
    });

    target.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const item = items.find(x => x.id === btn.dataset.copy);
        if (!item) return;
        try {
          await navigator.clipboard.writeText(JSON.stringify(item, null, 2));
          LabApp.showToast("Результат скопирован");
        } catch {
          LabApp.showToast("Буфер обмена недоступен", "error");
        }
      });
    });
  }

  function row(item) {
    const params = Object.entries(item.parameters || {}).slice(0, 3);
    return `
      <div class="list-row" style="grid-template-columns:1.6fr 1fr 1.25fr auto auto;">
        <div>
          <div class="row-title">${escapeHtml(item.name)}</div>
          <div class="row-muted">${escapeHtml(item.type)}</div>
        </div>
        <div class="row-muted">${new Date(item.date).toLocaleString("ru-RU")}</div>
        <div>
          ${params.map(([k,v]) => `<span class="badge" style="margin:2px;">${escapeHtml(labelize(k))}: ${escapeHtml(formatValue(v))}</span>`).join("")}
        </div>
        <button class="btn btn-sm" data-copy="${item.id}">Копировать</button>
        <button class="btn btn-danger btn-sm" data-delete="${item.id}">Удалить</button>
      </div>
    `;
  }

  function labelize(key) {
    const map = {
      velocity:"Скорость", angle:"Угол", gravity:"Гравитация",
      length:"Длина", mass:"Масса", initialAngle:"Начальный угол",
      voltage:"Напряжение", resistance:"Сопротивление", switch:"Выключатель",
      focal:"Фокусное расстояние", objectDistance:"Расстояние до объекта", objectHeight:"Высота объекта",
      height:"Высота", springConstant:"Жёсткость", force:"Сила", material:"Материал",
      volume:"Объём", power:"Мощность", initialTemperature:"Начальная температура",
      specificHeat:"Удельная теплоёмкость", environment:"Температура среды"
    };
    return map[key] || key;
  }

  function formatValue(v) {
    return typeof v === "number" ? Number(v).toFixed(2) : v;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
  }

  return { render };
})();
