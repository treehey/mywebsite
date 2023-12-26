function timeline() {
    var id = document.querySelector('#shell')
    var items = id.querySelectorAll(".item");
    var activeClass = "item--active";
    var img = "img";

    items[0].classList.add(activeClass);
    id.style.backgroundImage =
        "url(" +
        items[0]
            .querySelector(img)
            .getAttribute("src") +
        ")";

    var itemLength = items.length;
    window.addEventListener("scroll", function () {
        var pos = window.scrollY
        items.forEach(function (item, i) {
            var min = item.offsetTop;
            var max = item.offsetTop + item.offsetHeight/2;
            if (
                i === itemLength - 1 &&
                pos > min + item.offsetHeight
            ) {
                // removeActiveClass(items);
                id.style.backgroundImage =
                    "url(" +
                    items[items.length - 1]
                        .querySelector(img)
                        .getAttribute("src") +
                    ")";
                items[items.length - 1].classList.add(activeClass);
            } else if (pos >= min + item.offsetHeight/1.5) {
                id.style.backgroundImage =
                    "url(" +
                    item.querySelector(img).getAttribute("src") +
                    ")";
                // removeActiveClass(items);
                item.classList.add(activeClass);
            } else if (pos < max) {
                item.classList.remove(activeClass);
            }
        });
    });


    function removeActiveClass(items) {
        items.forEach(function (item) {
            item.classList.remove(activeClass);
        });
    }
}

timeline();