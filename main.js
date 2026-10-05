// Lead form: posts to /api/lead, keeps UTM and page info, redirects to /thank-you/ on success.
// Without JavaScript the form still posts and the API answers with a 303 to /thank-you/.
(function () {
  var params = new URLSearchParams(location.search);
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
    var v = params.get(k);
    try { if (v) sessionStorage.setItem(k, v); else v = sessionStorage.getItem(k); } catch (e) {}
    if (v) utm[k] = v;
  });
  document.querySelectorAll('form[data-lead]').forEach(function (f) {
    f.elements.page.value = location.pathname;
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (f.hasAttribute('data-preview')) { f.querySelector('.form-status').textContent = 'Preview: this form is not connected yet. Nothing was sent.'; return; }
      var status = f.querySelector('.form-status');
      var btn = f.querySelector('button[type=submit]');
      var data = Object.fromEntries(new FormData(f).entries());
      Object.assign(data, utm);
      btn.disabled = true;
      status.textContent = 'Sending...';
      fetch(f.action, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.j.ok) throw new Error(res.j.error || 'send failed');
          if (window.gtag) window.gtag('event', 'generate_lead', { form_page: location.pathname });
          location.href = '/high-tech-yachts-preview/thank-you/';
        })
        .catch(function () {
          btn.disabled = false;
          status.textContent = 'That did not go through. Please call or text the number at the top of the page.';
        });
    });
  });
  document.querySelectorAll('[data-call]').forEach(function (a) {
    a.addEventListener('click', function () { if (window.gtag) window.gtag('event', 'phone_click', { link_page: location.pathname }); });
  });
})();
// /review/ star picker
(function () {
  var box = document.querySelector('.review-page');
  if (!box) return;
  var btns = box.querySelectorAll('[data-stars]');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var n = Number(b.getAttribute('data-stars'));
      btns.forEach(function (x) { var k = Number(x.getAttribute('data-stars')); x.classList.toggle('on', k <= n); x.setAttribute('aria-checked', String(k === n)); });
      box.querySelector('.rv-five').hidden = n !== 5;
      box.querySelector('.rv-low').hidden = n === 5;
      var f = box.querySelector('.rv-form'); if (f) f.elements.stars.value = String(n);
      if (n === 5) setTimeout(function () { location.href = box.getAttribute('data-google'); }, 900);
    });
  });
})();
// Brand carousel: tap toggles pause on touch screens (hover already pauses with a mouse).
document.querySelectorAll('[data-marquee]').forEach(function (m) {
  m.addEventListener('click', function () { m.classList.toggle('paused'); });
});
