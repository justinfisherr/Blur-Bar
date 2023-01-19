let enterButton = document.querySelector(".settings-enter");
let refreshContainer = document.querySelector(".settings-enter-container");
let blurButton = document.querySelector(".blur-bar");
let heightLimitText = document.querySelector(".height-text");
let onHoverText = document.querySelector(".hover-text");
let heightLimitInput = document.querySelector(".height-check");
let onHoverInput = document.querySelector(".pause-on-hover");
let settingsForm = document.querySelector(".settings-form");
let inputs = document.getElementsByClassName("input");
let pauseOnHoverCheckBox = inputs[1];
let heightLimitCheckBox = inputs[0];
let onHoverContainer = document.querySelector(".slider-wrapper");
let scrubSlider = document.querySelector(".scrub-slider");
let sliderContainer = document.querySelector(".slider-container");
let sliderValue = document.querySelector(".slider-value");
let versionText = document.querySelector(".version");
let mainContainer = document.querySelector(".container");
let errorMessage = document.querySelector(".error-message");
let secondsText;
let intialHeightLimit;
let intialHover;
let intialScrub;
let setToIntialScrub = false;
let refreshContainerShowing = false;
refreshContainer.remove();
chrome.action.setBadgeText({ text: "" });

async function grabAndSetVersion(versionText) {
  const response = await fetch("./manifest.json");
  const jsonObject = await response.json();
  const version = await jsonObject.version;
  versionText.textContent = `Blur Bar ${version}`;
}
grabAndSetVersion(versionText);
//Setting Value
chrome.storage.local.get(
  ["heightLimit", "pauseOnHover", "scrubBack"],
  (result) => {
    if (result.heightLimit === undefined) {
      chrome.storage.local.set({
        heightLimit: true,
      });
      heightLimitInput.checked = true;
    } else {
      heightLimitInput.checked = result.heightLimit;
    }

    if (result.pauseOnHover === undefined) {
      chrome.storage.local.set({
        pauseOnHover: true,
      });
      onHoverInput.checked = true;
    } else {
      onHoverInput.checked = result.pauseOnHover;
    }
    if (result.scrubBack === undefined) {
      chrome.storage.local.set({
        scrubBack: 1,
      });
      scrubSlider.value = 1;
    } else {
      scrubSlider.value = result.scrubBack;
    }
    intialHeightLimit = heightLimitInput.checked;
    intialHover = onHoverInput.checked;

    if (scrubSlider.value === "0")
      scrubSlider.classList.add("scrub-slider-zero");

    secondsText = scrubSlider.value === "1" ? "Second" : "Seconds";
    sliderValue.textContent = `${scrubSlider.value} ${secondsText}`;

    intialHover
      ? onHoverContainer.append(sliderContainer)
      : sliderContainer.remove();
  }
);
//Error Handle

chrome.storage.local.get(["error"], (result) => {
  if (result.error) {
    mainContainer.style.display = "none";
    errorMessage.style.display = "block";
    chrome.action.setBadgeText({ text: "!" });
  } else {
    mainContainer.style.display = "block";
    errorMessage.style.display = "none";
  }
});

scrubSlider.addEventListener("input", () => {
  if (!refreshContainerShowing) {
    chrome.storage.local.set({
      scrubBack: scrubSlider.value,
    });
  } else {
    setToIntialScrub = true;
  }
  scrubSlider.value === "0"
    ? scrubSlider.classList.add("scrub-slider-zero")
    : scrubSlider.classList.remove("scrub-slider-zero");

  secondsText = scrubSlider.value === "1" ? "Second" : "Seconds";
  sliderValue.textContent = `${scrubSlider.value} ${secondsText}`;
});

pauseOnHoverCheckBox.addEventListener("change", () => {
  if (!refreshContainerShowing && onHoverInput.checked != intialHover) {
    settingsForm.append(refreshContainer);
    refreshContainerShowing = true;
  } else if (
    refreshContainerShowing &&
    heightLimitInput.checked === intialHeightLimit
  ) {
    refreshContainerShowing = false;
    refreshContainer.remove();
  }
  onHoverInput.checked
    ? onHoverContainer.append(sliderContainer)
    : sliderContainer.remove();

  if (setToIntialScrub && !onHoverInput.checked) {
    scrubSlider.value = intialScrub;
    sliderValue.textContent = `${scrubSlider.value} ${secondsText}`;
  }
});

heightLimitCheckBox.addEventListener("change", () => {
  if (
    !refreshContainerShowing &&
    heightLimitInput.checked != intialHeightLimit
  ) {
    settingsForm.append(refreshContainer);
    refreshContainerShowing = true;
  } else if (refreshContainerShowing && onHoverInput.checked === intialHover) {
    refreshContainerShowing = false;
    refreshContainer.remove();
  }
});

onHoverText.addEventListener("click", () => {
  onHoverInput.checked = !onHoverInput.checked;
  if (!refreshContainerShowing && onHoverInput.checked != intialHover) {
    settingsForm.append(refreshContainer);
    refreshContainerShowing = true;
  } else if (
    refreshContainerShowing &&
    heightLimitInput.checked === intialHeightLimit
  ) {
    refreshContainerShowing = false;
    refreshContainer.remove();
  }
  onHoverInput.checked
    ? onHoverContainer.append(sliderContainer)
    : sliderContainer.remove();
  if (setToIntialScrub && !onHoverInput.checked) {
    scrubSlider.value = intialScrub;
    sliderValue.textContent = `${scrubSlider.value} ${secondsText}`;
  }
});

heightLimitText.addEventListener("click", () => {
  heightLimitInput.checked = !heightLimitInput.checked;
  if (
    !refreshContainerShowing &&
    heightLimitInput.checked != intialHeightLimit
  ) {
    settingsForm.append(refreshContainer);
    refreshContainerShowing = true;
  } else if (refreshContainerShowing && onHoverInput.checked === intialHover) {
    refreshContainerShowing = false;
    refreshContainer.remove();
  }
});

enterButton.addEventListener("click", () => {
  chrome.storage.local.set({
    //settings:
    heightLimit: heightLimitInput.checked,
    pauseOnHover: onHoverInput.checked,
    scrubBack: scrubSlider.value,
  });

  chrome.tabs.reload();
  window.close();
});
