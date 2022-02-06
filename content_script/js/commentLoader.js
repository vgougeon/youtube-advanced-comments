class CommentLoader {

    comments = []
    total = undefined
    totalText = ''
    videoId = undefined
    finished = false

    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.videoId = urlParams.get('v');
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

    async scrapComments(pages = 500) {
        this.loading = true
        const init = await this.continuationRequest()
        const contents = init.contents.twoColumnWatchNextResults.results.results.contents
        let token = contents[contents.length - 1].itemSectionRenderer.contents[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token
    
        for (let i = 0; i < pages; i++) {
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
                this.comments.push({
                    author: item.commentThreadRenderer.comment.commentRenderer.authorText.simpleText,
                    authorEndpoint: item.commentThreadRenderer.comment.commentRenderer.authorEndpoint.browseEndpoint.browseId,
                    authorAvatar: item.commentThreadRenderer.comment.commentRenderer.authorThumbnail.thumbnails[0].url,
                    isChannelOwner: item.commentThreadRenderer.comment.commentRenderer.authorIsChannelOwner || false,
                    commentId: item.commentThreadRenderer.comment.commentRenderer.commentId,
                    content: item.commentThreadRenderer.comment.commentRenderer.contentText.runs[0].text,
                    relativeDate: item.commentThreadRenderer.comment.commentRenderer.publishedTimeText.runs[0].text,
                    likes: +item.commentThreadRenderer.comment.commentRenderer.voteCount?.simpleText || 0, // MIGHT FAIL IF SAMPLE TEXT INCLUDES COMMAS
                    replyCount: item.commentThreadRenderer.comment.commentRenderer.replyCount,
                    repliesToken: item.commentThreadRenderer.replies?.commentRepliesRenderer?.contents[0]?.continuationItemRenderer.continuationEndpoint.continuationCommand.token
                })
            }
            if (items.length && items[items.length - 1].continuationItemRenderer) {
                token = items[items.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token
            }
            this.updateLoadingBar()
            if (!token) break;
        }
        this.updateLoadingBar();
        await this.scrapReplies()
        this.finished = true
        return true
    }

    async scrapReplies(pages = 50) {
        let token = undefined
        for(let comment of this.comments) {
            if(comment.repliesToken) token = comment.repliesToken
            if(token) {
                for (let i = 0; i < pages; i++) {
                    const res = await this.continuationRequest(token)
                    const items = res.onResponseReceivedEndpoints[1]?.reloadContinuationItemsCommand?.continuationItems ||
                        res.onResponseReceivedEndpoints[0]?.appendContinuationItemsAction?.continuationItems || []
                    for (let item of items) {
                        if (!item.commentRenderer) continue;
                        this.comments.push({
                            author: item.commentRenderer.authorText.simpleText,
                            authorEndpoint: item.commentRenderer.authorEndpoint.browseEndpoint.browseId,
                            authorAvatar: item.commentRenderer.authorThumbnail.thumbnails[0].url,
                            isChannelOwner: item.commentRenderer.authorIsChannelOwner || false,
                            commentId: item.commentRenderer.commentId,
                            content: item.commentRenderer.contentText.runs[0].text, // NEEDS .join FOR MULTILINE
                            relativeDate: item.commentRenderer.publishedTimeText.runs[0].text,
                            likes: +item.commentRenderer.voteCount?.simpleText || 0, // MIGHT FAIL IF SAMPLE TEXT INCLUDES COMMAS (>999)
                            replyTo: comment.commentId
                        })
                    }
                    token = undefined
                    if (items.length && items[items.length - 1].continuationItemRenderer) {
                        token = items[items.length - 1].continuationItemRenderer.button.buttonRenderer.command.continuationCommand.token
                    }
                    this.updateLoadingBar();
                    if (!token) break;
                }
            }
            this.updateLoadingBar()
        }
        console.log(this.comments)
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

const cl = new CommentLoader()