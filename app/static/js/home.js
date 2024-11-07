

document.addEventListener("DOMContentLoaded", function() {
    //initializeHeader()
});

function initializeHeader() {
    const navbar = document.getElementById("navbar");
    navbar.innerHTML = `
        <a href="{{url_for('home.home_page')}}">HOME</a>
        <a href="{{url_for('how_to_use.how_to_use_page')}}">HOW TO USE</a>
        <a href="{{url_for('about_us.about_us_page')}}">ABOUT US</a>
        <a href="{{url_for('donate.donate_page')}}">DONATE</a>
        <a href="{{url_for('donate.donate_page')}}">HI</a>
    `;
    console.log("navbar: "+navbar);
}
