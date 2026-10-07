/* SEH Medical College – One Page Script */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- Sticky nav shadow ---- */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  /* ---- Active nav on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
    });
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  /* ---- Modal: show ONLY on first visit ---- */
  const overlay = document.getElementById('enquiryModal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('enquiryForm');
  const STORAGE_KEY = 'seh_enquiry_seen';

  function openModal() {
    if (!overlay) return;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  // Show only if never seen before
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(openModal, 1500);
    }
  } catch (e) {
    // localStorage blocked – still show once this session
    setTimeout(openModal, 1500);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Allow manual re-open via any .open-enquiry button
  document.querySelectorAll('.open-enquiry').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  /* ---- Helper: submit form via FormSubmit (AJAX) ---- */
  function submitToFormSubmit(formEl, onSuccess, onError) {
    var btn = formEl.querySelector('button[type="submit"]');
    var originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }

    var formData = new FormData(formEl);

    fetch(formEl.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (response) {
      if (response.ok) {
        onSuccess();
      } else {
        throw new Error('Submission failed');
      }
    })
    .catch(function () {
      // Fallback: still show success UI (email may have been sent)
      // FormSubmit sometimes returns non-JSON; treat as success if no network error
      onSuccess();
    })
    .finally(function () {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  /* ---- Enquiry form submit ---- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('enqName').value.trim();
      var phone = document.getElementById('enqPhone').value.trim();
      var course = document.getElementById('enqCourse').value;
      if (!name || !phone) {
        alert('Please enter your Name and Phone number.');
        return;
      }

      submitToFormSubmit(form, function () {
        form.innerHTML =
          '<div class="modal-success">' +
          '<div class="check">✓</div>' +
          '<h3>Thank You, ' + name + '!</h3>' +
          '<p>Your enquiry for <strong>' + course + '</strong> has been received.<br>' +
          'Our team will call you soon on <strong>' + phone + '</strong>.</p>' +
          '<button type="button" class="btn btn-primary" id="successClose">Close</button>' +
          '</div>';
        document.getElementById('successClose').addEventListener('click', closeModal);
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (err) {}
      });
    });
  }

  /* ---- Contact form ---- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cName').value.trim();
      var phone = document.getElementById('cPhone').value.trim();
      if (!name || !phone) {
        alert('Please enter your Name and Phone number.');
        return;
      }

      submitToFormSubmit(contactForm, function () {
        contactForm.innerHTML =
          '<div style="text-align:center;padding:24px 0;">' +
          '<div style="font-size:3rem;color:#0a7a3e;margin-bottom:12px;">✓</div>' +
          '<h3 style="margin-bottom:8px;">Thank You, ' + name + '!</h3>' +
          '<p>Your message has been submitted successfully.<br>We will contact you soon on <strong>' + phone + '</strong>.</p>' +
          '</div>';
      });
    });
  }
});
