"use strict";

/*
    CanavarHub — Register Page
    Backend API ilə inteqrasiya
*/

const API_BASE = "https://localhost:7139/api";

const fields = document.querySelectorAll(
  ".register-form input, .register-form select"
);
const errors = document.querySelectorAll(".error-message");

// Blur validasiyası
fields.forEach((field, index) => {
  field.addEventListener("blur", () => {
    if (field.value.trim() === "") {
      errors[index].textContent = "Bu xana doldurulmalıdır";
      errors[index].style.display = "block";
      field.style.borderColor = "#E85D3F";
    } else {
      errors[index].textContent = "";
      errors[index].style.display = "none";
      field.style.borderColor = "#E7E4DA";
    }
  });
});

// Submit
const form = document.querySelector(".register-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Client-side validation
    let valid = true;
    fields.forEach((field, index) => {
      if (field.value.trim() === "") {
        errors[index].textContent = "Bu xana doldurulmalıdır";
        errors[index].style.display = "block";
        field.style.borderColor = "#E85D3F";
        valid = false;
      }
    });

    if (!valid) return;

    // Backend-ə göndərmək üçün data
    const nameField = fields[0]; // Ad
    const surnameField = fields[1]; // Soyad
    const emailField = fields[2]; // Email
    const passwordField = fields[3]; // Şifrə

    const fullName = `${nameField.value.trim()} ${surnameField.value.trim()}`;
    const email = emailField.value.trim();
    const password = passwordField.value;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Yüklənir...";

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // JWT token saxla
        localStorage.setItem("canavarhub_token", data.token);
        localStorage.setItem(
          "canavarhub_user",
          JSON.stringify({
            email: data.email,
            fullName: data.fullName,
            roles: data.roles,
          })
        );

        // Ana səhifəyə yönləndir
        window.location.href = "../../index.html";
      } else {
        // Backend xətaları
        let errorMsg = "Qeydiyyat uğursuz oldu.";
        if (data.errors && Array.isArray(data.errors)) {
          errorMsg = data.errors.join(" ");
        } else if (data.message) {
          errorMsg = data.message;
        }
        showFormError(errorMsg);
      }
    } catch (err) {
      console.error("Register xətası:", err);
      showFormError("Serverlə əlaqə qurulmadı. Backend işləyirmi?");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Qeydiyyatdan keç";
    }
  });
}

function showFormError(message) {
  let existingError = document.querySelector(".form-error");
  if (existingError) existingError.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.style.cssText =
    "background:#fce6df; color:#e85d3f; padding:12px 16px; border-radius:10px; text-align:center; font-weight:600; margin-bottom:15px;";
  errorDiv.textContent = message;

  form.insertBefore(errorDiv, form.firstChild);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
