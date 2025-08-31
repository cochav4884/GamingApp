// script.js

function openNav(sidebarName, mainClass) {
  const sidebar = document.getElementById(sidebarName + 'Sidebar');
  if (sidebar) {
    sidebar.style.width = "250px";
  }

  const main = document.getElementById("main");
  if (main) {
    main.classList.add(mainClass + "-open");
  }
}

function closeNav(sidebarName, mainClass) {
  const sidebar = document.getElementById(sidebarName + 'Sidebar');
  if (sidebar) {
    sidebar.style.width = "0";
  }

  const main = document.getElementById("main");
  if (main) {
    main.classList.remove(mainClass + "-open");
  }
}

// Optional: Close other right sidebars when opening one
const rightTabs = ['Background', 'ArrowBow', 'AxeClub'];
rightTabs.forEach(tab => {
  const tabElement = document.getElementById(tab + 'Tab');
  if (tabElement) {
    tabElement.addEventListener('click', () => {
      rightTabs.forEach(other => {
        if (other !== tab) closeNav(other, rightTabs.indexOf(other) + 1 === 1 ? 'right1' : (rightTabs.indexOf(other) + 1 === 2 ? 'right2' : 'right3'));
      });
    });
  }
});
