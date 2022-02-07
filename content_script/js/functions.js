const state = {
    loadAll: false,
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
async function loadAllComments() {
    cl.scrapComments()
}

async function loadComments() {
    cl.scrapComments()
}

async function renderComments() {
    cf.applyFilters()
}

async function showReplies(commentId) {
    cr.showReplies(commentId)
}

const HTMLUtils = new function() {
    const rules = [
        { expression: /&/g, replacement: '&amp;'  },
        { expression: /</g, replacement: '&lt;'   },
        { expression: />/g, replacement: '&gt;'   },
        { expression: /"/g, replacement: '&quot;' },
        { expression: /'/g, replacement: '&#039;' }
    ];
    this.escape = function(html) {
        let result = html;
        for (let i = 0; i < rules.length; ++i) {
            const rule = rules[i];
            result = result.replace(rule.expression, rule.replacement);
        }
        console.log(result)
        return result;
        
    }
};