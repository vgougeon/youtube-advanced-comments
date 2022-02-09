class CommentLoader {

    comments = []
    total = undefined
    totalText = ''
    videoId = undefined

    commentsLoaded = false
    repliesTasks = []
    finished = false

    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.videoId = urlParams.get('v');
    }
    
    toggleSpinner(value) {
        const spinner = document.getElementById('loading-spinner-comments')
        if(value && spinner)
            spinner.style.display = 'flex'
        else if(!value && spinner)
            spinner.style.display = 'none'
    }

    async continuationRequest(token) {
        const req = await fetch('https://www.youtube.com/youtubei/v1/next?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
            method: 'POST',
            body: JSON.stringify({
                "context": {
                    "client": {
                        "hl": "en",
                        "clientName": "WEB",
                        "clientVersion": "2.20210721.00.00",
                        "mainAppWebInfo": {
                            "graftUrl": "/watch?v=" + this.videoId
                        }
                    }
                },
                ...(token ? { continuation: token } : { videoId: this.videoId })
            })
        })
        const res = await req.json()
        return res
    }

    async getToken() {

    }

    async scrapComments() {
        this.toggleSpinner(true)
        this.loading = true
        const init = await this.continuationRequest()
        const contents = init.contents.twoColumnWatchNextResults.results.results.contents
        let token = contents[contents.length - 1].itemSectionRenderer.contents[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
        for (let i = 0; i < 500; i++) {
            const res = await this.continuationRequest(token)
            token = undefined
            const items = res.onResponseReceivedEndpoints[1]?.reloadContinuationItemsCommand?.continuationItems ||
                res.onResponseReceivedEndpoints[0]?.appendContinuationItemsAction?.continuationItems || []
            if(!this.total) {
                this.totalText = res.onResponseReceivedEndpoints[0]?.reloadContinuationItemsCommand.continuationItems[0].commentsHeaderRenderer.countText.runs[0].text
                this.total = +this.totalText.replace(/,/g, '');
            }
            for (let item of items) {
                if (!item.commentThreadRenderer) continue;
                const c = item.commentThreadRenderer.comment.commentRenderer
                const add = {
                    author: HTMLUtils.escape(c.authorText.simpleText),
                    verified: c.authorCommentBadge?.authorCommentBadgeRenderer.iconTooltip,
                    authorEndpoint: c.authorEndpoint.browseEndpoint.browseId,
                    authorAvatar: c.authorThumbnail.thumbnails[0].url,
                    isChannelOwner: c.authorIsChannelOwner || false,
                    commentId: c.commentId,
                    content: HTMLUtils.escape(c.contentText.runs.map(r => r.text).join('')).replace(/\n/g, '<br />'),
                    relativeDate: c.publishedTimeText.runs.map(r => r.text).join(''),
                    likes: +c.voteCount?.simpleText || 0, // MIGHT FAIL IF SAMPLE TEXT INCLUDES COMMAS
                    replyCount: c.replyCount,
                    repliesToken: item.commentThreadRenderer.replies?.commentRepliesRenderer?.contents[0]?.continuationItemRenderer.continuationEndpoint.continuationCommand.token
                }
                console.log("SCRAPED comments")
                this.comments.push(add)
                if(add.repliesToken) this.scrapReplies(add)
                
            }
            if (items.length && items[items.length - 1].continuationItemRenderer) {
                token = items[items.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token
            }
            this.updateLoadingBar()
            if (!token) break;
            if(i === 1 && !settings.loadAll) { this.toggleSpinner(false); break; }
        }
        this.updateLoadingBar();
        this.commentsLoaded = true
        this.done()
        this.toggleSpinner(false)
        return true
    }

    done() {
        if(this.commentsLoaded && !this.repliesTasks.find(r => r.finished === false)) {
            console.log(this.comments)
            this.finished = true
        }
            
    }

    async scrapReplies(comment) {
        const status = { commentId: comment.commentId, finished: false }
        this.repliesTasks.push(status)
        let token = comment.repliesToken
        for (let i = 0; i < 100; i++) {
            const res = await this.continuationRequest(token)
            const items = res.onResponseReceivedEndpoints[1]?.reloadContinuationItemsCommand?.continuationItems ||
                res.onResponseReceivedEndpoints[0]?.appendContinuationItemsAction?.continuationItems || []
            for (let item of items) {
                if (!item.commentRenderer) continue;
                this.comments.push({
                    author: HTMLUtils.escape(item.commentRenderer.authorText.simpleText),
                    verified: item.commentRenderer.authorCommentBadge?.authorCommentBadgeRenderer.iconTooltip,
                    authorEndpoint: item.commentRenderer.authorEndpoint.browseEndpoint.browseId,
                    authorAvatar: item.commentRenderer.authorThumbnail.thumbnails[0].url,
                    isChannelOwner: item.commentRenderer.authorIsChannelOwner || false,
                    commentId: item.commentRenderer.commentId,
                    content: HTMLUtils.escape(item.commentRenderer.contentText.runs.map(r => r.text).join('')).replace(/\n/g, '<br />'),
                    // content: item.commentRenderer.contentText.runs.map(r => r.text).join('').replace(/\n/g, '<br />'), // NEEDS .join FOR MULTILINE
                    relativeDate: item.commentRenderer.publishedTimeText.runs[0].text,
                    likes: +item.commentRenderer.voteCount?.simpleText || 0, // MIGHT FAIL IF SAMPLE TEXT INCLUDES COMMAS (>999)
                    replyTo: comment.commentId,
                    replyToComment: comment
                })
            }
            token = undefined
            if (items.length && items[items.length - 1].continuationItemRenderer) {
                token = items[items.length - 1].continuationItemRenderer.button.buttonRenderer.command.continuationCommand.token
            }
            this.updateLoadingBar();
            if (!token) break;
        }
        status.finished = true;
        this.done()
    }

    updateLoadingBar() {
        const loadedComments = document.getElementById('loaded-comments')
        const totalComments = document.getElementById('total-comments')
        if(loadedComments) loadedComments.innerHTML = this.comments.length
        if(totalComments) totalComments.innerHTML = this.total
        const loadingBar = document.getElementById('comments-loading-bar')
        if(loadingBar && this.total !== undefined) loadingBar.style.width = '' + ((this.comments.length / this.total) * 100) +'%'
    }
}

let cl = new CommentLoader()