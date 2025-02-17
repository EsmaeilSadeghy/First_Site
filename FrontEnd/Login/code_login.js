document.addEventListener("DOMContentLoaded", function () {
  const verifyCode = document.getElementById("verifyCode");

  verifyCode.addEventListener("click", async function (e) {
    e.preventDefault(); // جلوگیری از ارسال فرم به صورت پیش‌فرض

    const code = document.getElementById("code").value.trim();

    if (code === "") {
      alert("لطفاً کد را وارد کنید.");
      return;
    }

    // تأیید کد پیامکی و ورود
    const response = await fetch("http://localhost:5000/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      credentials: "include",
    });

    const data = await response.json();
    if (data.success) {
      alert("ورود موفقیت‌آمیز!");
      window.location.href = "../user_page/user.html";
    } else {
      alert("کد نامعتبر است");
    }
  });
});
