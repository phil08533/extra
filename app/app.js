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
  estimateItems: [],
  estimates: JSON.parse(localStorage.getItem("estimates") || "[]"),
  timeLogs: JSON.parse(localStorage.getItem("timeLogs") || "[]"),
  activeEstimateId: null
};

const defaultAgreement = "50% deposit required. Balance due upon completion. Work subject to weather delays.";

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

  byId("agreementText").value = defaultAgreement;

  byId("addDimensionBtn").addEventListener("click", () => addDimensionRow());
  byId("saveEstimateBtn").addEventListener("click", saveEstimate);
  byId("newEstimateBtn").addEventListener("click", resetEstimateForm);
  byId("exportBtn").addEventListener("click", () => window.print());
  templateSelect.addEventListener("change", loadTemplate);

  document.querySelectorAll(".worker-controls button").forEach((btn) => {
    btn.addEventListener("click", () => logTime(btn.dataset.action));
  });

  document.querySelectorAll(".day-hours").forEach((input) => {
    input.addEventListener("input", recalculateWeeklyPay);
  });
  byId("hourlyRate").addEventListener("input", recalculateWeeklyPay);

  addDimensionRow();
  loadTemplate();
  renderSavedEstimates();
  renderWorkDashboard();
  renderTimeLogs();
  recalculateWeeklyPay();
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

function clearDimensionRows() {
  byId("dimensionsList").innerHTML = "";
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

function snapshotCurrentEstimate() {
  return {
    customerName: byId("customerName").value || "Unnamed Customer",
    estimateNumber: byId("estimateNumber").value || `EST-${Date.now()}`,
    status: byId("estimateStatus").value,
    template: byId("templateSelect").value,
    customerEmail: byId("customerEmail").value.trim(),
    paymentLink: byId("paymentLink").value.trim(),
    agreement: byId("agreementText").value.trim(),
    dimensions: collectDimensions(),
    items: structuredClone(state.estimateItems),
    total: byId("grandTotal").textContent
  };
}

function saveEstimate() {
  const payload = snapshotCurrentEstimate();
  if (state.activeEstimateId) {
    const index = state.estimates.findIndex((e) => e.id === state.activeEstimateId);
    if (index >= 0) {
      state.estimates[index] = {
        ...state.estimates[index],
        ...payload,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    state.estimates.unshift({
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString()
    });
  }

  localStorage.setItem("estimates", JSON.stringify(state.estimates));
  renderSavedEstimates();
  renderWorkDashboard();
  alert("Estimate saved locally.");
}

function renderSavedEstimates() {
  const list = byId("savedEstimates");
  list.innerHTML = "";

  if (state.estimates.length === 0) {
    list.innerHTML = "<li>No saved estimates yet.</li>";
    return;
  }

  state.estimates.forEach((estimate) => {
    const li = document.createElement("li");
    li.className = "saved-estimate-item";
    li.innerHTML = `
      <strong>${estimate.estimateNumber} — ${estimate.customerName}</strong>
      <span class="meta">${estimate.template} · ${estimate.status} · ${estimate.total}</span>
      <div class="inline-actions">
        <button data-action="load">Load</button>
        <button data-action="duplicate">Duplicate</button>
        <button class="danger" data-action="delete">Delete</button>
      </div>
    `;

    li.querySelector('[data-action="load"]').addEventListener("click", () => loadEstimate(estimate.id));
    li.querySelector('[data-action="duplicate"]').addEventListener("click", () => duplicateEstimate(estimate.id));
    li.querySelector('[data-action="delete"]').addEventListener("click", () => deleteEstimate(estimate.id));
    list.appendChild(li);
  });
}

function loadEstimate(id) {
  const estimate = state.estimates.find((e) => e.id === id);
  if (!estimate) return;

  state.activeEstimateId = id;
  byId("customerName").value = estimate.customerName || "";
  byId("estimateNumber").value = estimate.estimateNumber || "";
  byId("estimateStatus").value = estimate.status || "Draft";
  byId("templateSelect").value = estimate.template || Object.keys(templates)[0];
  byId("customerEmail").value = estimate.customerEmail || "";
  byId("paymentLink").value = estimate.paymentLink || "";
  byId("agreementText").value = estimate.agreement || defaultAgreement;

  state.estimateItems = structuredClone(estimate.items || templates[byId("templateSelect").value]);
  renderLineItems();

  clearDimensionRows();
  if (estimate.dimensions?.length) {
    estimate.dimensions.forEach((dimension) => addDimensionRow(dimension));
  } else {
    addDimensionRow();
  }

  recalculate();
}

function duplicateEstimate(id) {
  const estimate = state.estimates.find((e) => e.id === id);
  if (!estimate) return;

  state.estimates.unshift({
    ...structuredClone(estimate),
    id: crypto.randomUUID(),
    estimateNumber: `${estimate.estimateNumber}-COPY`,
    status: "Draft",
    createdAt: new Date().toISOString()
  });

  localStorage.setItem("estimates", JSON.stringify(state.estimates));
  renderSavedEstimates();
  renderWorkDashboard();
}

function deleteEstimate(id) {
  state.estimates = state.estimates.filter((e) => e.id !== id);
  if (state.activeEstimateId === id) {
    resetEstimateForm();
  }
  localStorage.setItem("estimates", JSON.stringify(state.estimates));
  renderSavedEstimates();
  renderWorkDashboard();
}

function resetEstimateForm() {
  state.activeEstimateId = null;
  byId("customerName").value = "";
  byId("estimateNumber").value = "";
  byId("estimateStatus").value = "Draft";
  byId("customerEmail").value = "";
  byId("paymentLink").value = "";
  byId("agreementText").value = defaultAgreement;
  byId("templateSelect").value = Object.keys(templates)[0];
  clearDimensionRows();
  addDimensionRow();
  loadTemplate();
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
    const payLinkText = estimate.paymentLink ? ` · Pay: ${estimate.paymentLink}` : "";
    li.textContent = `${estimate.template} – ${estimate.customerName} (${estimate.total})${payLinkText}`;
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

function recalculateWeeklyPay() {
  const totalHours = [...document.querySelectorAll(".day-hours")].reduce(
    (sum, field) => sum + (Number(field.value) || 0),
    0
  );
  const hourlyRate = Number(byId("hourlyRate").value) || 0;

  byId("weeklyHours").textContent = totalHours.toFixed(2);
  byId("weeklyPay").textContent = formatMoney(totalHours * hourlyRate);
}

init();
