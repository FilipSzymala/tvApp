export const getShowsByKey = key => {
    return fetch(`http://api.tvmaze.com/search/shows?q=${key}`)
    .then(resp => resp.json());
} 

export const getShowById = id => {
    return fetch(`http://api.tvmaze.com/shows/${id}?embeded=cast`)
    .then(resp => resp.json());
} 

export const getShowCastById = id => {
    return fetch(`https://api.tvmaze.com/shows/${id}/cast`)
    .then(resp => resp.json());
}