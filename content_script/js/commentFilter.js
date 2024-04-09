class CommentFilter {
    // { type, value }
    filtered = []
    filters = {
        keyword: '',
        username: '',
        verified: false,
        creator: false,
        dateSort: 0,
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
        document.getElementById('verified-input').addEventListener('change', (event) => {
            this.filters.verified = event.target.checked
            this.applyFilters()
        })
        document.getElementById('creator-input').addEventListener('change', (event) => {
            this.filters.creator = event.target.checked
            this.applyFilters()
        })
        document.getElementById('date-sort-input').addEventListener('click', (event) => {
            const cycle = [0, 1, -1]
            const current = cycle.indexOf(this.filters.dateSort)
            const value = cycle[(current + 1) % cycle.length]
            const element = document.getElementById('date-sort-input')
            element.classList.remove('no-sort', 'sort-up', 'sort-down')
            if(value === 0) element.classList.add('no-sort')
            if(value === 1) element.classList.add('sort-up')
            if(value === -1) element.classList.add('sort-down')
            this.filters.dateSort = value
            this.applyFilters()
        })
        const loadAll = document.getElementById('load-all-comments')
        if(loadAll) loadAll.addEventListener('click', () => {
            state.loadAll = true
        })
        else yacLogger.debug('load-all-comments not found')
    }

    applyFilters() {
        this.filtered = cl.comments.map(c => c)
        if(this.filters.keyword) {
            this.filtered = this.filtered.filter(c => c.content.toLocaleLowerCase().includes(this.filters.keyword.toLocaleLowerCase()))
        }
        if(this.filters.username) {
            this.filtered = this.filtered.filter(c => c.author.toLocaleLowerCase().includes(this.filters.username.toLocaleLowerCase()))
        }
        if(this.filters.verified) {
            this.filtered = this.filtered.filter(c => c.verified)
        }
        if(this.filters.creator) {
            this.filtered = this.filtered.filter(c => c.isChannelOwner)
        }
        if(this.filters.dateSort === 1) {
            console.log('filter up')
            this.filtered = this.filtered.sort((a, b) => b.date - a.date)
        }
        if(this.filters.dateSort === -1) {
            console.log('filter down')
            this.filtered = this.filtered.sort((a, b) => a.date - b.date)
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

let cf = new CommentFilter()