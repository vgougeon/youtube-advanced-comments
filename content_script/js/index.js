// UNKOWN - READY - LOADING_COMMENTS - DONE
let CURRENT_STATE = 'UNKNOWN'
const settings = {
    autoLoad: true
}

function transition() {
    const v = new URLSearchParams(window.location.search).get('v');
    if(v !== cl.videoId) { reset(); return;}

    c('UNKNOWN', 'SETTING_UP', () => !!document.getElementById('comments'), setupContainer)
    c('SETTING_UP', 'READY', () => state.mainElement)
    c('READY', 'LOADING_COMMENTS', () => state.loadAll, loadComments)
    c('LOADING_COMMENTS', 'DONE', () => cl.finished, renderComments)
}

function c(from, to, condition, callback) {
    if(CURRENT_STATE === from && condition()) {
        CURRENT_STATE = to
        console.debug(`${from} >>> ${to}`)
        if(callback) callback()
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