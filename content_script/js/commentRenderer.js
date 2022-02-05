class CommentRenderer {

    page = 0
    async renderComments(comments) {
        const container = document.getElementById('yac-comments')
        if (!container) return;
        container.innerHTML = ""
        for (let comment of comments) {
            container.appendChild(await tm.getTemplate('comment', comment))
        }
    }
}

const cr = new CommentRenderer()