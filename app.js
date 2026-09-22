(function () {
  // ---- Theme toggle (persisted, respects system preference) ----
  var root = document.documentElement;

  function setToggleLabel() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var isLight = root.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    btn.setAttribute('aria-pressed', String(isLight));
  }

  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.setAttribute('data-theme', 'dark');
    setToggleLabel();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.theme-toggle');
    if (!btn) return;
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (err) {}
  });

  setToggleLabel();

  // ---- Mobile navigation ----
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('nav-toggle');
  if (header && navToggle) {
    function closeNav() {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    header.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // ---- Scroll reveal ----
  var elements = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(function (el) { observer.observe(el); });
  }

  // ---- Contact form ----
  // Delivers via Formspree when a real endpoint is set on the form's `action`.
  // Until then, it gracefully falls back to composing an email (no backend needed).
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = ok === false ? 'var(--danger)' : 'var(--accent-bright)';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.elements.name && form.elements.name.value || '').trim();
      var email = (form.elements.email && form.elements.email.value || '').trim();
      var message = (form.elements.message && form.elements.message.value || '').trim();
      // Honeypot: real users leave this empty.
      var trap = (form.elements._gotcha && form.elements._gotcha.value || '').trim();
      if (trap) return;
      if (!name || !email || !message) {
        setStatus('Please fill in every field.', false);
        return;
      }

      var action = form.getAttribute('action') || '';
      var endpointReady = action.indexOf('formspree.io/f/') !== -1 && action.indexOf('YOUR_FORM_ID') === -1;

      if (!endpointReady) {
        // Fallback: open the visitor's email client with the message pre-filled.
        var subject = 'Portfolio enquiry from ' + name;
        var body = message + '\n\n— ' + name + ' (' + email + ')';
        window.location.href = 'mailto:kanishkdadhich123@gmail.com'
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        setStatus('Opening your email app…');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Sending…');
      fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus('Thanks — your message has been sent.');
        } else {
          res.json().then(function (data) {
            var err = data && data.errors && data.errors.map(function (x) { return x.message; }).join(', ');
            setStatus(err || 'Something went wrong. Please email me directly.', false);
          }).catch(function () {
            setStatus('Something went wrong. Please email me directly.', false);
          });
        }
      }).catch(function () {
        setStatus('Network error. Please email me directly.', false);
      }).then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }
}());
