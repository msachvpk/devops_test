(() => {
  const STORAGE_KEY = "activity-checklist:v1";
  const FILTER_KEY = "activity-checklist:filter";

  const listEl = document.getElementById("list");
  const formEl = document.getElementById("addForm");
  const inputEl = document.getElementById("newItem");
  const progressEl = document.getElementById("progress");
  const progressFillEl = document.getElementById("progressFill");
  const clearDoneBtn = document.getElementById("clearDone");
  const filterBtns = document.querySelectorAll(".filter");

  let items = load();
  let filter = localStorage.getItem(FILTER_KEY) || "all";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addItem(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    items.unshift({ id: uid(), text: trimmed, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggleItem(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.done = !item.done;
    save();
    render();
  }

  function deleteItem(id) {
    items = items.filter((i) => i.id !== id);
    save();
    render();
  }

  function clearDone() {
    items = items.filter((i) => !i.done);
    save();
    render();
  }

  function setFilter(next) {
    filter = next;
    localStorage.setItem(FILTER_KEY, filter);
    filterBtns.forEach((b) => b.classList.toggle("active", b.dataset.filter === filter));
    render();
  }

  function visibleItems() {
    if (filter === "active") return items.filter((i) => !i.done);
    if (filter === "done") return items.filter((i) => i.done);
    return items;
  }

  function render() {
    listEl.innerHTML = "";
    for (const item of visibleItems()) {
      const li = document.createElement("li");
      li.className = "item" + (item.done ? " done" : "");
      li.dataset.id = item.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.done;
      checkbox.setAttribute("aria-label", "Mark complete");
      checkbox.addEventListener("change", () => toggleItem(item.id));

      const text = document.createElement("span");
      text.className = "text";
      text.textContent = item.text;

      const del = document.createElement("button");
      del.className = "delete";
      del.type = "button";
      del.setAttribute("aria-label", "Delete activity");
      del.textContent = "✕";
      del.addEventListener("click", () => deleteItem(item.id));

      li.append(checkbox, text, del);
      listEl.append(li);
    }

    const total = items.length;
    const done = items.filter((i) => i.done).length;
    progressEl.textContent = `${done} of ${total} complete`;
    progressFillEl.style.width = total === 0 ? "0%" : `${(done / total) * 100}%`;
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    addItem(inputEl.value);
    inputEl.value = "";
    inputEl.focus();
  });

  clearDoneBtn.addEventListener("click", clearDone);
  filterBtns.forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));

  setFilter(filter);
})();
