(function () {
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  var form = document.getElementById('inquiry-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);

      submitBtn.disabled = true;
      status.textContent = 'Sending…';
      status.removeAttribute('data-state');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          submitBtn.disabled = false;
          if (result.success) {
            status.textContent = "Thanks — your inquiry has been sent. We'll be in touch soon.";
            status.setAttribute('data-state', 'ok');
            form.reset();
          } else {
            status.textContent = 'Something went wrong sending that. Please try again.';
            status.setAttribute('data-state', 'error');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          status.textContent = 'Something went wrong sending that. Please try again.';
          status.setAttribute('data-state', 'error');
        });
    });
  }
})();
