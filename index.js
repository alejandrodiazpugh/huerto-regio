window.addEventListener("DOMContentLoaded", () => {
  const startTimeInput = document.querySelector("#form_start_time");
  if (startTimeInput) startTimeInput.value = Date.now();
  main();
});

function main() {
  validateForm();
  formatPhoneInput();
  setupMobileMenu();
}

function validateForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  form.setAttribute("novalidate", true);
  const inputs = form.querySelectorAll("input, textarea");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const startTime = document.querySelector("#form_start_time")?.value;
    const currentTime = Date.now();
    const secondsElapsed = (currentTime - startTime) / 1000;

    // Honeypot check (and bot timer)
    const honeypot = document.querySelector("#website_url")?.value;
    if (honeypot !== "" || secondsElapsed < 3) {
      console.warn("Bot detected or submission too fast.");
      return;
    }

    let isFormValid = true;
    inputs.forEach((input) => {
      const isFieldValid = validateField(input);
      if (!isFieldValid) isFormValid = false;
    });

    if (!isFormValid) {
      form.querySelector("[aria-invalid='true']")?.focus();
    } else {
      const formData = new FormData(form);
      formData.delete("website_url");
      formData.delete("form_start_time");
      const submitBtn = form.querySelector(".form-submit-button");
      const originalBtnText = submitBtn.textContent;

      try {
        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        const response = await fetch("https://formspree.io/f/mbdpyvjz", {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.innerHTML = `
            <div class="success-message">
                <h3>¡Gracias!</h3>
                <p>Hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.</p>
            </div>`;
        } else {
          throw new Error("Error en el servidor");
        }
      } catch (error) {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    }
  });

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.validity.valid) clearError(input);
    });
  });
}

function validateField(field) {
  const group =
    field.closest(".floating-label-group") || field.closest(".form-group");
  if (!group) return true;

  const errorEl = group.querySelector(".error-message");

  if (!field.validity.valid) {
    let message = field.dataset.error || "Este campo es obligatorio";

    if (field.validity.valueMissing) {
      message = "Por favor, llene este campo.";
    }

    if (errorEl) errorEl.textContent = message;
    field.setAttribute("aria-invalid", "true");
    group.classList.add("has-error");
    return false;
  }

  clearError(field);
  return true;
}

function clearError(field) {
  const group =
    field.closest(".floating-label-group") || field.closest(".form-group");
  if (!group) return;
  const errorEl = group.querySelector(".error-message");
  if (errorEl) errorEl.textContent = "";
  field.removeAttribute("aria-invalid");
  group.classList.remove("has-error");
}

function formatPhoneInput() {
  const phoneInput = document.querySelector("#phone");
  if (!phoneInput) return;

  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.substring(0, 10);
    let formattedValue = "";
    if (value.length > 0) {
      formattedValue = value.substring(0, 2);
      if (value.length > 2) formattedValue += " " + value.substring(2, 6);
      if (value.length > 6) formattedValue += " " + value.substring(6, 10);
    }
    e.target.value = formattedValue;
  });
}

function setupMobileMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const menu = document.querySelector("#main-menu");
  const menuLinks = menu.querySelectorAll("a");

  if (!hamburgerBtn || !menu) return;

  // Toggle menu when clicking the hamburger
  hamburgerBtn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");

    // Update accessibility attributes
    hamburgerBtn.setAttribute("aria-expanded", isOpen);
    hamburgerBtn.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú",
    );
  });

  // Close menu when a link is clicked
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Abrir menú");
    });
  });
}
