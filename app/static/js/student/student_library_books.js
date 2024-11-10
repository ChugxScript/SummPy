document.addEventListener("DOMContentLoaded", function() {
    setOnclickOnCards();
});

function setOnclickOnCards(){
    const main_content_container = document.getElementById("main_content_container");
    const study_card_details = document.querySelectorAll(".study-card-details");
    const view_book_details_container = document.getElementById("view_book_details_container");
    const back_button = document.getElementById("back_button");

    study_card_details.forEach(cards => {
        cards.addEventListener('click', () => {
            main_content_container.style.display = "none";
            view_book_details_container.style.display = "flex";
        });
    });

    back_button.addEventListener('click', () => {
        main_content_container.style.display = "flex";
        view_book_details_container.style.display = "none";
    });
}