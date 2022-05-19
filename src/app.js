import { mapListToDOMElements, createDOMElem } from "./domInteractions.js";
import { getShowById, getShowsByKey, getShowCastById } from "./requests.js"
import { createCastSection } from './showCast.js'
class tvApp {
    constructor() {
        this.viewElems = {};
        this.showNameButtons = {};
        this.selectedName = "hello world";
        this.isDetailsOpen = false;
        if (localStorage.getItem('favourites') !== null) {
            this.favourites = JSON.parse(localStorage.getItem('favourites'));
        } else {
            this.favourites = [];
        }
        this.initializeApp();
    }

    initializeApp = () => {
        this.connectDOMElements();
        this.setupListeners();
        this.fetchAndDisplayShows();
    }

    connectDOMElements = () => {
        const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id);
        const listOfShowNames = Array.from(
            document.querySelectorAll('[data-show-name]')
        ).map(elem => elem.dataset.showName);

        this.viewElems = mapListToDOMElements(listOfIds, 'id');
        this.showNameButtons = mapListToDOMElements(listOfShowNames, 'data-show-name');
    }

    setupListeners = () => {
        // dropdown menu
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter);
        });

        // favourites
        this.viewElems.btnFavourites.addEventListener('click', this.showFavourites);

        // search menu
        this.viewElems.searchForm.addEventListener('submit', this.searchForShows);
    }

    setCurrentNameFilter = event => {
        this.selectedName = event.target.dataset.showName;
        this.fetchAndDisplayShows();
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => this.renderCardsOnList(shows));
    }

    renderCardsOnList = shows => {
        if (shows.length == 0) {
            const searchingShow = this.viewElems.searchForm.querySelector('input').value;
            this.viewElems.disclaimer.innerText = `We couldn't find any shows such as ${searchingShow}`;
        } else {
            this.viewElems.disclaimer.innerText = "";
        }

        Array.from(
            document.querySelectorAll('[data-show-id]')
        ).forEach(btn => {
            btn.removeEventListener('click', this.openDetailsView);
            btn.removeEventListener('click', this.toggleFavourite);
        });


        this.viewElems.showsWrapper.innerHTML = "";

        for (const { show } of shows) {
            const card = this.createShowCard(show);
            this.viewElems.showsWrapper.appendChild(card);
        }
    }

    openDetailsView = event => {
        // fixes the bug where user can open multiple detail views
        if (!this.isDetailsOpen) {
            this.isDetailsOpen = true;
            document.querySelector('body').style.overflowY = "hidden";
            const { showId } = event.target.dataset;
            getShowById(showId).then(show => {
                const card = this.createShowCard(show, true);
                const closeBtn = card.querySelectorAll('.card-body')[0].querySelector('button');
                closeBtn.classList.add('btn-danger')
                closeBtn.innerText = "Hide details";

                this.viewElems.showPreview.appendChild(card);
                this.viewElems.showPreview.style.display = "flex";
            });
        }
    }

    closeDetailsView = event => {
        this.isDetailsOpen = false;
        document.querySelector('body').style.overflowY = "auto";
        const { showId } = event.target.dataset;
        const closeBtn = document.querySelector(`[id="showPreview"] [data-show-id="${showId}"]`);
        closeBtn.removeEventListener('click', this.closeDetailsView);
        this.viewElems.showPreview.style.display = "none";
        this.viewElems.showPreview.innerHTML = "";
    }

    toggleFavourite = event => {
        const favId = event.target.dataset.showId;

        if (this.favourites.indexOf(favId) == -1) {
            this.favourites.push(favId);
            event.target.style.backgroundImage = 'url("../img/star_filled.svg")';
        } else {
            this.favourites.splice(this.favourites.indexOf(favId), 1);
            event.target.style.backgroundImage = 'url("../img/star.svg")';
        }

        localStorage.setItem('favourites', JSON.stringify(this.favourites));
    };

    createShowCard = (show, isDetailed) => {
        const divCard = createDOMElem('div', 'card');
        const divCardBody = createDOMElem('div', 'card-body');
        const main = createDOMElem('main', 'card-main');
        const h5 = createDOMElem('h5', 'card-title', show.name);
        const btnDiv = createDOMElem('div', 'btn-div')
        const btnDet = createDOMElem('button', 'btn btn-primary', 'Show details');
        const btnFav = createDOMElem('button', 'btn btn-warning btn--fav');

        if (this.favourites.indexOf(show.id.toString()) !== -1) {
            btnFav.style.backgroundImage = 'url("../img/star_filled.svg")';
        } else {
            btnFav.style.backgroundImage = 'url("../img/star.svg")';
        }

        let img, p;

        if (show.image) {
            if (isDetailed) {
                img = createDOMElem('div', 'card-preview-bg');
                img.style.backgroundImage = `url(${show.image.original})`;
            } else {
                img = createDOMElem('img', 'card-img-top', null, show.image.medium);
            }
        } else {
            if (isDetailed) {
                img = createDOMElem('div', 'card-preview-bg');
                img.style.backgroundImage = 'url(https://via.placeholder.com/210x295)';
            } else {
                img = createDOMElem('img', 'card-img-top', null, 'https://via.placeholder.com/210x295');
            }
        }

        if (show.summary) {
            const plainText = /<[^>]*>/g;
            const formatedSummary = show.summary.replace(plainText, "", show.summary);

            if (isDetailed) {
                p = createDOMElem('p', 'card-text', formatedSummary);
            } else {
                p = createDOMElem('p', 'card-text', `${formatedSummary.slice(0, 80)}...`);
            }
        } else {
            p = createDOMElem('p', 'card-text', 'There is no summary for that show yet.');
        }

        btnDet.dataset.showId = show.id;
        btnFav.dataset.showId = show.id;

        if (isDetailed) {
            btnDet.addEventListener('click', this.closeDetailsView);
        } else {
            btnDet.addEventListener('click', this.openDetailsView);
        }

        btnFav.addEventListener('click', this.toggleFavourite)
        let castDiv;
        const h6 = createDOMElem('h6', 'cast-title');
        h6.innerText = "Show cast:";

        divCard.appendChild(divCardBody);
        divCardBody.appendChild(main)
        main.appendChild(img);
        main.appendChild(h5);
        main.appendChild(p);

        if (isDetailed) {
            castDiv = createDOMElem('div', 'show-cast');
            p.after(h6);

            getShowCastById(show.id).then(cast => createCastSection(cast)).then(castArr => {
                if (castArr != false) {
                    for (const cast of castArr) {
                        castDiv.appendChild(cast);
                    }
                } else {
                    castDiv.innerText = "There is no information about this show cast"
                }
            });
            main.appendChild(castDiv);
        }

        divCardBody.appendChild(btnDiv);
        btnDiv.appendChild(btnDet);
        btnDiv.appendChild(btnFav);

        return divCard;
    }

    showFavourites = () => {
        this.viewElems.showsWrapper.innerHTML = "";

        for (const favourite of this.favourites) {
            getShowById(favourite).then(show => {
                const card = this.createShowCard(show);
                this.viewElems.showsWrapper.appendChild(card);
            });
        }
    }

    searchForShows = event => {
        event.preventDefault();

        const searchingShow = event.target.querySelector('input').value;

        if (searchingShow) {
            getShowsByKey(searchingShow).then(shows => this.renderCardsOnList(shows));
        }
    }
}

document.addEventListener("DOMContentLoaded", new tvApp());