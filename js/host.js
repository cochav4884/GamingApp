// Select Host tab and sidebar
const hostTab = document.getElementById("HostTab");
const hostSidebar = document.getElementById("HostSidebar");
const hostCloseBtn = hostSidebar.querySelector(".closebtn");

// Open Host sidebar when tab is clicked
hostTab.addEventListener("click", () => {
  hostSidebar.style.width = "300px"; // adjust as needed
});

// Close Host sidebar
hostCloseBtn.addEventListener("click", () => {
  hostSidebar.style.width = "0";
});
