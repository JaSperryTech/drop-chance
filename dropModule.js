const DropRateModule = (() => {
  const defaultSettings = {
    dropJSON: "drops.json",
    dropRateContainer: "drop-rate-container",
    loadingMessage: "Loading...",
    errorMessage: "Error loading data. Please try again.",
    decimalPlaces: 2,
    showRarityColors: true,
  };

  let settings = { ...defaultSettings };

  function loadSettingsFromStorage() {
    const storedSettings = localStorage.getItem("dropSettings");
    if (storedSettings) {
      settings = JSON.parse(storedSettings);
      console.log("Loaded settings from local storage:", settings);
    } else {
      console.log("No settings found in local storage. Using defaults.");
    }
  }

  function saveSettings() {
    localStorage.setItem("dropSettings", JSON.stringify(settings));
    console.log("Settings saved:", settings);
  }

  async function fetchDrops() {
    const container = document.getElementById(settings.dropRateContainer);
    console.log("Container:", container);

    if (!container) {
      console.error(`Element with ID ${settings.dropRateContainer} not found.`);
      return;
    }

    container.innerHTML = `<p>${settings.loadingMessage}</p>`;

    try {
      const response = await fetch(settings.dropJSON);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data.Boxes; // Return Boxes instead of categories
    } catch (error) {
      console.error("Failed to fetch drops:", error);
      container.innerHTML = `<p>${settings.errorMessage}</p>`;
    }
  }

  function renderDropRates(boxes) {
    const container = document.getElementById(settings.dropRateContainer);
    container.innerHTML = ""; // Clears any old data

    boxes.forEach((box) => {
      // Create a div for the box
      const boxDiv = document.createElement("div");
      boxDiv.classList.add("box");
      const boxTitle = document.createElement("h2");
      boxTitle.textContent = box.name;
      boxDiv.appendChild(boxTitle);

      // Render each category in the box
      box.categories.forEach((category) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category");

        const categoryTitle = document.createElement("h3");
        categoryTitle.textContent = category.name;
        categoryDiv.appendChild(categoryTitle);

        category.items.forEach((item) => {
          const itemDiv = document.createElement("div");
          if (settings.showRarityColors) {
            itemDiv.classList.add("drop-item", item.rarity);
          } else {
            itemDiv.classList.add("drop-item");
          }

          itemDiv.innerHTML = `
            <span>${item.name}:</span>
            <span class="drop-rate">${(item.dropRate * 100).toFixed(
              settings.decimalPlaces
            )}%</span>
          `;

          categoryDiv.appendChild(itemDiv);
        });

        boxDiv.appendChild(categoryDiv); // Append category to box
      });

      container.appendChild(boxDiv); // Append box to main container
    });
  }

  async function updateDropRates() {
    const boxes = await fetchDrops();
    if (boxes) {
      renderDropRates(boxes);
      saveSettings(); // Save settings after updating
    }
  }

  return {
    initialize: () => {
      loadSettingsFromStorage(); // Load settings from local storage
      updateDropRates(); // Initial load
    },
    setSettings: (newSettings) => {
      settings = { ...settings, ...newSettings }; // Merge new settings with existing ones
      saveSettings();
      updateDropRates(); // Update drop rates with new settings
    },
    updateDropRates() {
      updateDropRates();
    },
  };
})();

// Initialize the module on page load
document.addEventListener("DOMContentLoaded", () => {
  DropRateModule.initialize();

  document.getElementById("update-drop-rates").addEventListener("click", () => {
    DropRateModule.updateDropRates();
  });

  document.getElementById("save-settings").addEventListener("click", () => {
    const apiEndpointInput = document.getElementById("api-endpoint").value;
    const decimalPlacesInput = parseInt(
      document.getElementById("decimal-places").value,
      10
    );
    const showRarityColorsInput =
      document.getElementById("show-rarity-colors").checked;

    DropRateModule.setSettings({
      dropJSON: apiEndpointInput,
      decimalPlaces: decimalPlacesInput,
      showRarityColors: showRarityColorsInput,
    });
  });
});
