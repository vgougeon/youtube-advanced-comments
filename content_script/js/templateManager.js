class TemplateManager {
    templates = {}

    async getTemplate(name, data) {
        if(!this.templates[name]) {
            const req = await fetch(chrome.runtime.getURL('/content_script/templates/' + name + '.html'))
            const html = await req.text()
            this.templates[name] = html
        }
        const template = document.createElement('template');
        let html = this.templates[name]
        html = this.getHtmlWithCondition(html, data || {})
        html = this.getHtmlWithData(html, data || {})
        template.innerHTML = html
        return template.content.childNodes[0]
    }

    getHtmlWithData(html, data = {}) {
        for(let [key, value] of Object.entries(data)) {
            // html = String(html).replace("{{ " + key + " }}", value)
            html = String(html).replace(new RegExp('{{\\s' + key + '\\s}}', 'g'), value)
        }
        return html
    }

    getHtmlWithCondition(html, data = {}) {
        const matches = String(html).matchAll(/{{#(?<open>[a-zA-Z0-9]*)}}(?<content>.*?){{\/#(?<close>\1)}}/gs)
        for(let match of Array.from(matches)) {
            if(data[match.groups['open']]) {
                html = html.replace(match[0], match.groups['content'])
            }
            else {
                html = html.replace(match[0], '')
            }
        }
        return html
    }
}

const tm = new TemplateManager()