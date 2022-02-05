const state = {
    comments: cl.comments,
    totalComments: cl.total,
    videoId: undefined,
    mainElement: undefined
}

async function setupContainer() {
    
    const comments = document.getElementById('comments')
    if (comments) {
        comments.replaceWith(await tm.getTemplate('main'))
        state.mainElement = document.getElementById('yac-comments')
        // const ytdapp = document.querySelector('ytd-app')
        // console.log(ytdapp)
        // if(ytdapp.isAppDarkTheme) {
        //     state.mainElement.classList = state.mainElement.classList + " dark"
        // }
        cf.bindInputs()
        return true
    }
    return false
}

async function loadComments() {
    cl.scrapComments()
}

async function renderComments() {
    cf.applyFilters()
}