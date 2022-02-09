const state = {
    loadAll: false,
    mainElement: undefined
}

async function setupContainer() {
    const comments = document.getElementById('comments')
    if (comments) {
        comments.replaceWith(await tm.getTemplate('main'))
        state.mainElement = document.getElementById('yac-container')
        getTheme()
        cf.bindInputs()
        setInterval(getTheme, 500)
        return true
    }
    return false
}

function getTheme() {
    let theme = undefined
    const ytdapp = document.querySelector('ytd-app')
    const bg = window.getComputedStyle(ytdapp).backgroundColor
    const match = Array.from(bg.matchAll(/rgb\((?<r>.*?), (?<g>.*?), (?<b>.*?)\)/g))[0]
    if(match) {
        const sum = (+match.groups['r'] + +match.groups['g'] + +match.groups['b'])
        if(sum > 380) theme = 'light'
        else theme = 'dark'
    }
    if(theme === 'dark') document.body.classList.add('dark')
    else if (theme === 'light') document.body.classList.remove('dark')
    return theme
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

const HTMLUtils = new function () {
    const rules = [
        { expression: /&/g, replacement: '&amp;' },
        { expression: /</g, replacement: '&lt;' },
        { expression: />/g, replacement: '&gt;' },
        { expression: /"/g, replacement: '&quot;' },
        { expression: /'/g, replacement: '&#039;' }
    ];
    this.escape = function (html) {
        let result = html;
        for (let i = 0; i < rules.length; ++i) {
            const rule = rules[i];
            result = result.replace(rule.expression, rule.replacement);
        }
        return result;

    }
};