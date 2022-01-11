function hamburgerMove() {
    var sidebar = document.getElementById("sidebar-hook");
    var hamburger = document.getElementById("hamburger-hook");
    sidebar.classList.toggle("open");
    hamburger.classList.toggle("hamburger-cross");
}