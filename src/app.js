import { mapListToDOMElements, createDOMElem } from "./domInteractions.js";
import { getShowById, getShowsByKey, getShowCastById } from "./requests.js"

class tvApp {
    constructor() {
        this.isDetailsOpen = false;
        this.viewElems = {};
        this.showNameButtons = {};
        this.selectedName = "breaking bad";
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
        Array.from(
            document.querySelectorAll('[data-show-id]')
        ).forEach(btn => btn.removeEventListener('click', this.openDetailsView));

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

    renderCast = (cast) => {
        let castArr = [];
        console.log(cast)
        if (!cast) return false;

        for (const castMember of cast) {
            const actorCard = createDOMElem('div', 'actor-card');

            let actorPhoto;
            if (castMember.person.image) {
                actorPhoto = createDOMElem('img', 'actor-photo', null, `${castMember.person.image.medium}`);
            } else {
                actorPhoto = createDOMElem('img', 'actor-photo', null, 'https://via.placeholder.com/100x140');
            }

            const actorName = createDOMElem('p', 'actor-name');
            actorName.innerText = castMember.person.name;

            let characterName = createDOMElem('p', 'character-name');
            if (castMember.character.name) {
                characterName.innerText = castMember.character.name;
            } else {
                characterName.innerText = "";
            }
            
            
    
            actorCard.appendChild(actorPhoto);
            actorCard.appendChild(actorName);
            actorCard.appendChild(characterName);

            castArr.push(actorCard);
        }
        

        return castArr;
    }

    createShowCard = (show, isDetailed) => {
        const divCard = createDOMElem('div', 'card');
        const divCardBody = createDOMElem('div', 'card-body');
        const main = createDOMElem('main', 'card-main');
        const h5 = createDOMElem('h5', 'card-title', show.name);
        const btnDiv = createDOMElem('div', 'btnDiv')
        const btn = createDOMElem('button', 'btn btn-primary', 'Show details');

        let img, p;

        if (show.image) {
            if (isDetailed) {
                img = createDOMElem('div', 'card-preview-bg');
                img.style.backgroundImage = `url(${show.image.original})`
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

        btn.dataset.showId = show.id;

        let castDiv;

        if (isDetailed) {
            btn.addEventListener('click', this.closeDetailsView);

            castDiv = createDOMElem('div', 'show-cast');
            // making show cast apper
            getShowCastById(show.id).then(cast => this.renderCast(cast)).then(castArr => {
                if (castArr != false) {
                    for (const cast of castArr) {
                        castDiv.appendChild(cast);
                    }
                } else {
                    castDiv.innerText = "There are no information about this show cast"
                }
                
                
            });
        } else {
            btn.addEventListener('click', this.openDetailsView);
        }
        const h6 = createDOMElem('h6', 'cast-title');
        h6.innerText = "Show cast:";          
        
        
        

        divCard.appendChild(divCardBody);
        divCardBody.appendChild(main)
        main.appendChild(img);
        main.appendChild(h5);
        main.appendChild(p);
        if (isDetailed) {
            main.appendChild(h6);
        }
        if (castDiv) {
            main.appendChild(castDiv);
        }
        divCardBody.appendChild(btnDiv);
        btnDiv.appendChild(btn);
        return divCard;
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