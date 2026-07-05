// Shared site behavior

// Highlight the current page in the nav based on the current URL.
document.addEventListener("DOMContentLoaded", function () {
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(function (link) {
    if (link.getAttribute("href") === path) {
      link.setAttribute("aria-current", "page");
    }
  });
});

// Mobile hamburger menu toggle (860px breakpoint, see css/style.css).
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
});

// Booking calendar tabs, used on schedule.html.
// Plain vanilla tab switching, deliberately kept free of any Cal.com-related
// code so it can be verified/debugged on its own. Panels are shown/hidden
// with inline styles (not CSS classes) so there is no dependency on any
// stylesheet rule to make this work.
document.addEventListener("DOMContentLoaded", function () {
  console.log("buttons found:", document.querySelectorAll("[data-tab]").length);
  console.log("panels found:", document.querySelectorAll(".tab-panel").length);
  console.log("first button:", document.querySelector("[data-tab]"));

  var tabButtons = document.querySelectorAll(".tab-button");
  var tabPanels = document.querySelectorAll(".tab-panel");

  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  function showPanel(target) {
    var targetPanel = document.getElementById("tab-" + target);
    for (var i = 0; i < tabPanels.length; i++) {
      tabPanels[i].style.display = "none";
    }
    if (targetPanel) {
      targetPanel.style.display = "block";
    }
  }

  function activateButton(clickedButton) {
    for (var i = 0; i < tabButtons.length; i++) {
      tabButtons[i].classList.remove("active");
      tabButtons[i].setAttribute("aria-selected", "false");
    }
    clickedButton.classList.add("active");
    clickedButton.setAttribute("aria-selected", "true");
  }

  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function (event) {
      var clickedButton = event.currentTarget;
      var target = clickedButton.getAttribute("data-tab");
      showPanel(target);
      activateButton(clickedButton);
    });
  }

  // Force the initial visible state to match whichever button/panel is
  // marked active in the HTML, instead of relying on CSS to get it right.
  var initialButton = document.querySelector(".tab-button.active") || tabButtons[0];
  showPanel(initialButton.getAttribute("data-tab"));
  activateButton(initialButton);
});

// Booking calendar Cal.com lazy-init, used on schedule.html.
// Kept fully separate from the tab-switching listener above. Panel "ria"
// initializes its Cal.com embed eagerly, inline in the HTML, since it is
// visible on page load. Panels "pdc" and "quick" start hidden, so their
// embeds are initialized here the first time their tab is clicked —
// initializing a Cal.com inline embed into a hidden container can leave it
// blank, since the iframe sizes itself based on the container's dimensions
// at init time.
document.addEventListener("DOMContentLoaded", function () {
  var tabButtons = document.querySelectorAll(".tab-button");

  if (!tabButtons.length) {
    return;
  }

  var calPanelConfig = {
    pdc: {
      elementOrSelector: "#my-cal-inline-pdc",
      calLink: "jschwalenberg/pdc"
    },
    quick: {
      elementOrSelector: "#my-cal-inline-quick",
      calLink: "jschwalenberg/quick"
    }
  };
  var initializedCalPanels = {};

  function initCalPanel(target) {
    var config = calPanelConfig[target];
    if (!config || initializedCalPanels[target] || typeof Cal === "undefined" || !Cal.ns[target]) {
      return;
    }

    Cal.ns[target]("inline", {
      elementOrSelector: config.elementOrSelector,
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
      calLink: config.calLink
    });
    Cal.ns[target]("ui", {
      cssVarsPerTheme: { light: { "cal-brand": "#123B6D" }, dark: { "cal-brand": "#C9A227" } },
      hideEventTypeDetails: false,
      layout: "month_view"
    });
    initializedCalPanels[target] = true;
  }

  for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function (event) {
      initCalPanel(event.currentTarget.getAttribute("data-tab"));
    });
  }
});

// Retirement Paycheck Planner logic, used on calculator.html.
var glwbRates = {
  40: { S: 0.0445, J: 0.0395 }, 41: { S: 0.0455, J: 0.0405 }, 42: { S: 0.0465, J: 0.0415 },
  43: { S: 0.0475, J: 0.0425 }, 44: { S: 0.0485, J: 0.0435 }, 45: { S: 0.0495, J: 0.0445 },
  46: { S: 0.0505, J: 0.0455 }, 47: { S: 0.0515, J: 0.0465 }, 48: { S: 0.0525, J: 0.0475 },
  49: { S: 0.0535, J: 0.0485 }, 50: { S: 0.0545, J: 0.0495 }, 51: { S: 0.0555, J: 0.0505 },
  52: { S: 0.0565, J: 0.0515 }, 53: { S: 0.0575, J: 0.0525 }, 54: { S: 0.0585, J: 0.0535 },
  55: { S: 0.0595, J: 0.0545 }, 56: { S: 0.0605, J: 0.0555 }, 57: { S: 0.0615, J: 0.0565 },
  58: { S: 0.0625, J: 0.0575 }, 59: { S: 0.0635, J: 0.0585 }, 60: { S: 0.0645, J: 0.0595 },
  61: { S: 0.0655, J: 0.0605 }, 62: { S: 0.0665, J: 0.0615 }, 63: { S: 0.0675, J: 0.0625 },
  64: { S: 0.0685, J: 0.0635 }, 65: { S: 0.0695, J: 0.0645 }, 66: { S: 0.0705, J: 0.0655 },
  67: { S: 0.0715, J: 0.0665 }, 68: { S: 0.0725, J: 0.0675 }, 69: { S: 0.0735, J: 0.0685 },
  70: { S: 0.0745, J: 0.0695 }, 71: { S: 0.0755, J: 0.0705 }, 72: { S: 0.0765, J: 0.0715 },
  73: { S: 0.0775, J: 0.0725 }, 74: { S: 0.0785, J: 0.0735 }, 75: { S: 0.0795, J: 0.0745 },
  76: { S: 0.0805, J: 0.0755 }, 77: { S: 0.0815, J: 0.0765 }, 78: { S: 0.0825, J: 0.0775 },
  79: { S: 0.0835, J: 0.0785 }, 80: { S: 0.0845, J: 0.0795 }
};

var fmt = function (v) { return "$" + Math.round(Math.abs(v)).toLocaleString(); };
var pct = function (v) { return (v * 100).toFixed(2) + "%"; };
var getVal = function (id) { return parseFloat(document.getElementById(id).value) || 0; };

var monthlyGap = 0;

function calcGap() {
  var housing = getVal("mortgage") + getVal("proptax") + getVal("homeins") + getVal("utilities") + getVal("homemaint");
  var transport = getVal("autoloan") + getVal("autoins") + getVal("gasmaint");
  var health = getVal("healthins") + getVal("medical") + getVal("dental") + getVal("vision");
  var food = getVal("food");
  var otherExp = getVal("taxes") + getVal("otherdebt") + getVal("other");

  document.getElementById("cat-housing-total").textContent = fmt(housing);
  document.getElementById("cat-transport-total").textContent = fmt(transport);
  document.getElementById("cat-health-total").textContent = fmt(health);
  document.getElementById("cat-food-total").textContent = fmt(food);
  document.getElementById("cat-other-total").textContent = fmt(otherExp);

  var expenses = housing + transport + health + food + otherExp;
  var income = getVal("ss1") + getVal("ss2") + getVal("pen1") + getVal("pen2") + getVal("otherinc");
  var gap = income - expenses;
  monthlyGap = gap;

  document.getElementById("r-expenses").textContent = fmt(expenses);
  document.getElementById("r-income").textContent = fmt(income);

  var gapCard = document.getElementById("r-gap-card");
  var gapEl = document.getElementById("r-gap");
  var gapLabel = document.getElementById("r-gap-label");
  var statusEl = document.getElementById("gap-status");
  var annualLine = document.getElementById("annual-gap-line");

  if (expenses === 0 && income === 0) {
    gapEl.textContent = "$0";
    gapLabel.textContent = "Monthly Income Gap";
    gapCard.className = "result-card neutral-fill";
    statusEl.style.display = "none";
    annualLine.textContent = "";
    calcPension();
    return;
  }

  if (gap < 0) {
    gapCard.className = "result-card red-fill";
    gapLabel.textContent = "Monthly Income Gap";
    gapEl.textContent = fmt(gap);
    statusEl.innerHTML = '<div class="status-msg gap-msg">You have a monthly income gap of ' + fmt(gap) + ". Use Calculator 2 below to explore how to close it.</div>";
    statusEl.style.display = "block";
    annualLine.textContent = "Annual income gap: " + fmt(gap * 12);
  } else {
    gapCard.className = "result-card green-fill";
    gapLabel.textContent = "Monthly Surplus";
    gapEl.textContent = fmt(gap);
    statusEl.innerHTML = '<div class="status-msg">Your guaranteed income covers your essential expenses with a monthly surplus of ' + fmt(gap) + ".</div>";
    statusEl.style.display = "block";
    annualLine.textContent = "Annual surplus: " + fmt(gap * 12);
  }
  calcPension();
}

function calcPension() {
  var currage = parseInt(document.getElementById("currage").value, 10) || 0;
  var startage = parseInt(document.getElementById("startage").value, 10) || 0;
  var payouttype = document.getElementById("payouttype").value;
  var premium = parseFloat(document.getElementById("premium").value) || 0;
  var wrap = document.getElementById("pension-results-wrap");
  var remainingGrid = document.getElementById("remaining-grid");
  var statusMsg = document.getElementById("pension-status-msg");
  var reqBox = document.getElementById("required-premium-box");

  if (!currage || !startage || !payouttype || !premium || startage <= currage || !glwbRates[startage]) {
    wrap.style.display = "none";
    return;
  }

  var rate = glwbRates[startage][payouttype];
  var deferral = startage - currage;
  var rollupFactor = Math.pow(1.08, deferral);
  var benefitBase = premium * rollupFactor;
  var annualIncome = benefitBase * rate;
  var monthlyIncome = annualIncome / 12;

  document.getElementById("p-premium").textContent = fmt(premium);
  document.getElementById("p-startage").textContent = startage;
  document.getElementById("p-deferral").textContent = deferral + (deferral === 1 ? " year" : " years");
  document.getElementById("p-rate").textContent = pct(rate);
  document.getElementById("p-base").textContent = fmt(benefitBase);
  document.getElementById("p-monthly").textContent = fmt(monthlyIncome);
  document.getElementById("p-annual").textContent = fmt(annualIncome);
  wrap.style.display = "block";

  if (monthlyGap < 0) {
    var remaining = monthlyGap + monthlyIncome;
    var remainCard = document.getElementById("r-remaining-card");
    var remainLabel = document.getElementById("r-remaining-label");
    var remainValue = document.getElementById("r-remaining-value");

    document.getElementById("r-annuity-monthly").textContent = fmt(monthlyIncome);

    if (remaining >= 0) {
      remainCard.className = "result-card green-fill";
      remainLabel.textContent = "Monthly Surplus";
      remainValue.textContent = fmt(remaining);
      statusMsg.className = "status-msg";
      statusMsg.textContent = "This premium amount generates enough income to cover your essential expenses for life.";
      reqBox.style.display = "none";
    } else {
      remainCard.className = "result-card red-fill";
      remainLabel.textContent = "Remaining Monthly Gap";
      remainValue.textContent = fmt(remaining);
      var annualGapNeeded = Math.abs(monthlyGap) * 12;
      var requiredPremium = annualGapNeeded / (rollupFactor * rate);
      document.getElementById("required-premium-amount").textContent = fmt(requiredPremium);
      reqBox.style.display = "flex";
      statusMsg.className = "status-msg gap-msg";
      statusMsg.textContent = "A larger premium or later income start date may be needed to fully close your gap. Schedule a call to explore your options.";
    }
    remainingGrid.style.display = "grid";
    statusMsg.style.display = "block";
  } else {
    remainingGrid.style.display = "none";
    reqBox.style.display = "none";
    statusMsg.className = "status-msg";
    statusMsg.textContent = "Based on your inputs, this premium generates " + fmt(monthlyIncome) + " per month in guaranteed lifetime income.";
    statusMsg.style.display = "block";
  }
}
