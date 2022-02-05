// UNKOWN - READY - LOADING_COMMENTS - DONE
let CURRENT_STATE = 'UNKNOWN'
const settings = {
    autoLoad: true
}

function transition() {
    c('UNKNOWN', 'SETTING_UP', () => !!document.getElementById('comments'), setupContainer)
    c('SETTING_UP', 'READY', () => state.mainElement)
    c('READY', 'LOADING_COMMENTS', () => settings.autoLoad, loadComments)
    c('LOADING_COMMENTS', 'DONE', () => cl.finished, renderComments)
}

function c(from, to, condition, callback) {
    if(CURRENT_STATE === from && condition()) {
        CURRENT_STATE = to
        console.debug(`${from} >>> ${to}`)
        if(callback) callback()
    }
}

setInterval(transition, 500)