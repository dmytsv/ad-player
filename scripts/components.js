(function () {
  const {CONSTANTS} = window;
  if (!CONSTANTS) throw new Error('Please include constants.js as a first script')

  const renderCard = ({ title, description, content }) => {
    const card = document.createElement("div");
    card.classList.add("showcard");
    card.innerHTML = `
              <img src="${content.thumbnail}" />

              `;
    card.setAttribute("data-title", title);
    card.setAttribute("data-description", description);
    card.addEventListener('click', e => {
      document.dispatchEvent(new CustomEvent(CONSTANTS.EVENTS.PLAY, {detail: {title, url: content.video}}))
    })
    return card;
  };

  const renderCategory = ({ category }) => {
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category");

    const title = document.createElement("h2");
    title.innerText = category;
    const leftArrow = document.createElement("div");
    leftArrow.classList.add("arrow", "arrow-left");
    leftArrow.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    const rightArrow = document.createElement("div");
    rightArrow.classList.add("arrow", "arrow-right");
    rightArrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';

    const showContainer = document.createElement("div");
    showContainer.classList.add("shows");

    categoryContainer.append(leftArrow, rightArrow);
    categoryContainer.append(title, showContainer);


    const isScrollPossible = () => {
      if (showContainer.scrollWidth < window.innerWidth) return [false, false];
      const leftScroll =
        showContainer.firstChild.getBoundingClientRect().left < 0;
      const rightScroll =
        showContainer.lastChild.getBoundingClientRect().right >
        window.innerWidth;

      return [leftScroll, rightScroll];
    };
    const showArrowsIfNeeded = () => {
      const [leftScroll, rightScroll] = isScrollPossible();
      categoryContainer.setAttribute("scroll-left", leftScroll);
      categoryContainer.setAttribute("scroll-right", rightScroll);
    };

    const mutationCallback = (mutationList, _observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          showArrowsIfNeeded();
        }
      }
    };
    const observer = new MutationObserver(mutationCallback);
    const config = { childList: true };
    observer.observe(showContainer, config);

    const scrollOffset = 200
    leftArrow.addEventListener('click', (e) => {
      const scrollDistance = window.innerWidth - scrollOffset;
      const x = Math.max(showContainer.scrollLeft - scrollDistance, 0)
      showContainer.scroll(x, 0)
    })
    rightArrow.addEventListener('click', (e) => {
      const scrollDistance = window.innerWidth - scrollOffset;
      const x = Math.min(showContainer.scrollLeft + scrollDistance, showContainer.scrollWidth);
      showContainer.scroll(x, 0)
    })

    let resizeId = null;
    window.addEventListener("resize", () => {
      if (resizeId) {
        cancelAnimationFrame(resizeId);
      }
      resizeId = requestAnimationFrame(() => {
        showArrowsIfNeeded();
        resizeId = null;
      });
    });
    let scrollId = null;
    showContainer.addEventListener("scroll", () => {
      if (scrollId) {
        cancelAnimationFrame(scrollId);
      }
      scrollId = requestAnimationFrame(() => {
        showArrowsIfNeeded();
        scrollId = null;
      });
    });

    return { categoryContainer, showContainer };
  };
  const helpers = { renderCard, renderCategory };
  Object.freeze(helpers);
  window.helpers = helpers;
})();
