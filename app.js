
const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();

const state = {
  keyHash: localStorage.getItem("mimmir_founder_hash"),
  config: JSON.parse(localStorage.getItem("mimmir_config") || "{}")
};

async function sha256(text) {
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,"0")).join("");
}

function showConsole() {
  $("gateView").classList.add("hidden");
  $("consoleView").classList.remove("hidden");
  loadConfig();
}

function showGate() {
  $("consoleView").classList.add("hidden");
  $("gateView").classList.remove("hidden");
  $("password").value = "";
  $("gateMessage").textContent = "";
}

function refreshGate() {
  state.keyHash = localStorage.getItem("mimmir_founder_hash");
  $("gateText").textContent = state.keyHash
    ? "Founder authentication required."
    : "Create the Founder Key for this device. It stays on this iPhone and is never stored as plain text.";
  $("gateBtn").textContent = state.keyHash ? "Unlock Founder Console" : "Initialize Founder Key";
}
refreshGate();

$("gateBtn").addEventListener("click", async () => {
  const password = $("password").value;
  if (password.length < 6) {
    $("gateMessage").textContent = "Use at least 6 characters.";
    return;
  }
  const hash = await sha256(password);

  if (!state.keyHash) {
    localStorage.setItem("mimmir_founder_hash", hash);
    state.keyHash = hash;
    $("gateMessage").textContent = "Founder Key initialized.";
    setTimeout(showConsole, 300);
  } else if (hash === state.keyHash) {
    $("gateMessage").textContent = "Founder recognized.";
    setTimeout(showConsole, 220);
  } else {
    $("gateMessage").textContent = "Access denied.";
  }
});

$("password").addEventListener("keydown", e => {
  if (e.key === "Enter") $("gateBtn").click();
});

function loadConfig() {
  const c = JSON.parse(localStorage.getItem("mimmir_config") || "{}");
  const ids = ["assistantName","founderTitle","persona","brainUrl","deviceAlias"];
  ids.forEach(id => { if (c[id] !== undefined) $(id).value = c[id]; });
  const checks = ["founderOnly","approval","memory","deviceControl","cloudEnabled"];
  checks.forEach(id => { if (c[id] !== undefined) $(id).checked = !!c[id]; });
  $("vaultNote").value = localStorage.getItem("mimmir_vault_note") || "";
  const founderTitle = $("founderTitle").value || "Founder";
  $("greeting").textContent = `${founderTitle} recognized.`;
}

function collectConfig() {
  return {
    assistantName: $("assistantName").value.trim() || "Mimmir",
    founderTitle: $("founderTitle").value.trim() || "Founder",
    persona: $("persona").value.trim(),
    brainUrl: $("brainUrl").value.trim(),
    deviceAlias: $("deviceAlias").value.trim(),
    founderOnly: $("founderOnly").checked,
    approval: $("approval").checked,
    memory: $("memory").checked,
    deviceControl: $("deviceControl").checked,
    cloudEnabled: $("cloudEnabled").checked,
    version: "0.1.0-founder"
  };
}

document.querySelectorAll(".save").forEach(btn => btn.addEventListener("click", () => {
  localStorage.setItem("mimmir_config", JSON.stringify(collectConfig()));
  btn.textContent = "Saved ✓";
  setTimeout(() => btn.textContent = btn.dataset.save === "identity" ? "Save Identity" : "Save Authority", 900);
  loadConfig();
}));

$("saveNote").addEventListener("click", () => {
  localStorage.setItem("mimmir_vault_note", $("vaultNote").value);
  $("saveNote").textContent = "Sealed ✓";
  setTimeout(() => $("saveNote").textContent = "Seal Locally", 900);
});

$("clearNote").addEventListener("click", () => {
  localStorage.removeItem("mimmir_vault_note");
  $("vaultNote").value = "";
});

$("lockBtn").addEventListener("click", showGate);
$("panicLock").addEventListener("click", showGate);

$("wipeLocal").addEventListener("click", () => {
  const phrase = prompt('Type RESET MIMMIR to erase the local Founder Key, settings, and local note.');
  if (phrase === "RESET MIMMIR") {
    localStorage.removeItem("mimmir_founder_hash");
    localStorage.removeItem("mimmir_config");
    localStorage.removeItem("mimmir_vault_note");
    refreshGate();
    showGate();
  }
});

$("exportConfig").addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    config: collectConfig(),
    noteIncluded: false
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mimmir-founder-config.json";
  a.click();
  URL.revokeObjectURL(url);
});

$("testBrain").addEventListener("click", async () => {
  const url = $("brainUrl").value.trim();
  if (!url) {
    $("brainState").textContent = "NO ENDPOINT";
    return;
  }
  $("brainState").textContent = "TESTING…";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {method:"GET", signal:controller.signal});
    clearTimeout(timeout);
    $("brainState").textContent = res.ok ? "REACHABLE" : `HTTP ${res.status}`;
  } catch {
    $("brainState").textContent = "UNREACHABLE";
  }
});

$("year").textContent = new Date().getFullYear();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
}
