let injected = false;
let blurBarActive = false;
let blurBarIconActive = false;
let index = 0;

const ke = new KeyboardEvent("keydown", {
  bubbles: true,
  cancelable: true,
  keyCode: 188,
});
chrome.storage.local.set({
  error: false,
});

function addBtn() {
  let blurBtns = []; // Create an array to store the buttons

  let controls = document.querySelectorAll(".ytp-right-controls");
  controls.forEach((controlMenu) => {
    let blurBtn = document.createElement("button");

    blurBtn.className = "blur";
    blurBtn.type = "button";
    blurBtn.title = "Blur Bar";

    controlMenu.insertBefore(blurBtn, controlMenu.firstChild);

    blurBtns.push(blurBtn); // Add the button to the array
  });

  return blurBtns; // Return the array of buttons
}

function addBlurBar() {
  var blurBar = document.createElement("div");
  blurBar.className = "blur-bar";

  let btnToggle = document.createElement("div");
  btnToggle.className = "toggle";

  blurBar.append(btnToggle);

  let video = document.getElementById("ytd-player");

  video = video.getElementsByClassName("html5-video-player")[0];

  video.append(blurBar);

  return blurBar;
}
function hidePlayUi(pausePlayUI) {
  pausePlayUI.remove();
}
function videoStop(video, pausePlayUI, videoStream, scrubBack) {
  let paused = video.className.includes("paused-mode") ? 1 : 0;
  if (!paused) {
    videoStream.pause();
    hidePlayUi(pausePlayUI);
  }
  videoStream.currentTime -= scrubBack;
}
function videoPlay(video, pausePlayUI, videoStream) {
  let playing = video.className.includes("playing-mode") ? 1 : 0;
  if (!playing) {
    videoStream.play();
  }
  hidePlayUi(pausePlayUI);
}
function hideBlurBar(blurBar, video, pausePlayUI, videoStream) {
  blurBar.style.opacity = "0";
  chrome.storage.local.get(
    ["pauseOnHover", "scrubBack"],
    function ({ pauseOnHover, scrubBack }) {
      if (pauseOnHover) {
        videoStop(video, pausePlayUI, videoStream, scrubBack);
      }
    }
  );
}
function showBlurBar(blurBar, video, pausePlayUI, videoStream) {
  blurBar.style.opacity = "1";
  chrome.storage.local.get(
    ["pauseOnHover", "scrubBack"],
    function ({ pauseOnHover }) {
      if (pauseOnHover) {
        videoPlay(video, pausePlayUI, videoStream);
      }
    }
  );
}
function hideBlurBarUi(toggle, resizeable) {
  toggle.style.display = "none";
  resizeable.style.display = "none";
}
function showBlurBarUi(toggle, resizeable) {
  toggle.style.display = "block";
  resizeable.style.display = "block";
}

function hideYoutubeElements(
  videoMenu,
  gradientOnHover,
  iconOnHover,
  topButtons,
  gradientTop,
  subIcon
) {
  videoMenu.style.display = "none";
  gradientOnHover.style.display = "none";
  iconOnHover.style.display = "none";
  topButtons.style.display = "none";
  gradientTop.style.display = "none";
  if (subIcon) {
    for (let i = 0; i < subIcon.length; i++) {
      subIcon[i].style.display = "none";
    }
  }
}
function showYoutubeElements(
  video,
  videoMenu,
  gradientOnHover,
  iconOnHover,
  topButtons,
  gradientTop,
  subIcon,
  pausePlayUI
) {
  videoMenu.style.display = "block";
  gradientOnHover.style.display = "block";
  iconOnHover.style.display = "block";
  topButtons.style.display = "flex";
  gradientTop.style.display = "block";
  if (subIcon) {
    for (let i = 0; i < subIcon.length; i++) {
      subIcon[i].style.display = "block";
    }
  }

  video.appendChild(pausePlayUI);
}
function blurButtonHandleClick(video, blurBar, blurBtn) {
  let centeredLeft = (video.offsetWidth - video.offsetWidth * 0.8) / 2;
  video.focus();
  if (!blurBarActive && blurBarIconActive) {
    blurBar.style.display = "flex";
    blurBtn.style.backgroundImage = "url('https://i.imgur.com/zRjwzJv.png')";
    blurBarActive = true;
    blurBar.style.left = `${(centeredLeft / video.offsetWidth) * 100}%`;
    blurBar.style.top = "75%";
    blurBar.style.height = "10%";
    blurBar.style.width = "80%";
    blurBar.style.opacity = "1";
    adjustMaximumHeight(video, blurBar);
  } else {
    blurBar.style.display = "none";
    blurBtn.style.backgroundImage = "url('https://i.imgur.com/xG4zQb3.png')";
    blurBarActive = false;
  }
}
function adjustMaximumHeight(video, blurBar) {
  let videoHeight = parseInt(getComputedStyle(video).height) / 10;
  chrome.storage.local.get(["heightLimit"], function (result) {
    if (result.heightLimit) {
      $(document).ready(function () {
        $(blurBar).resizable({
          containment: "parent",
          minHeight: videoHeight - 15,
        });
      });
    } else {
      $(document).ready(function () {
        $(blurBar).resizable({
          containment: "parent",
        });
      });
    }
  });
}

function inject() {
  let blurBar;
  let blurBtns = [];

  try {
    blurBtns = addBtn();
    blurBar = addBlurBar();
  } catch {
    document.querySelector(".blur").remove();
    document.querySelector(".blur-bar").remove();
    return;
  }

  let toggleBtn = document.getElementsByClassName("toggle")[0];
  let video = document.getElementById("movie_player");
  let videoStream = document.getElementsByClassName("html5-main-video")[index];
  let videoMenu = document.getElementsByClassName("ytp-chrome-bottom")[index];
  let topButtons = document.getElementsByClassName("ytp-chrome-top")[index];
  let gradientOnHover = document.getElementsByClassName("ytp-gradient-bottom")[
    index
  ];
  let iconOnHover = document.getElementsByClassName("ytp-cards-button")[index];
  let subIcon = document.getElementsByClassName("annotation-type-custom")[
    index
  ];

  let gradientTop = document.getElementsByClassName("ytp-gradient-top")[index];

  let pausePlayUI = document.getElementsByClassName("ytp-bezel-text-wrapper")[
    index
  ].parentElement;

  //Jquery
  window.addEventListener("resize", (e) => {
    setTimeout(() => {
      adjustMaximumHeight(video, blurBar);
    }, 300);
  });

  $(document).ready(function () {
    $(blurBar).draggable({
      containment: "parent",
    });
  });
  //Jquery

  //Hover over Eye effect
  toggleBtn.addEventListener("mouseover", () => {
    hideBlurBar(blurBar, video, pausePlayUI, videoStream);
  });
  toggleBtn.addEventListener("mouseleave", () => {
    showBlurBar(blurBar, video, pausePlayUI, videoStream);
  });

  //controls//

  video.addEventListener("keyup", (e) => {
    if (e.key === "s" && blurBarIconActive) {
      if (blurBarActive) {
        hideBlurBar(blurBar, video, pausePlayUI, videoStream);
        blurBarActive = false;
      } else {
        showBlurBar(blurBar, video, pausePlayUI, videoStream);
        blurBarActive = true;
      }
    }
  });

  //Hover over effect //Blur box

  blurBar.addEventListener("mouseover", () => {
    hideYoutubeElements(
      videoMenu,
      gradientOnHover,
      iconOnHover,
      topButtons,
      gradientTop,
      subIcon
    );
    let blurBarResizable = blurBar.lastChild;
    showBlurBarUi(toggleBtn, blurBarResizable);
  });

  blurBar.addEventListener("mouseleave", () => {
    showYoutubeElements(
      video,
      videoMenu,
      gradientOnHover,
      iconOnHover,
      topButtons,
      gradientTop,
      subIcon,
      pausePlayUI
    );
    let blurBarResizable = blurBar.lastChild;
    hideBlurBarUi(toggleBtn, blurBarResizable);
  });

  videoStream.addEventListener("ended", () => {
    blurBar.style.display = "none";
    blurBtns.forEach((blurBtn) => {
      blurBtn.style.backgroundImage = "url('https://i.imgur.com/xG4zQb3.png')";
    });

    blurBarActive = false;
    blurBarIconActive = false;
  });
  videoStream.addEventListener("play", () => {
    if (blurBarIconActive && !blurBarActive) {
      showBlurBar(blurBar, video, pausePlayUI, videoStream);
    }
  });

  //Location and Size Tracker//
  blurBar.addEventListener("mouseup", () => {
    video.focus();
    let lPercentage =
      (parseFloat(blurBar.style.left) / video.offsetWidth) * 100;
    let tPercentage =
      (parseFloat(blurBar.style.top) / video.offsetHeight) * 100;
    let wPercentage =
      (parseFloat(blurBar.style.width) / video.offsetWidth) * 100;
    let hPercentage =
      (parseFloat(blurBar.style.height) / video.offsetHeight) * 100;

    setTimeout(() => {
      if (
        !blurBar.style.left.includes("%") ||
        !blurBar.style.top.includes("%")
      ) {
        blurBar.style.left = `${lPercentage}%`;
        blurBar.style.top = `${tPercentage}%`;
      }

      if (
        !blurBar.style.width.includes("%") &&
        !blurBar.style.height.includes("%")
      ) {
        blurBar.style.height = `${hPercentage}%`;
        blurBar.style.width = `${wPercentage}%`;
      } else if (!blurBar.style.width.includes("%")) {
        blurBar.style.width = `${wPercentage}%`;
      } else if (!blurBar.style.height.includes("%")) {
        blurBar.style.height = `${hPercentage}%`;
      }
    }, 10);
  });

  //Menu Click

  blurBtns.forEach((blurBtn) => {
    blurBtn.addEventListener("click", () => {
      blurBarIconActive = !blurBarIconActive;
      blurButtonHandleClick(video, blurBar, blurBtn);
    });
  });

  injected = true;
  console.log("injected!");
  chrome.storage.local.set({
    error: false,
  });
}

function tryInjectionWithRetries() {
  let intervalTries = 0;

  const injectInterval = setInterval(() => {
    if (intervalTries >= 3) {
      clearInterval(injectInterval);
    }

    ++intervalTries;

    if (injected) {
      clearInterval(injectInterval);
    } else {
      inject();
    }
  }, 500);
}
//Injects our CSS into youtube on navigate
document.body.addEventListener("yt-navigate-finish", () => {
  const includes = window.location.href.includes("watch");

  if (includes && !injected) {
    tryInjectionWithRetries();
  } else if (injected) {
    let blurBar = document.getElementsByClassName("blur-bar")[0];
    let blurBtn = document.getElementsByClassName("blur")[0];
    blurBar.style.display = "none";
    blurBtn.style.backgroundImage = "url('https://i.imgur.com/xG4zQb3.png')";
    blurBarActive = false;
    blurBarIconActive = false;
  }
});
