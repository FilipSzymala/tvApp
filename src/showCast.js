import { createDOMElem } from "./domInteractions.js";

export const createCastSection = (cast) => {
    let castArr = [];

    if (!cast) return false;

    for (const castMember of cast) {
        const actorCard = createDOMElem('div', 'actor-card');

        let actorPhoto;
        if (castMember.person.image) {
            actorPhoto = createDOMElem('img', 'actor-photo', null, `${castMember.person.image.medium}`);
        } else {
            actorPhoto = createDOMElem('img', 'actor-photo', null, 'https://via.placeholder.com/100x140');
        }

        let characterPhoto;
        if (castMember.character.image) {
            characterPhoto = createDOMElem('img', 'character-photo', null, `${castMember.character.image.medium}`);
        } else {
            characterPhoto = createDOMElem('img', 'character-photo', null, 'https://via.placeholder.com/100x140');
        }

        const actorName = createDOMElem('p', 'actor-name');
        actorName.innerText = castMember.person.name;

        let characterName = createDOMElem('p', 'character-name');
        if (castMember.character.name) {
            characterName.innerText = castMember.character.name;
        } else {
            // if actor is not playing any character he is playing himself 
            characterName.innerText = castMember.person.name;
        }

        actorCard.appendChild(characterPhoto);
        actorCard.appendChild(actorName);
        actorCard.appendChild(actorPhoto);
        actorCard.appendChild(characterName);

        castArr.push(actorCard);
    }

    return castArr;
}
