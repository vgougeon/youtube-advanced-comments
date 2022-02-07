const settings = {
    loadAll: undefined,
    enabled: undefined
}

chrome.storage.local.get(['loadAll', 'enabled'], function (result) {
    settings.loadAll = result['loadAll'] !== undefined ? result['loadAll'] : false
    settings.enabled = result['enabled'] !== undefined ? result['enabled'] : true
    

    const loadAll = document.getElementById('loadAll')
    if(loadAll) {
        loadAll.checked = settings.loadAll
        loadAll.addEventListener('change', (event) => {
            chrome.storage.local.set({'loadAll': event.target.checked })
        })
    }

    const enabled = document.getElementById('enabled')
    if(enabled) {
        enabled.checked = settings.enabled
        enabled.addEventListener('change', (event) => {
            chrome.storage.local.set({ 'enabled': event.target.checked })
        })
    }
})
