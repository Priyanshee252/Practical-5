const form = document.getElementById("registration-form");
const successBox = document.getElementById("success");
const resetButton = document.getElementById("reset-button");
const meterBar = document.getElementById("meter-bar");
const strengthText = document.getElementById("strength-text");

const namePattern = /^[A-Za-z][A-Za-z .'-]{1,49}$/;
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const mobilePattern = /^[6-9][0-9]{9}$/;
const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 2 * 1024 * 1024;

const validators = {
  fullName: validateName,
  dob: validateDob,
  gender: validateGender,
  email: validateEmail,
  mobile: validateMobile,
  department: validateDepartment,
  idProof: validateFile,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  terms: validateTerms
};

function getValue(id) {
  return form.elements[id].value.trim();
}

function validateName() {
  const value = getValue("fullName");
  if (!value) {
    return "Full name is required.";
  }
  if (value.length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (!namePattern.test(value)) {
    return "Use letters, spaces, dots, hyphens or apostrophes only (max 50).";
  }
  return "";
}

function validateDob() {
  const value = getValue("dob");
  if (!value) {
    return "Date of birth is required.";
  }
  const date = new Date(value);
  const today = new Date();
  const oldest = new Date();
  oldest.setFullYear(today.getFullYear() - 120);
  if (Number.isNaN(date.getTime())) {
    return "Enter a valid date.";
  }
  if (date > today) {
    return "Date of birth cannot be in the future.";
  }
  if (date < oldest) {
    return "Date of birth cannot be more than 120 years ago.";
  }
  return "";
}

function validateGender() {
  return form.elements.gender.value ? "" : "Please select a gender.";
}

function validateEmail() {
  const value = getValue("email");
  if (!value) {
    return "Email address is required.";
  }
  if (!emailPattern.test(value)) {
    return "Enter a valid email, like name@example.com.";
  }
  return "";
}

function validateMobile() {
  const value = getValue("mobile");
  if (!value) {
    return "Mobile number is required.";
  }
  if (value.length !== 10) {
    return "Mobile number must be exactly 10 digits.";
  }
  if (!mobilePattern.test(value)) {
    return "Mobile number must start with 6, 7, 8 or 9.";
  }
  return "";
}

function validateDepartment() {
  return getValue("department") ? "" : "Please choose a department.";
}

function validateFile() {
  const file = form.elements.idProof.files[0];
  if (!file) {
    return "Please upload your ID proof.";
  }
  if (!allowedFileTypes.includes(file.type)) {
    return "Only PDF, JPG or PNG files are allowed.";
  }
  if (file.size > maxFileSize) {
    return "File is too large. Maximum size is 2 MB.";
  }
  return "";
}

function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value)
  };
}

function validatePassword() {
  const value = form.elements.password.value;
  if (!value) {
    return "Password is required.";
  }
  if (/\s/.test(value)) {
    return "Password cannot contain spaces.";
  }
  const checks = getPasswordChecks(value);
  if (!checks.length) {
    return "Password must be at least 8 characters.";
  }
  if (!checks.upper || !checks.lower) {
    return "Include both uppercase and lowercase letters.";
  }
  if (!checks.digit) {
    return "Include at least one number.";
  }
  if (!checks.special) {
    return "Include at least one special character, like @ or #.";
  }
  return "";
}

function validateConfirmPassword() {
  const confirm = form.elements.confirmPassword.value;
  if (!confirm) {
    return "Please confirm your password.";
  }
  if (confirm !== form.elements.password.value) {
    return "Passwords do not match.";
  }
  return "";
}

function validateTerms() {
  return form.elements.terms.checked ? "" : "You must confirm the details to continue.";
}

function showResult(id, message) {
  const errorElement = document.getElementById(id + "-error");
  const field = errorElement.closest(".field");
  errorElement.textContent = message;
  field.classList.toggle("invalid", Boolean(message));
  field.classList.toggle("valid", !message);
}

function checkField(id) {
  const message = validators[id]();
  showResult(id, message);
  return message === "";
}

function updateStrength() {
  const value = form.elements.password.value;
  const checks = getPasswordChecks(value);
  const score = Object.values(checks).filter(Boolean).length;
  const levels = [
    { label: "not entered", color: "transparent", width: "0%" },
    { label: "Very weak", color: "#d93025", width: "20%" },
    { label: "Weak", color: "#e8710a", width: "40%" },
    { label: "Fair", color: "#f2b600", width: "60%" },
    { label: "Good", color: "#6ab04c", width: "80%" },
    { label: "Strong", color: "#1b7f4b", width: "100%" }
  ];
  const level = value ? levels[score] : levels[0];
  meterBar.style.width = level.width;
  meterBar.style.background = level.color;
  strengthText.textContent = "Strength: " + level.label;
}

function sanitizeInput(event) {
  const input = event.target;
  if (input.id === "fullName") {
    input.value = input.value.replace(/[^A-Za-z .'-]/g, "");
  }
  if (input.id === "mobile") {
    input.value = input.value.replace(/\D/g, "").slice(0, 10);
  }
  if (input.id === "email") {
    input.value = input.value.replace(/\s/g, "");
  }
}

function trimInput(event) {
  const input = event.target;
  const trimmedTypes = ["text", "email", "tel"];
  if (trimmedTypes.includes(input.type)) {
    input.value = input.value.trim().replace(/\s{2,}/g, " ");
  }
}

function setDateLimits() {
  const today = new Date();
  const oldest = new Date();
  oldest.setFullYear(today.getFullYear() - 120);
  form.elements.dob.max = today.toISOString().split("T")[0];
  form.elements.dob.min = oldest.toISOString().split("T")[0];
}

function clearStates() {
  document.querySelectorAll(".field").forEach(function (field) {
    field.classList.remove("valid", "invalid");
  });
  document.querySelectorAll(".error").forEach(function (message) {
    message.textContent = "";
  });
  meterBar.style.width = "0%";
  strengthText.textContent = "Strength: not entered";
}

function showSuccess() {
  successBox.hidden = false;
  successBox.textContent =
    "Registration successful. Thank you, " + getValue("fullName") +
    ". A confirmation will be sent to " + getValue("email") + ".";
  successBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

Object.keys(validators).forEach(function (id) {
  const control = form.elements[id];
  const isGroup = control instanceof RadioNodeList;
  const targets = isGroup ? Array.from(control) : [control];

  targets.forEach(function (element) {
    const eventName = ["text", "email", "tel", "password"].includes(element.type) ? "blur" : "change";
    element.addEventListener(eventName, function () {
      checkField(id);
    });
  });
});

["fullName", "mobile", "email"].forEach(function (id) {
  form.elements[id].addEventListener("input", sanitizeInput);
  form.elements[id].addEventListener("blur", trimInput);
});

form.elements.password.addEventListener("input", function () {
  updateStrength();
  if (form.elements.confirmPassword.value) {
    checkField("confirmPassword");
  }
});

form.elements.confirmPassword.addEventListener("input", function () {
  checkField("confirmPassword");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  successBox.hidden = true;

  ["fullName", "email", "mobile"].forEach(function (id) {
    form.elements[id].value = getValue(id).replace(/\s{2,}/g, " ");
  });

  let firstInvalid = null;
  Object.keys(validators).forEach(function (id) {
    if (!checkField(id) && !firstInvalid) {
      firstInvalid = id;
    }
  });

  if (firstInvalid) {
    const control = form.elements[firstInvalid];
    const target = control instanceof RadioNodeList ? control[0] : control;
    target.focus();
    return;
  }

  showSuccess();
  form.reset();
  clearStates();
});

resetButton.addEventListener("click", function () {
  successBox.hidden = true;
  clearStates();
});

setDateLimits();