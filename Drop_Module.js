const DropModule = (() => {
  const defaultSettings = {
    JSONFile: "./drops.json", // Where to access the file for the drops
    dropContainer: "drop-container", // Container that will display everything in
    loadingMessage: "Loading...",
    errorMessage: "Error loading data. Please try again.",
    decimalPlaces: 2,
    showRarityColors: true,
    Boxes: "Boxes", // What is the first thing in your JSON? EX: Line 2 ("Boxes": [])
  };

  let settings = { ...defaultSettings };

  function loadSettings() {
    const storedSettings = localStorage.getItem("dropSettings");
    if (storedSettings) {
      settings = JSON.parse(storedSettings);
      console.log("Loaded settings from local storage: ", settings);
    } else {
      console.warn("No settings found in local storage. Using defaults.");
    }
  }

  function saveSettings() {
    localStorage.setItem("dropSettings", JSON.stringify(settings));
    console.log("Settings saved: ", settings);
  }

  async function fetchDrops() {
    const container = document.getElementById(settings.dropContainer);
    console.log("Container: ", container);

    if (!container) {
      console.warn(`Element with ID ${settings.dropContainer} not found.`);
      return;
    }

    container.innerHTML = `<p>${settings.loadingMessage}</p>`;

    try {
      const response = await fetch(settings.JSONFile);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return data[`${defaultSettings.Boxes}`];
    } catch (error) {
      console.error("Failed to fetch drops: ", error);
      container.innerHTML = `<p>${settings.errorMessage}</p>`;
    }
  }

  function renderDrop(object) {
    const container = document.getElementById(settings.dropContainer);
    container.innerHTML = ""; // Clears any old data

    object.forEach((box) => {
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

  async function updateDrop() {
    const object = await fetchDrops();
    if (object) {
      renderDrop(object);
      saveSettings(); // Save settings after updating
    }
  }

  return {
    initialize: () => {
      loadSettings(); // Loads the settings from local Storage
      updateDrop(); // Initial Load
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

// 2 more settings in here
document.addEventListener("DOMContentLoaded", () => {
  const updateID = "update-drop-rates";
  const saveID = "save-settings";

  DropModule.initialize();

  document.getElementById(updateID).addEventListener("click", () => {
    DropModule.updateDrop();
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
