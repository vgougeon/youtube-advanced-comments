class CommentLoader {

    comments = []
    total = undefined
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
            if(res.onResponseReceivedEndpoints[1]) {
    
            }
            for (let item of items) {
                if (!item.commentThreadRenderer) continue;
                this.comments.push({
                    author: item.commentThreadRenderer.comment.commentRenderer.authorText.simpleText,
                    authorEndpoint: item.commentThreadRenderer.comment.commentRenderer.authorEndpoint.browseEndpoint.browseId,
                    authorAvatar: item.commentThreadRenderer.comment.commentRenderer.authorThumbnail.thumbnails[0].url,
                    commentId: item.commentThreadRenderer.comment.commentRenderer.commentId,
                    content: item.commentThreadRenderer.comment.commentRenderer.contentText.runs[0].text,
                    relativeDate: item.commentThreadRenderer.comment.commentRenderer.publishedTimeText.runs[0].text,
                    replyCount: item.commentThreadRenderer.comment.commentRenderer.replyCount,
                    repliesToken: item.commentThreadRenderer.replies?.commentRepliesRenderer?.contents[0]?.continuationItemRenderer.continuationEndpoint.continuationCommand.token
                })
            }
            if (items.length && items[items.length - 1].continuationItemRenderer) {
                token = items[items.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token
            }
            if (!token) break;
        }
        this.finished = true
        return true
    }
}

const cl = new CommentLoader()