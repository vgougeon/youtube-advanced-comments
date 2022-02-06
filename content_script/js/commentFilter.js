class CommentFilter {
    // { type, value }
    filtered = []
    filters = {
        keyword: '',
        username: '',
        others: []
    }

    constructor() {
    }

    bindInputs() {
        document.getElementById('keyword-input').addEventListener('keyup', (event) => {
            this.filters.keyword = event.target.value
            if(event.key === 'Enter') this.applyFilters()       
        })
        document.getElementById('username-input').addEventListener('keyup', (event) => {
            this.filters.username = event.target.value
            if(event.key === 'Enter') this.applyFilters()       
        })
        document.getElementById('load-all-comments').addEventListener('click', () => {
            state.loadAll = true
        })
    }

    applyFilters() {
        this.filtered = cl.comments.map(c => c)
        if(this.filters.keyword) {
            this.filtered = this.filtered.filter(c => c.content.toLocaleLowerCase().includes(this.filters.keyword.toLocaleLowerCase()))
        }
        if(this.filters.username) {
            this.filtered = this.filtered.filter(c => c.author.toLocaleLowerCase().includes(this.filters.username.toLocaleLowerCase()))
        }
        for(let filter of this.filters.others) {
            switch(filter.type) {

            }
        }
        cr.renderComments(this.filtered)
        this.updateFilteredBar()
    }

    updateFilteredBar() {
        const filteredComments = document.getElementById('filtered-comments')
        const loadedComments = document.getElementById('filtered-loaded-comments')
        if(filteredComments) filteredComments.innerHTML = this.filtered.length
        if(loadedComments) loadedComments.innerHTML = cl.comments.length
        const loadingBar = document.getElementById('filtered-loading-bar')
        if(loadingBar) loadingBar.style.width = '' + ((this.filtered.length / cl.comments.length) * 100) +'%'
    }
}

const cf = new CommentFilter()