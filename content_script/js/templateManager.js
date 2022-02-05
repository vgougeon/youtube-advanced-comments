class TemplateManager {
    templates = {}

    async getTemplate(name, data) {
        if(!this.templates[name]) {
            const req = await fetch(chrome.runtime.getURL('/content_script/templates/' + name + '.html'))
            const html = await req.text()
            this.templates[name] = html
        }
        const template = document.createElement('template');
        template.innerHTML = this.getHtmlWithData(name, data || {})
        return template.content.childNodes[0]
    }

    getHtmlWithData(name, data = {}) {
        let html = this.templates[name]
        for(let [key, value] of Object.entries(data)) {
            html = String(html).replace("{{ " + key + " }}", value)
        }
        return html
    }
}

const tm = new TemplateManager()