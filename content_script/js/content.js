// const urlParams = new URLSearchParams(window.location.search);
// const v = urlParams.get('v');
// let comments = []
// let total_comments = 0

// const interval = setInterval(async () => {
//     const comments = document.getElementById('comments')
//     if (comments) {
//         comments.replaceWith(await tm.getTemplate('main'))
//         console.log(element)
//         renderComments()
//         clearInterval(interval)
//     }
// }, 100)



async function continuationRequest(token) {
    const req = await fetch('https://www.youtube.com/youtubei/v1/next?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
        method: 'POST',
        body: JSON.stringify({
            "context": {
                "client": {
                    "hl": "en",
                    "clientName": "WEB",
                    "clientVersion": "2.20210721.00.00",
                    "mainAppWebInfo": {
                        "graftUrl": "/watch?v=" + v
                    }
                }
            },
            ...(token ? { continuation: token } : { videoId: v })
        })
    })
    const res = await req.json()
    return res
}

async function scrapComments() {
    const init = await continuationRequest()
    let token = init.contents.twoColumnWatchNextResults.results.results.contents[2].itemSectionRenderer.contents[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token

    for (let i = 0; i < 500; i++) {
        const res = await continuationRequest(token)
        token = undefined
        const items = res.onResponseReceivedEndpoints[1]?.reloadContinuationItemsCommand?.continuationItems ||
            res.onResponseReceivedEndpoints[0]?.appendContinuationItemsAction?.continuationItems || []
        if(res.onResponseReceivedEndpoints[1]) {

        }
        console.log(items)
        for (let item of items) {
            if (!item.commentThreadRenderer) continue;
            comments.push({
                author: item.commentThreadRenderer.comment.commentRenderer.authorText.simpleText,
                authorEndpoint: item.commentThreadRenderer.comment.commentRenderer.authorEndpoint.browseEndpoint.browseId,
                authorAvatar: item.commentThreadRenderer.comment.commentRenderer.authorThumbnail.thumbnails[0].url,
                commentId: item.commentThreadRenderer.comment.commentRenderer.commentId,
                content: item.commentThreadRenderer.comment.commentRenderer.contentText.runs[0].text,
                relativeDate: item.commentThreadRenderer.comment.commentRenderer.publishedTimeText.runs[0].text,
                replyCount: item.commentThreadRenderer.comment.commentRenderer.replyCount,
                repliesToken: item.commentThreadRenderer.replies?.commentRepliesRenderer?.contents[0]?.continuationItemRenderer.continuationEndpoint.continuationCommand.token
            })
            //GET REPLIES WITH REPLIES TOKEN
        }
        if (items.length && items[items.length - 1].continuationItemRenderer) {
            token = items[items.length - 1].continuationItemRenderer.continuationEndpoint.continuationCommand.token
        }
        renderComments()
        console.log("New token : ", token)
        console.log("Scraped comments : ", items)
        if (!token) break;
    }

    console.log("Comments : ", comments)
}

// async function renderComments() {
//     const container = document.getElementById('yac-comments')
//     console.log("RENDER COMMENTS IN ", container)
//     if (!container) return;
//     container.innerHTML = ""
//     for (let comment of comments) {
//         container.appendChild(await tm.getTemplate('comment', comment))
//     }
// }



