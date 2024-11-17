

document.addEventListener("DOMContentLoaded", function() {
    initializeHeader()
});

function initializeHeader() {
    const homeUrl = navbar.getAttribute("data-home-url");
    const howToUseUrl = navbar.getAttribute("data-how-to-use-url");
    const aboutUsUrl = navbar.getAttribute("data-about-us-url");
    const donateUrl = navbar.getAttribute("data-donate-url");
    const profileUrl = navbar.getAttribute("data-profile-url");
    
    // Build navbar HTML
    let navbarHTML = `
        <a href="${homeUrl}">HOME</a>
        <a href="${howToUseUrl}">HOW TO USE</a>
        <a href="${aboutUsUrl}">ABOUT US</a>
        <a href="${donateUrl}">DONATE</a>
        <a href="${profileUrl}">HI</a>
    `;
    navbar.innerHTML = navbarHTML;
}
