// UNKOWN - READY - LOADING_COMMENTS - DONE
let CURRENT_STATE = 'UNKNOWN'
const settings = {
    loadAll: undefined,
    enabled: true
}

chrome.storage.local.get(['loadAll', 'enabled'], function (result) {
    settings.loadAll = result['loadAll'] !== undefined ? result['loadAll'] : false
    settings.enabled = result['enabled'] !== undefined ? result['enabled'] : true
})


function transition() {
    const v = new URLSearchParams(window.location.search).get('v');
    if (v !== cl.videoId) { reset(); return; }
    c('UNKNOWN', 'SETTINGS_READY', () => settings.loadAll !== undefined)
    c('SETTINGS_READY', 'SETTING_UP', () => (!!document.getElementById('comments') && settings.enabled), setupContainer)
    c('SETTING_UP', 'READY', () => state.mainElement)
    c('READY', 'LOADING_COMMENTS', () => true, loadComments)
    c('LOADING_COMMENTS', 'DONE', () => cl.finished, renderComments)
}

function c(from, to, condition, callback) {
    if (CURRENT_STATE === from && condition()) {
        CURRENT_STATE = to
        console.debug(`${from} >>> ${to}`)
        if (callback) callback()
    }
}

function reset() {
    cr = new CommentRenderer()
    cl = new CommentLoader()
    cf = new CommentFilter()
    CURRENT_STATE = 'UNKNOWN'
    state.mainElement = undefined
    state.loadAll = false
    const comments = document.createElement('div')
    comments.id = 'comments'
    document.getElementById('yac-container').replaceWith(comments)
}

setInterval(transition, 200)