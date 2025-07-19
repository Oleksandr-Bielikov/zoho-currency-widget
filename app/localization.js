const supportedLanguages = ["uk", "en"];
let currentLang = document.documentElement.lang || "uk";

async function loadTranslations(lang = currentLang) {

  try {
    const res = await fetch(`./translations/${lang}.json`);
    if (!res.ok) throw new Error("Translation file not found");
    const translations = await res.json();

    window.currentTranslations = translations;

    if (translations["card-title"]) {
      document.querySelector(".card-title").innerText = translations["card-title"];
    }
    if (translations["nbu-rate-title"]) {
      document.getElementById("nbu-rate-title").innerText = translations["nbu-rate-title"];
    }
    if (translations["nbu_rate"]) {
      document.getElementById("nbu-rate").innerText = translations["nbu_rate"];
    }
    if (translations["deal-rate-title"]) {
      document.getElementById("deal-rate-title").innerText = translations["deal-rate-title"];
    }
    if (translations["deal-rate"]) {
      document.getElementById("deal-rate").innerText = translations["deal-rate"];
    }
    if (translations["diff-title"]) {

    }
    if (translations["diff-title"]) {
      document.getElementById("diff-title").innerText = translations["diff-title"];
    }
    if (translations["update-btn"]) {
      document.getElementById("update-btn").innerText = translations["update-btn"];
    }
  } catch (error) {
    console.error("Translation load error:", error);
  }
}

function toggleLanguage() {
  const currentIndex = supportedLanguages.indexOf(currentLang);
  const nextIndex = (currentIndex + 1) % supportedLanguages.length;
  currentLang = supportedLanguages[nextIndex];

  document.documentElement.lang = currentLang;

  loadTranslations(currentLang);

  const btn = document.getElementById("lang-toggle-btn");
  btn.innerText = currentLang === "uk" ? "English" : "Українська";
}


window.loadTranslations = loadTranslations;
window.toggleLanguage = toggleLanguage;
window.t = function (key) {
  return window.currentTranslations?.[key] || key;
};
