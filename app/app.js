const templates = {
  "Mulch Installation": [
    { name: "Mulch", type: "material", unitCost: 35, quantityFromDimensions: "mulchYards" },
    { name: "Landscape Fabric", type: "material", unitCost: 0.35, quantityFromDimensions: "sqft" },
    { name: "Pins", type: "material", unitCost: 0.2, quantity: 100 },
    { name: "Labor", type: "labor", unitCost: 55, quantity: 4 },
    { name: "Truck", type: "fee", unitCost: 85, quantity: 1 },
    { name: "Dump Fee", type: "fee", unitCost: 45, quantity: 1 }
  ],
  "Sod Install": [
    { name: "Sod", type: "material", unitCost: 0.65, quantityFromDimensions: "sqft" },
    { name: "Topsoil", type: "material", unitCost: 40, quantityFromDimensions: "soilYards" },
    { name: "Labor", type: "labor", unitCost: 60, quantity: 5 },
    { name: "Delivery", type: "fee", unitCost: 65, quantity: 1 }
  ]
};

const state = {
  dimensions: [],
  estimateItems: [],
  estimates: JSON.parse(localStorage.getItem("estimates") || "[]"),
  timeLogs: JSON.parse(localStorage.getItem("timeLogs") || "[]")
};

const byId = (id) => document.getElementById(id);
const formatMoney = (n) => `$${n.toFixed(2)}`;

function init() {
  const templateSelect = byId("templateSelect");
  Object.keys(templates).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    templateSelect.appendChild(option);
  });

  byId("addDimensionBtn").addEventListener("click", addDimensionRow);
  byId("saveEstimateBtn").addEventListener("click", saveEstimate);
  byId("exportBtn").addEventListener("click", () => window.print());
  templateSelect.addEventListener("change", loadTemplate);
  document.querySelectorAll(".worker-controls button").forEach((btn) => {
    btn.addEventListener("click", () => logTime(btn.dataset.action));
  });

  addDimensionRow();
  loadTemplate();
  renderWorkDashboard();
  renderTimeLogs();
}

function addDimensionRow(prefill = { length: "", width: "", depth: "" }) {
  const clone = byId("dimensionRowTemplate").content.cloneNode(true);
  const row = clone.querySelector(".dimension-row");
  row.querySelector(".length").value = prefill.length;
  row.querySelector(".width").value = prefill.width;
  row.querySelector(".depth").value = prefill.depth;
  row.addEventListener("input", recalculate);
  row.querySelector(".remove-dimension").addEventListener("click", () => {
    row.remove();
    recalculate();
  });
  byId("dimensionsList").appendChild(clone);
}

function collectDimensions() {
  return [...document.querySelectorAll(".dimension-row")]
    .map((row) => ({
      length: Number(row.querySelector(".length").value) || 0,
      width: Number(row.querySelector(".width").value) || 0,
      depth: Number(row.querySelector(".depth").value) || 0
    }))
    .filter((d) => d.length > 0 && d.width > 0);
}

function dimensionTotals() {
  const dims = collectDimensions();
  const sqft = dims.reduce((acc, d) => acc + d.length * d.width, 0);
  const mulchYards = dims.reduce((acc, d) => acc + (d.length * d.width * d.depth) / 324, 0);
  const soilYards = dims.reduce((acc, d) => acc + (d.length * d.width * (d.depth / 12)) / 27, 0);
  return { sqft, mulchYards, soilYards };
}

function loadTemplate() {
  const selectedTemplate = byId("templateSelect").value;
  state.estimateItems = structuredClone(templates[selectedTemplate]);
  renderLineItems();
  recalculate();
}

function renderLineItems() {
  const container = byId("lineItems");
  container.innerHTML = "";
  state.estimateItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "line-item";
    row.innerHTML = `
      <span>${item.name}</span>
      <input type="number" min="0" step="0.1" value="${item.quantity || 0}" data-key="quantity" />
      <input type="number" min="0" step="0.01" value="${item.unitCost}" data-key="unitCost" />
    `;

    const [qtyInput, unitCostInput] = row.querySelectorAll("input");
    if (item.quantityFromDimensions) {
      qtyInput.disabled = true;
      qtyInput.title = "Auto-calculated from dimensions";
    }

    [qtyInput, unitCostInput].forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.key;
        state.estimateItems[index][key] = Number(input.value) || 0;
        recalculate();
      });
    });

    container.appendChild(row);
  });
}

function recalculate() {
  const totals = dimensionTotals();
  let materials = 0;
  let labor = 0;
  let fees = 0;

  document.querySelectorAll(".line-item").forEach((row, index) => {
    const item = state.estimateItems[index];
    let quantity = item.quantity || 0;
    if (item.quantityFromDimensions && totals[item.quantityFromDimensions] !== undefined) {
      quantity = totals[item.quantityFromDimensions];
      row.querySelector('input[data-key="quantity"]').value = quantity.toFixed(2);
      item.quantity = quantity;
    }

    const cost = quantity * item.unitCost;
    if (item.type === "material") materials += cost;
    if (item.type === "labor") labor += cost;
    if (item.type === "fee") fees += cost;
  });

  byId("materialsTotal").textContent = formatMoney(materials);
  byId("laborTotal").textContent = formatMoney(labor);
  byId("feesTotal").textContent = formatMoney(fees);
  byId("grandTotal").textContent = formatMoney(materials + labor + fees);
}

function saveEstimate() {
  const estimate = {
    id: crypto.randomUUID(),
    customerName: byId("customerName").value || "Unnamed Customer",
    estimateNumber: byId("estimateNumber").value || `EST-${Date.now()}`,
    status: byId("estimateStatus").value,
    template: byId("templateSelect").value,
    items: state.estimateItems,
    total: byId("grandTotal").textContent,
    createdAt: new Date().toISOString()
  };

  state.estimates.unshift(estimate);
  localStorage.setItem("estimates", JSON.stringify(state.estimates));
  renderWorkDashboard();
  alert("Estimate saved locally.");
}

function renderWorkDashboard() {
  const list = byId("workDashboard");
  list.innerHTML = "";
  const accepted = state.estimates.filter((e) => e.status === "Accepted");
  if (accepted.length === 0) {
    list.innerHTML = "<li>No accepted jobs yet.</li>";
    return;
  }

  accepted.forEach((estimate) => {
    const li = document.createElement("li");
    li.textContent = `${estimate.template} – ${estimate.customerName} (${estimate.total})`;
    list.appendChild(li);
  });
}

function logTime(action) {
  const entry = {
    id: crypto.randomUUID(),
    worker: byId("workerName").value || "Unknown Worker",
    job: byId("workerJob").value || "No Job Specified",
    action,
    at: new Date().toLocaleString()
  };
  state.timeLogs.unshift(entry);
  state.timeLogs = state.timeLogs.slice(0, 25);
  localStorage.setItem("timeLogs", JSON.stringify(state.timeLogs));
  renderTimeLogs();
}

function renderTimeLogs() {
  const list = byId("timeLogs");
  list.innerHTML = "";
  if (state.timeLogs.length === 0) {
    list.innerHTML = "<li>No time events logged yet.</li>";
    return;
  }

  state.timeLogs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = `${log.at} — ${log.worker} — ${log.job} — ${log.action}`;
    list.appendChild(li);
  });
}

init();
