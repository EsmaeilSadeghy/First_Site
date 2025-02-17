document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  initializeSearchFormToggle();
  initializeScrollButton();
  loadProductData();
});

// نمایش تب‌ها
function initializeTabs() {
  const triggerTabList = Array.from(
    document.querySelectorAll("#product-details-tab a")
  );

  triggerTabList.forEach((triggerEl) => {
    const tabTrigger = new bootstrap.Tab(triggerEl);
    triggerEl.addEventListener("click", (event) => {
      event.preventDefault();
      tabTrigger.show();
    });
  });
}

// نمایش و پنهان کردن فرم جستجو
function initializeSearchFormToggle() {
  const searchIcon = document.getElementById("searchIcon");
  const searchForm = document.getElementById("searchForm");

  if (!searchIcon || !searchForm) return;

  searchIcon.addEventListener("click", function (e) {
    e.preventDefault();
    searchForm.classList.toggle("d-none");
  });
}

// نمایش دکمه بازگشت به بالا
function initializeScrollButton() {
  const scrollBtn = document.getElementById("scrollBtn");
  if (!scrollBtn) return;

  const toggleScrollBtn = () => {
    scrollBtn.style.display = window.scrollY > 100 ? "block" : "none";
  };

  window.addEventListener("scroll", debounce(toggleScrollBtn, 100));

  scrollBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  toggleScrollBtn(); // بررسی اولیه هنگام بارگذاری صفحه
}

// تابع debounce برای کاهش اجرای یک تابع در اسکرول
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// دریافت اطلاعات محصول از JSON و نمایش آن
function loadProductData() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    console.error("محصولی انتخاب نشده است!");
    return;
  }

  fetch("../products.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات محصول");
      }
      return response.json();
    })
    .then((products) => {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        console.error("محصول یافت نشد!");
        return;
      }

      // انتخاب عناصر DOM با بررسی مقدار
      const productName = document.getElementById("product-name");
      const priceValue = document.getElementById("priceValue");
      const dropdownButton = document.getElementById("dropdownMenuButton");
      const descriptionText = document.querySelector(
        "#description p:nth-child(2)"
      );

      if (productName) productName.textContent = product.name;
      if (priceValue)
        priceValue.textContent = product?.packaging?.[0]?.price ?? "نامشخص";
      if (dropdownButton)
        dropdownButton.textContent =
          product?.packaging?.[0]?.weight ?? "نامشخص";
      if (descriptionText) descriptionText.textContent = product.description;

      // نمایش تصاویر محصول (در صورت وجود)
      product.images?.forEach((image, index) => {
        const imgElement = document.getElementById(`product-image${index + 1}`);
        if (imgElement) imgElement.src = image;
      });

      // مقداردهی دراپ‌داون
      if (product.packaging) {
        initializeDropdownMenu(product.packaging);
      }
    })
    .catch((error) =>
      console.error("خطا در دریافت اطلاعات محصول:", error.message)
    );
}

// مقداردهی و مدیریت دراپ‌داون بسته‌بندی‌ها
function initializeDropdownMenu(packaging) {
  const priceDisplay = document.getElementById("priceValue");
  const dropdownButton = document.getElementById("dropdownMenuButton");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (!dropdownMenu || !priceDisplay || !dropdownButton) return;

  dropdownMenu.innerHTML = ""; // پاک کردن مقادیر قبلی

  packaging.forEach((pack, index) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.classList.add("dropdown-item");
    link.textContent = pack.weight;
    link.setAttribute("data-weight", pack.weight);
    link.setAttribute("data-price", pack.price);

    if (index === 0) link.classList.add("active");

    link.addEventListener("click", function (event) {
      event.preventDefault();
      dropdownButton.textContent = this.getAttribute("data-weight");
      priceDisplay.textContent = this.getAttribute("data-price");

      document
        .querySelectorAll(".dropdown-item")
        .forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });

    listItem.appendChild(link);
    dropdownMenu.appendChild(listItem);
  });

  // مقدار اولیه دکمه و قیمت
  dropdownButton.textContent = packaging[0]?.weight ?? "نامشخص";
  priceDisplay.textContent = packaging[0]?.price ?? "نامشخص";
}