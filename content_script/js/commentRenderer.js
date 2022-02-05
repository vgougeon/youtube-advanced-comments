class CommentRenderer {

    page = 0
    
    async renderComments(comments) {
        const container = document.getElementById('yac-comments')
        if (!container) return;
        this.renderChips()
        container.innerHTML = ""
        for (let comment of comments) {
            container.appendChild(await tm.getTemplate('comment', comment))
        }
    }

    async renderChips() {
        const container = document.getElementById('filters-chips')
        if(container) {
            container.innerHTML = ""
            if(cf.filters.keyword) container.appendChild(await tm.getTemplate('filter-chip', { name: 'Keyword', value: cf.filters.keyword }))
            if(cf.filters.username) container.appendChild(await tm.getTemplate('filter-chip', { name: 'Username', value: cf.filters.username }))
        }
    }
}

const cr = new CommentRenderer()