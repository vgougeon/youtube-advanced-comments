class CommentRenderer {

    page = 0
    commentsToDisplay = []

    isEmpty() {
        const container = document.getElementById('yac-comments')
        if(container.childNodes.length === 0) {
            return 
        }
    }
    
    async renderComments(comments) {
        console.log(this.isEmpty())
        this.commentsToDisplay = comments
        const container = document.getElementById('yac-comments')
        if (!container) return;
        console.log(container.childNodes)
        this.renderChips()
        container.innerHTML = ""
        console.log(comments.length)
        for(let i = 0; i < ((comments.length > 20) ? 20 : comments.length); i++) {
            container.appendChild(await tm.getTemplate('comment', comments[i]))
            if(comments[i].replyCount) {
                document.getElementById('show-replies-' + comments[i].commentId).addEventListener('click', () => {
                    cr.showReplies(comments[i].commentId)
                })
            }
            if(comments[i].replyTo) {
                document.getElementById('show-replyTo-' + comments[i].commentId).addEventListener('click', () => {
                    cr.showReplyTo(comments[i].commentId)
                })
            }
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

    async showReplies(commentId) {
        const comments = cl.comments.filter(c => c.replyTo === commentId)
        const container = document.getElementById(`comment-replies-${commentId}`)
        const button = document.getElementById(`show-replies-${commentId}`)
        button.innerText = `${comments.length} replies`
        const length = container.children.length
        container.innerHTML = ""
        if(!length) {
            button.innerText = `Hide replies`
            for(let comment of comments) {
                container.appendChild(await tm.getTemplate('comment', comment))
            }
        }  
    }

    async showReplyTo(commentId) {
        const comment = cl.comments.find(c => c.commentId === commentId)
        const replyTo = comment.replyToComment
        const container = document.getElementById(`original-comment-${commentId}`)
        const button = document.getElementById(`show-replyTo-${commentId}`)
        button.innerText = `Show comment`
        const length = container.children.length
        container.innerHTML = ""
        if(!length) {
            container.parentNode.classList.add('open')
            button.innerText = `Hide comment`
            container.appendChild(await tm.getTemplate('comment', replyTo))
        }
        else {
            container.parentNode.classList.remove('open')
        }
    }


}

let cr = new CommentRenderer()