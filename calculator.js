// ─── Google Apps Script Web App URL ──────────────────────────────────────────
const GAS_URL = 'https://script.google.com/a/macros/emergencycleanings.com/s/AKfycbyHfFqDkaanpWpF28O3egE74vD_P_BplCOVVCFs2Vu099PhcvtpPdQDrCt1YYUAI5kT0w/exec';
// ─────────────────────────────────────────────────────────────────────────────

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function getNumber(id) {
  const element = document.getElementById(id);
  return Number(element && element.value ? element.value : 0);
}

function getCheckedLabels(selector) {
  return Array.from(document.querySelectorAll(selector + ':checked'))
    .map(item => item.parentElement.textContent.trim());
}

function formatPhoneNumber(value) {
  const digits = String(value || '').replace(/[^0-9]/g, '').slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length > 6) return '(' + area + ')-' + prefix + '-' + line;
  if (digits.length > 3) return '(' + area + ')-' + prefix;
  if (digits.length > 0) return '(' + area;
  return '';
}

function handlePhoneInput(event) {
  event.target.value = formatPhoneNumber(event.target.value);
}

function isValidEmail(value) {
  return /^[^ @]+@[^ @]+[.][^ @]{2,}$/.test(String(value || '').trim());
}

function getClientFullName() {
  const firstName = document.getElementById('clientFirstName').value.trim();
  const lastName  = document.getElementById('clientLastName').value.trim();
  return (firstName + ' ' + lastName).trim();
}

function validateLeadFields(showAlert) {
  if (showAlert === undefined) showAlert = true;
  const firstName = document.getElementById('clientFirstName').value.trim();
  const lastName  = document.getElementById('clientLastName').value.trim();
  const email     = document.getElementById('clientEmail').value.trim();
  if (!firstName || !lastName) {
    if (showAlert) alert('Please enter both first name and last name before creating the estimate summary or PDF.');
    return false;
  }
  if (!isValidEmail(email)) {
    if (showAlert) alert('Please enter a valid email address before creating the estimate summary or PDF.');
    return false;
  }
  return true;
}

function calculateEstimate() {
  const market       = getNumber('marketType');
  const propertyType = getNumber('propertyType');
  const base         = getNumber('hoardingLevel');
  const volume       = getNumber('cubicYards');
  const rooms        = Math.max(1, getNumber('roomsAffected'));
  const cleaning     = getNumber('cleaningLevel');
  const carpetCost   = getNumber('carpetService');
  const access       = getNumber('accessLevel');
  const urgency      = getNumber('urgency');

  let hazardCost = 0;
  document.querySelectorAll('.hazard:checked').forEach(function(item) { hazardCost += Number(item.value); });

  let extraAreaCost = 0;
  document.querySelectorAll('.extra-area:checked').forEach(function(item) { extraAreaCost += Number(item.value); });

  let laborExtraCost = 0;
  document.querySelectorAll('.labor-extra:checked').forEach(function(item) { laborExtraCost += Number(item.value); });

  const supervisorReviewRequired = document.querySelectorAll('.supervisor-flag:checked').length > 0;
  const roomAdjustment = Math.max(0, (rooms - 3) * 125);
  const subtotal       = base + volume + cleaning + carpetCost + roomAdjustment + hazardCost + extraAreaCost + laborExtraCost;
  const multiplier     = market * propertyType * access * urgency;
  const calculated     = subtotal * multiplier;

  const low     = Math.max(950, calculated * 0.88);
  const high    = calculated * 1.18;
  const deposit = low * 0.20;

  var severity = 'Moderate';
  var signal   = 'Review';
  var recommendation = 'Review project photos or videos before providing a formal estimate.';

  if (high < 3500) {
    severity = 'Small / Light';
    signal   = 'Lower Value';
    recommendation = 'This may be a smaller project. Verify minimum service pricing, travel costs, and whether the client understands deposit requirements.';
  } else if (high >= 3500 && high < 8500) {
    severity = 'Moderate';
    signal   = 'Qualified Potential';
    recommendation = 'Good potential if the client understands the scope and is prepared to secure scheduling with a deposit.';
  } else if (high >= 8500 && high < 16000) {
    severity = 'Severe';
    signal   = 'High Value';
    recommendation = 'Strong opportunity. Request photos/videos, confirm access, disposal needs, biohazards, and schedule a detailed walkthrough if needed.';
  } else {
    severity = 'Large / Complex';
    signal   = 'Premium / Custom';
    recommendation = 'High-value complex project. Requires senior review, photo/video evidence, site access plan, disposal plan, and written scope confirmation.';
  }

  if (supervisorReviewRequired) {
    severity       = severity + ' / Supervisor Review';
    recommendation = recommendation + ' Supervisor review was flagged and should be completed before presenting a final price.';
  }

  document.getElementById('estimateRange').textContent   = money(low) + ' – ' + money(high);
  document.getElementById('lowRange').textContent        = money(low);
  document.getElementById('highRange').textContent       = money(high);
  document.getElementById('depositAmount').textContent   = money(deposit);
  document.getElementById('severityLabel').textContent   = severity;
  document.getElementById('leadSignal').textContent      = signal;
  document.getElementById('recommendationBox').textContent = recommendation;

  document.getElementById('baseImpact').textContent        = money(base);
  document.getElementById('volumeImpact').textContent      = money(volume);
  document.getElementById('cleanImpact').textContent       = money(cleaning + roomAdjustment);
  document.getElementById('carpetImpact').textContent      = money(carpetCost);
  document.getElementById('hazardImpact').textContent      = money(hazardCost);
  document.getElementById('laborExtraImpact').textContent  = money(laborExtraCost);
  document.getElementById('extraImpact').textContent       = money(extraAreaCost);
  document.getElementById('supervisorImpact').textContent  = supervisorReviewRequired ? 'Yes' : 'No';
  document.getElementById('multiplierImpact').textContent  = multiplier.toFixed(2) + 'x';

  window.currentEstimate = {
    low: low, high: high, deposit: deposit,
    severity: severity, signal: signal, recommendation: recommendation,
    base: base, volume: volume, cleaning: cleaning, carpetCost: carpetCost,
    roomAdjustment: roomAdjustment, hazardCost: hazardCost,
    extraAreaCost: extraAreaCost, laborExtraCost: laborExtraCost,
    supervisorReviewRequired: supervisorReviewRequired, multiplier: multiplier
  };

  return window.currentEstimate;
}

function resetCalculator() {
  document.getElementById('calculatorForm').reset();
  document.getElementById('estimateRange').textContent    = '$0 – $0';
  document.getElementById('lowRange').textContent         = '$0';
  document.getElementById('highRange').textContent        = '$0';
  document.getElementById('depositAmount').textContent    = '$0';
  document.getElementById('severityLabel').textContent    = 'Pending';
  document.getElementById('leadSignal').textContent       = 'Pending';
  document.getElementById('recommendationBox').textContent = 'Recommendation will appear after calculation.';
  document.getElementById('baseImpact').textContent       = '$0';
  document.getElementById('volumeImpact').textContent     = '$0';
  document.getElementById('cleanImpact').textContent      = '$0';
  document.getElementById('carpetImpact').textContent     = '$0';
  document.getElementById('hazardImpact').textContent     = '$0';
  document.getElementById('laborExtraImpact').textContent = '$0';
  document.getElementById('extraImpact').textContent      = '$0';
  document.getElementById('supervisorImpact').textContent = 'No';
  document.getElementById('multiplierImpact').textContent = '1.00x';
  window.currentEstimate = null;
}

function copySummary() {
  if (!window.currentEstimate) calculateEstimate();
  if (!validateLeadFields(true)) return;
  var name     = getClientFullName() || 'Client';
  var phone    = document.getElementById('clientPhone').value   || 'Not provided';
  var email    = document.getElementById('clientEmail').value   || 'Not provided';
  var address  = document.getElementById('clientAddress').value || 'Not provided';
  var estimate = window.currentEstimate;
  var selectedHazards      = getCheckedLabels('.hazard').join(', ')      || 'None selected';
  var selectedExtras       = getCheckedLabels('.extra-area').join(', ')  || 'None selected';
  var selectedLaborExtras  = getCheckedLabels('.labor-extra').join(', ') || 'None selected';
  var supervisorFlag       = getCheckedLabels('.supervisor-flag').join(', ') || 'No';
  var carpetService        = document.getElementById('carpetService').selectedOptions[0].textContent;
  var carpetNotes          = document.getElementById('carpetNotes').value || 'Not provided';
  var summary = 'Emergency Cleanings - Preliminary Hoarding Cleanup Estimate\n\n' +
    'Client: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email + '\nService Address: ' + address + '\n\n' +
    'Estimated Range: ' + money(estimate.low) + ' - ' + money(estimate.high) + '\n' +
    'Suggested 20% Deposit: ' + money(estimate.deposit) + '\n' +
    'Project Severity: ' + estimate.severity + '\n' +
    'Lead Quality Signal: ' + estimate.signal + '\n' +
    'Selected Hazards: ' + selectedHazards + '\n' +
    'Carpet Service: ' + carpetService + '\n' +
    'Carpet Notes: ' + carpetNotes + '\n' +
    'Additional Labor / Handling: ' + selectedLaborExtras + '\n' +
    'Additional Areas / Tasks: ' + selectedExtras + '\n' +
    'Supervisor Review Required: ' + supervisorFlag + '\n\n' +
    'Recommendation: ' + estimate.recommendation + '\n\n' +
    'Important: This is not a final quote. Final pricing is subject to photos/video review, onsite walkthrough, scope confirmation, access conditions, hazards, disposal requirements, and written approval.';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(summary).then(function() {
      alert('Estimate summary copied to clipboard.');
    }).catch(function() { alert(summary); });
  } else {
    alert(summary);
  }
}

function printEstimate() {
  if (!window.currentEstimate) calculateEstimate();
  if (!validateLeadFields(true)) return;
  window.print();
}

function downloadEstimatePdf() {
  if (!window.currentEstimate) calculateEstimate();
  if (!validateLeadFields(true)) return;
  printEstimate();
}

async function sendEstimate() {
  if (!window.currentEstimate) calculateEstimate();
  if (!validateLeadFields(true)) return;
  if (!GAS_URL || GAS_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    alert('Google Apps Script URL not configured.');
    return;
  }
  var estimate          = window.currentEstimate;
  var selectedHazards   = getCheckedLabels('.hazard').join(', ')      || 'None';
  var selectedExtras    = getCheckedLabels('.extra-area').join(', ')  || 'None';
  var selectedLabor     = getCheckedLabels('.labor-extra').join(', ') || 'None';
  var supervisorFlag    = document.querySelectorAll('.supervisor-flag:checked').length > 0;

  var payload = {
    firstName:    document.getElementById('clientFirstName').value.trim(),
    lastName:     document.getElementById('clientLastName').value.trim(),
    phone:        document.getElementById('clientPhone').value.trim(),
    email:        document.getElementById('clientEmail').value.trim(),
    address:      document.getElementById('clientAddress').value.trim(),
    marketType:    document.getElementById('marketType').selectedOptions[0].textContent,
    propertyType:  document.getElementById('propertyType').selectedOptions[0].textContent,
    hoardingLevel: document.getElementById('hoardingLevel').selectedOptions[0].textContent,
    cubicYards:    document.getElementById('cubicYards').selectedOptions[0].textContent,
    roomsAffected: document.getElementById('roomsAffected').value,
    cleaningLevel: document.getElementById('cleaningLevel').selectedOptions[0].textContent,
    carpetService: document.getElementById('carpetService').selectedOptions[0].textContent,
    carpetNotes:   document.getElementById('carpetNotes').value.trim(),
    hazards:          selectedHazards,
    laborExtras:      selectedLabor,
    extraAreas:       selectedExtras,
    supervisorReview: supervisorFlag,
    lowRange:    money(estimate.low),
    highRange:   money(estimate.high),
    deposit:     money(estimate.deposit),
    severity:    estimate.severity,
    signal:      estimate.signal,
    recommendation: estimate.recommendation,
    baseImpact:       money(estimate.base),
    volumeImpact:     money(estimate.volume),
    cleanImpact:      money(estimate.cleaning + estimate.roomAdjustment),
    carpetImpact:     money(estimate.carpetCost),
    hazardImpact:     money(estimate.hazardCost),
    laborExtraImpact: money(estimate.laborExtraCost),
    extraImpact:      money(estimate.extraAreaCost),
    multiplierImpact: estimate.multiplier.toFixed(2) + 'x'
  };

  var btn = document.getElementById('sendEstimateBtn');
  btn.disabled    = true;
  btn.textContent = 'Sending...';

  try {
    var iframe = document.getElementById('_gas_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id   = '_gas_iframe';
      iframe.name = '_gas_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    var form  = document.createElement('form');
    form.method = 'POST';
    form.action = GAS_URL;
    form.target = '_gas_iframe';
    var input   = document.createElement('input');
    input.type  = 'hidden';
    input.name  = 'data';
    input.value = JSON.stringify(payload);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setTimeout(function() {
      btn.textContent = 'Sent!';
      setTimeout(function() { btn.disabled = false; btn.textContent = 'Email Estimate'; }, 3000);
    }, 1500);
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Email Estimate';
    alert('Failed to send estimate: ' + err.message);
  }
}

function runCalculatorTests() {
  var assertions = [];
  function assert(condition, message) {
    assertions.push({ pass: Boolean(condition), message: message });
    if (!condition) console.error('Calculator test failed:', message);
  }
  var estimate = calculateEstimate();
  assert(estimate && typeof estimate.low === 'number', 'calculateEstimate returns a numeric low range.');
  assert(estimate.high > estimate.low, 'High estimate is greater than low estimate.');
  assert(Math.round(estimate.deposit) === Math.round(estimate.low * 0.20), 'Deposit equals 20% of the low range.');
  assert(document.getElementById('extraImpact') !== null, 'Additional areas/tasks breakdown field exists.');
  assert(document.getElementById('carpetImpact') !== null, 'Carpet service breakdown field exists.');
  assert(document.getElementById('laborExtraImpact') !== null, 'Additional labor/handling breakdown field exists.');
  assert(document.getElementById('supervisorImpact') !== null, 'Supervisor review flag breakdown field exists.');
  assert(formatPhoneNumber('4154567898') === '(415)-456-7898', 'Phone formatter works.');
  assert(isValidEmail('test@example.com') === true, 'Valid email passes.');
  assert(isValidEmail('bad-email') === false, 'Invalid email fails.');
  assert(document.getElementById('clientFirstName') !== null, 'First name field exists.');
  assert(document.getElementById('clientLastName') !== null, 'Last name field exists.');
  assert(typeof downloadEstimatePdf === 'function', 'PDF function exists.');
  var failed = assertions.filter(function(a) { return !a.pass; });
  if (failed.length === 0) {
    console.info('Hoarding calculator tests passed: ' + assertions.length + '/' + assertions.length);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  calculateEstimate();
  var phoneInput = document.getElementById('clientPhone');
  phoneInput.addEventListener('input', handlePhoneInput);
  document.querySelectorAll('#calculatorForm select, #calculatorForm input').forEach(function(element) {
    element.addEventListener('change', calculateEstimate);
    element.addEventListener('input', calculateEstimate);
  });
  runCalculatorTests();
});
