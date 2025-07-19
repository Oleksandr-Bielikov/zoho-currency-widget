const API_NBU = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json";
const FIELD_NAME = "Currency_rate";

async function fetchNbuRate() {
  const res = await fetch(API_NBU);
  if (!res.ok) throw new Error("Failed to get NBU rate");
  const data = await res.json();
  console.log("[LOG] NBU rate fetched:", data[0].rate);
  return data[0].rate;
}

async function getDeal(dealId) {
  const res = await ZOHO.CRM.API.getRecord({
    Entity: "Deals",
    RecordID: dealId,
  });
  if (!res.data || res.data.length === 0) throw new Error("Deal not found");
  return res.data[0];
}

async function updateDeal(dealId, newRate) {
  const res = await ZOHO.CRM.API.updateRecord({
    Entity: "Deals",
    APIData: { id: dealId, [FIELD_NAME]: newRate },
  });
  console.log("Update response:", res);

  if (!res.data || res.data.length === 0) {
    throw new Error("No response data");
  }

  if (res.data[0].status !== "success") {
    throw new Error("Update error: " + (res.data[0].message || "Unknown error"));
  }

  return res;
}


function showDiff(nbu, deal) {
  if (deal === undefined || deal === null || deal === "") return null;
  const diff = (deal / nbu - 1) * 100;
  return Math.round(diff * 10) / 10;
}

function showAlert(messageKey, type = "info") {
  const message = window.t(messageKey)
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрити"></button>
    </div>
  `;
  alertContainer.style.display = "block";
  setTimeout(() => {
    alertContainer.style.display = "none";
  }, 4000);
}

async function load(dealId) {
  try {
    const cachedNbuRate = localStorage.getItem("nbuRate");

    if (cachedNbuRate) {
      document.getElementById("nbu-rate").innerText = parseFloat(cachedNbuRate).toFixed(2);
    };

    const nbu = await fetchNbuRate();
    localStorage.setItem("nbuRate", nbu);
    
    const deal = await getDeal(dealId);
    const rate = deal[FIELD_NAME];

    document.getElementById("nbu-rate").innerText = nbu.toFixed(2);
    document.getElementById("deal-rate").innerText = rate.toFixed(2) ?? "value is missing";

    const diff = showDiff(nbu, rate);
    const diffElem = document.getElementById("diff");
    const btn = document.getElementById("update-btn");

    if (diff === null) {
      diffElem.innerText = "no data available";
      btn.style.display = "none";
    } else {
      diffElem.innerText = `${diff > 0 ? "+" : ""}${diff}%`;
      diffElem.classList.remove("diff-positive", "diff-negative");

      if (diff > 0) {
        diffElem.classList.add("diff-positive");
      } else if (diff < 0) {
        diffElem.classList.add("diff-negative");
      }

      btn.style.display = Math.abs(diff) >= 5 ? "inline-block" : "none";
    }

    btn.onclick = async () => {
      console.log("[LOG] Update button clicked");
      btn.disabled = true;
      btn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Updating...
      `;
      try {
        await updateDeal(dealId, nbu);
        console.log("[LOG] Deal successfully updated with new rate:", nbu);
        showAlert("alert-update-success", "success");
        btn.style.display = "none";
        await load(dealId);
      } catch (error) {
        console.error("Error updating deal:", error);
        showAlert("alert-update-error", "danger");
        btn.disabled = false;
        btn.innerText = "Update";
      }
    };
  } catch (error) {
    console.error("Error loading data:", error);
    showAlert("alert-load-error", "danger");
    document.getElementById("nbu-rate").innerText = "Error";
    document.getElementById("deal-rate").innerText = "Error";
    document.getElementById("diff").innerText = "Error";
    document.getElementById("update-btn").style.display = "none";
  }
}

ZOHO.embeddedApp.on("PageLoad", async function (data) {
  await window.loadTranslations()
  const dealId = data.EntityId;
  await load(dealId);
});

ZOHO.embeddedApp.init();
