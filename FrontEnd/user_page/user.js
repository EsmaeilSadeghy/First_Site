function showSection(sectionId) {
  // مخفی کردن همه بخش‌ها
  const sections = document.querySelectorAll(".section-content");
  sections.forEach((section) => section.classList.add("d-none"));

  // نمایش بخش انتخاب‌شده
  const activeSection = document.getElementById(sectionId);
  activeSection.classList.remove("d-none");

  // فعال کردن لینک انتخابی
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => item.classList.remove("active"));
  document
    .querySelector(`[onclick="showSection('${sectionId}')"]`)
    .classList.add("active");
}