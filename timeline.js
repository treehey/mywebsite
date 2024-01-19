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

    function throttle(fn, delay = 1000) {
        // 节流开关				
        let run = true;
        // 返回函数				
        return function () {
            if (!run) {
                return;
            }
            let timer = setTimeout(() => {
                fn.apply(this, arguments);
                window.clearTimeout(timer);
                run = true;
            }, delay);

            run = false;
        }
    }

    let throttled = throttle(function () {
        var pos = window.scrollY
        items.forEach(function (item, i) {
            var min = item.offsetTop;
            var max = item.offsetTop + item.offsetHeight / 2;
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
            } else if (pos >= min + item.offsetHeight / 1.5 && pos < min + item.offsetHeight * 1.5) {
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


    window.addEventListener("scroll", throttled);


    function removeActiveClass(items) {
        items.forEach(function (item) {
            item.classList.remove(activeClass);
        });
    }
}

timeline();