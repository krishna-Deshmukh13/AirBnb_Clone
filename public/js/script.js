(() => {
  "use strict";

  // Bootstrap custom form validation
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false,
    );
  });

  // Tax switch toggle on home page
  const taxSwitch = document.getElementById("taxSwitch");
  if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {
      const taxInfoElements = document.querySelectorAll(".tax-info");
      taxInfoElements.forEach((el) => {
        if (taxSwitch.checked) {
          el.classList.remove("d-none");
        } else {
          el.classList.add("d-none");
        }
      });
    });
  }

  // Interactive Category Filter Bar
  const categoryItems = document.querySelectorAll(".category-item");
  const listingItems = document.querySelectorAll(".listing-item");

  if (categoryItems.length && listingItems.length) {
    const categoryKeywords = {
      beach: ["beach", "ocean", "coastal", "surf", "sea", "shore", "island", "paradise"],
      cities: ["loft", "city", "downtown", "apartment", "urban", "tokyo", "york", "flat"],
      mountain: ["mountain", "cabin", "retreat", "aspen", "alps", "peak", "hills", "cliff"],
      pools: ["pool", "villa", "resort", "luxury", "swimming", "palace"],
      castles: ["castle", "historic", "villa", "tuscany", "manor", "chateau", "heritage"],
      camping: ["camp", "tent", "nature", "wilderness", "glamping", "safari"],
      rooms: ["room", "suite", "bed", "studio", "loft"],
      farms: ["farm", "barn", "ranch", "countryside", "vineyard"],
      arctic: ["arctic", "snow", "ski", "chalet", "winter", "ice"],
      lake: ["lake", "lakefront", "boat", "waterfront", "dock", "river"],
      cabins: ["cabin", "chalet", "log", "wood", "forest", "treehouse"]
    };

    categoryItems.forEach((cat) => {
      cat.addEventListener("click", () => {
        categoryItems.forEach((c) => c.classList.remove("active"));
        cat.classList.add("active");

        const selectedCat = cat.getAttribute("data-category");

        if (selectedCat === "all") {
          listingItems.forEach((item) => (item.style.display = ""));
          return;
        }

        const keywords = categoryKeywords[selectedCat] || [];
        let matchCount = 0;

        listingItems.forEach((item) => {
          const title = item.getAttribute("data-title") || "";
          const desc = item.getAttribute("data-desc") || "";
          const loc = item.getAttribute("data-location") || "";
          const country = item.getAttribute("data-country") || "";

          const isMatch = keywords.some(
            (kw) =>
              title.includes(kw) ||
              desc.includes(kw) ||
              loc.includes(kw) ||
              country.includes(kw),
          );

          if (isMatch) {
            item.style.display = "";
            matchCount++;
          } else {
            item.style.display = "none";
          }
        });

        // If no strict match for that category, show all to keep experience smooth
        if (matchCount === 0) {
          listingItems.forEach((item) => (item.style.display = ""));
        }
      });
    });
  }

  // Live Instant Search Filter in Navbar
  const searchInput = document.getElementById("searchInput");
  if (searchInput && listingItems.length) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      listingItems.forEach((item) => {
        const title = item.getAttribute("data-title") || "";
        const loc = item.getAttribute("data-location") || "";
        const country = item.getAttribute("data-country") || "";
        const desc = item.getAttribute("data-desc") || "";

        if (
          !term ||
          title.includes(term) ||
          loc.includes(term) ||
          country.includes(term) ||
          desc.includes(term)
        ) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
})();

// Wishlist heart button toggle
function toggleWishlist(event, btn) {
  event.preventDefault();
  event.stopPropagation();
  btn.classList.toggle("active");
}

// Live Image URL Preview on Create/Edit Forms
function previewListingImage(url) {
  const preview = document.getElementById("imagePreview");
  const container = document.getElementById("imagePreviewContainer");
  if (preview && url && url.startsWith("http")) {
    preview.src = url;
    if (container) container.classList.remove("d-none");
  }
}
