function timeline(shell) {
    var id = shell
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
        var pos = window.scrollY || document.documentElement.scrollTop;
        Array.prototype.forEach.call(items, function (item, i) {
            var min = item.offsetTop;
            var max = item.offsetTop + item.clientHeight;
            if (
                i === itemLength - 2 &&
                pos > min + item.clientHeight / 2
            ) {
                removeActiveClass(items);
                id.style.backgroundImage =
                    "url(" +
                    items[items.length - 1]
                        .querySelector(img)
                        .getAttribute("src") +
                    ")";
                items[items.length - 1].classList.add(activeClass);
            } else if (pos <= max - 10 && pos >= min) {
                id.style.backgroundImage =
                    "url(" +
                    item.querySelector(img).getAttribute("src") +
                    ")";
                removeActiveClass(items);
                item.classList.add(activeClass);
            }
        });
    });
}

function removeActiveClass(items) {
    Array.prototype.forEach.call(items, function (item) {
        item.classList.remove(activeClass);
    });
}

var shell = document.querySelector('#shell')
timeline(shell);