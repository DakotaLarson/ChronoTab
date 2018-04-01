(function(){
    let manifest = chrome.runtime.getManifest();
    let nameElt = document.getElementById('name');
    let verElt = document.getElementById('version');
    let authorElt = document.getElementById('author');
    nameElt.textContent = manifest.short_name;
    verElt.textContent = manifest.version;
    authorElt.textContent = manifest.author;
}());
