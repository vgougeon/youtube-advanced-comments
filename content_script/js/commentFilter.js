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
    }

}

const cf = new CommentFilter()