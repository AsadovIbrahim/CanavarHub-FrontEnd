"use strict";

/*
    CanavarHub — Login Page
    Backend API ilə inteqrasiya
*/

const API_BASE = "https://localhost:7139/api";

const form = document.querySelector(".login-form");
const inputs = document.querySelectorAll(".login-form input");
const errors = document.querySelectorAll(".error-message");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Client-side validation
    let isValid = true;
    inputs.forEach((input, index) => {
      if (input.value.trim() === "") {
        errors[index].textContent = "Bu xana doldurulmalıdır";
        errors[index].style.display = "block";
        input.style.borderColor = "#E85D3F";
        isValid = false;
      } else {
        errors[index].textContent = "";
        errors[index].style.display = "none";
        input.style.borderColor = "#E7E4DA";
      }
    });

    if (!isValid) return;

    // API call
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Yüklənir...";

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        // Backend xətası göstər
        const errorMsg = data.message || "Email və ya şifrə yanlışdır.";
        showFormError(errorMsg);
      }
    } catch (err) {
      console.error("Login xətası:", err);
      showFormError("Serverlə əlaqə qurulmadı. Backend işləyirmi?");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Daxil ol";
    }
  });
}

function showFormError(message) {
  // Mövcud xəta mesajını sil
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
