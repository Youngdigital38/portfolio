/* ==========================================================
   contact.js - Contact form validation
   Rules:
   1) No field may be empty
   2) Email must have a valid format
   3) Phone number must contain digits only
   ========================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     Validation functions
     Each one returns "" when the value is fine,
     or an error message to show the visitor.
     --------------------------------------------------------- */
  function validateName(value) {
    if (String(value).trim() === "") return "Please enter your name.";
    return "";
  }

  function validateEmail(value) {
    var email = String(value).trim();
    if (email === "") return "Please enter your email address.";
    // something@domain.ext  (no spaces, one @, a dot in the domain)
    var pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
    if (!pattern.test(email)) return "Please enter a valid email, like name@example.com.";
    return "";
  }

  function validatePhone(value) {
    var phone = String(value).trim();
    if (phone === "") return "Please enter your phone number.";
    if (!/^\d+$/.test(phone)) return "Use digits only: no spaces, letters, + or -.";
    return "";
  }

  function validateMessage(value) {
    if (String(value).trim() === "") return "Please write a message.";
    return "";
  }

  // Make the logic available for testing in Node (does nothing in the browser)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      validateName: validateName, validateEmail: validateEmail,
      validatePhone: validatePhone, validateMessage: validateMessage
    };
  }

  if (typeof document === "undefined") return;

  /* ---------------------------------------------------------
     Connecting the functions to the page
     --------------------------------------------------------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var messageBox = document.getElementById("form-message");

  // One entry per field: the input, and the function that checks it
  var fields = [
    { id: "name", check: validateName },
    { id: "email", check: validateEmail },
    { id: "phone", check: validatePhone },
    { id: "message", check: validateMessage }
  ];

  function showResult(field, errorText) {
    var input = document.getElementById(field.id);
    var errorEl = document.getElementById(field.id + "-error");
    var wrapper = input.closest(".field");

    errorEl.textContent = errorText;
    wrapper.classList.toggle("invalid", errorText !== "");
    wrapper.classList.toggle("valid", errorText === "");
    input.setAttribute("aria-invalid", errorText !== "" ? "true" : "false");
    if (errorText !== "") {
      input.setAttribute("aria-describedby", field.id + "-error");
    } else {
      input.removeAttribute("aria-describedby");
    }
  }

  function checkField(field) {
    var value = document.getElementById(field.id).value;
    var errorText = field.check(value);
    showResult(field, errorText);
    return errorText === "";
  }

  // Check a field when the visitor leaves it, and keep checking as they fix it
  fields.forEach(function (field) {
    var input = document.getElementById(field.id);
    input.addEventListener("blur", function () { checkField(field); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("invalid")) checkField(field);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    var allValid = true;
    var firstBad = null;

    fields.forEach(function (field) {
      var ok = checkField(field);
      if (!ok) {
        allValid = false;
        if (firstBad === null) firstBad = document.getElementById(field.id);
      }
    });

    if (!allValid) {
      messageBox.className = "form-message error show";
      messageBox.textContent = "Please fix the highlighted fields and try again.";
      firstBad.focus();
      return;
    }

    var firstName = document.getElementById("name").value.trim().split(" ")[0];
    messageBox.className = "form-message success show";
    messageBox.textContent = "Thank you, " + firstName + "! Your details are valid. " +
      "This demo form does not send messages yet, so please reach me on GitHub or Facebook.";

    form.reset();
    fields.forEach(function (field) {
      var wrapper = document.getElementById(field.id).closest(".field");
      wrapper.classList.remove("valid", "invalid");
      document.getElementById(field.id + "-error").textContent = "";
    });
    messageBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
