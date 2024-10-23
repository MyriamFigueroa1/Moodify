document.getElementById("menu-toggle").addEventListener("click", function() {
    let sidebar = document.getElementById("sidebar-wrapper");
    let content = document.getElementById("page-content-wrapper");
    
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
        content.style.paddingLeft = "0";
    } else {
        sidebar.style.width = "250px";
        content.style.paddingLeft = "250px";
    }
});
