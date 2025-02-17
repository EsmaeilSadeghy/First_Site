document.addEventListener("DOMContentLoaded", function () {
  const sendCodeBtn = document.getElementById("sendCode");
  const phoneNum = null;

  sendCodeBtn.addEventListener("click", async function (e) {
    e.preventDefault(); // جلوگیری از ارسال فرم به صورت پیش‌فرض

    const phonenumber = document.getElementById("phonenumber").value.trim();
    if (phonenumber === "") {
      alert("لطفاً شماره همراه را وارد کنید.");
      return;
    }

    // const phoneRegex = /^09\d{9}$/;
    const PhoneRegex = /^(\+98|0)9\d{9}$/;

    if (!PhoneRegex.test(phonenumber)) {
      alert("لطفاً یک شماره همراه معتبر وارد کنید.");
      return;
    }

    if (phonenumber.length < 11) {
      alert("لطفاً شماره همراه را به صورت کامل وارد کنید.");
      return;
    }

    // ارسال کد پیامکی
    const response = await fetch("http://localhost:5000/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phonenumber }),
    });

    const data = await response.json();
    if (data.success) {
      // هدایت به صفحه دیگر
      window.location.href = "code_login.html"; // صفحه مقصد
    }
  });
});
