// Wait until the document is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 60, // Adjust for header height
          behavior: "smooth"
        });
      }
    });
  });

  // Accordion functionality for advanced content sections
  const accordions = document.querySelectorAll(".accordion-header");
  accordions.forEach(header => {
    header.addEventListener("click", function() {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // Back-to-top button functionality
  const backToTopButton = document.getElementById("back-to-top");
  window.addEventListener("scroll", function() {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  });

  backToTopButton.addEventListener("click", function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
