document.addEventListener("DOMContentLoaded", function () {
  // دکمه اسکرول به بالا
  const scrollBtn = document.getElementById("scrollBtn");
  window.addEventListener("scroll", handleScroll);

  function handleScroll() {
    scrollBtn.style.display =
      document.body.scrollTop > 20 || document.documentElement.scrollTop > 20
        ? "block"
        : "none";
  }

  scrollBtn?.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // اسکرول محصولات پرفروش
  const slider = document.querySelector(".product-slider");
  const scrollLeft = document.getElementById("scroll-left");
  const scrollRight = document.getElementById("scroll-right");

  function scrollSlider(direction) {
    slider.scrollBy({ left: direction * 250, behavior: "smooth" });
  }

  if (slider && scrollLeft && scrollRight) {
    scrollLeft.addEventListener("click", () => scrollSlider(-1));
    scrollRight.addEventListener("click", () => scrollSlider(1));
  }

  // تغییر آیکون محصولات
  const toggleLink = document.querySelector(".products-toggle");
  const toggleIcon = toggleLink?.querySelector(".toggle-icon");
  const productSubMenu = document.getElementById("productSubMenu");

  function toggleProductIcon() {
    toggleIcon.classList.toggle(
      "fa-angle-down",
      productSubMenu.classList.contains("show")
    );
    toggleIcon.classList.toggle(
      "fa-angle-left",
      !productSubMenu.classList.contains("show")
    );
  }

  if (productSubMenu && toggleIcon) {
    productSubMenu.addEventListener("shown.bs.collapse", toggleProductIcon);
    productSubMenu.addEventListener("hidden.bs.collapse", toggleProductIcon);
  }

  // بخش جستجو
  const searchIcon = document.getElementById("searchIcon");
  const searchForm = document.getElementById("searchForm");
  const closeSearch = document.getElementById("closeSearch");

  searchIcon?.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    searchForm.style.display =
      searchForm.style.display === "block" ? "none" : "block";
  });

  closeSearch?.addEventListener("click", function () {
    searchForm.style.display = "none";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
  });

  // chatbot
  const chatbot = document.getElementById("chatbot");
  const chatbox = document.getElementById("chatbox");
  const open_chat = document.getElementById("open-chat");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const close_chat = document.getElementById("close-chat"); // دکمه بستن چت‌بات

  // ارسال پیام به سرور
  const sendMessage = async (e) => {
    e.preventDefault();
    const question = userInput.value;
    chatbox.innerHTML += `- ${question} \n`;
    userInput.value = "";

    try {
      // ارسال درخواست به سرور Node.js
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      chatbox.innerHTML += `> ${data.response} \n\n`;
    } catch (error) {
      console.error("خطا در ارتباط با سرور:", error);
    }
  };

  // ارسال پیام با دکمه ارسال
  sendBtn.addEventListener("click", sendMessage);

  // ارسال پیام با کلید Enter
  userInput.addEventListener("keypress", (e) => {
    e.defaultPrevented();
    e.stopPropagation();
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function showChatbot() {
    console.log(chatbot);
    chatbot.style.bottom = "0"; // نمایش چت‌بات
  }

  function hideChatbot() {
    console.log(chatbot);
    chatbot.style.bottom = "-100vh"; // پنهان کردن چت‌بات
  }

  // اضافه کردن رویداد کلیک به دکمه باز کردن
  open_chat.addEventListener("click", showChatbot);
  // اضافه کردن رویداد کلیک به دکمه بستن
  close_chat.addEventListener("click", hideChatbot);

  // ورود به حساب کاربری
  const login = document.getElementById("login_or_user");

  login.addEventListener("click", async function () {
    const response = await fetch("http://localhost:5000/api/check-auth", {
      method: 'GET',
      credentials: "include"
    });
    const data = await response.json();

    if (data.authenticated) {
      window.location.href = "../user_page/user.html"; // هدایت به صفحه حساب کاربری
    } else {
      window.location.href = "../Login/login.html"; // هدایت به صفحه ورود
    }
  });
});