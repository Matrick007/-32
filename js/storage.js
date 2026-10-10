window.LabStorage = (() => {
  const KEY = "virtualLaboratory.history.v1";

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function save(experiment) {
    const items = read();
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      ...experiment
    };
    items.unshift(entry);
    write(items.slice(0, 50));
    return entry;
  }

  function remove(id) {
    write(read().filter(item => item.id !== id));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function stats() {
    const items = read();
    const unique = new Set(items.map(i => i.type));
    return {
      completed: items.length,
      saved: items.length,
      laboratories: unique.size
    };
  }

  function countByType(type) {
    return read().filter(i => i.type === type).length;
  }

  function exportJSON(items) {
    const blob = new Blob([JSON.stringify(items, null, 2)], {type: "application/json"});
    triggerDownload(blob, "virtual-laboratory-history.json");
  }

  function exportCSV(items) {
    const headers = ["Experiment", "Date", "Parameters", "Results"];
    const rows = items.map(i => [
      i.name,
      new Date(i.date).toLocaleString(),
      JSON.stringify(i.parameters || {}),
      JSON.stringify(i.results || {})
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], {type: "text/csv;charset=utf-8"});
    triggerDownload(blob, "virtual-laboratory-history.csv");
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return { read, save, remove, clear, stats, countByType, exportJSON, exportCSV };
})();
