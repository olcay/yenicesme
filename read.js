// index.js
const { BlobServiceClient } = require("@azure/storage-blob");

const issueNo = document.getElementById("issue");
const issues = document.getElementById("issues");
const txtIssue = document.getElementById("txtIssue");
const issue = getParameterByName("sayi");
let pageFromQuery = getParameterByName("sayfa");
if (pageFromQuery === null) pageFromQuery = "1";
const page = parseInt(pageFromQuery) < 1 ? 1 : parseInt(pageFromQuery);

let nextText = "NEXT >";
let prevText = "< PREVIOUS";
let finishText = `Done! <a href="/read.html?sayi=${parseInt(issue)-1}">Continue to read the previous issue</a> or <a href="/index.html">go back to the main page</a>.`;

const reportStatus = message => {
    console.log(message);
}

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasToken = "?sv=2019-12-12&ss=b&srt=sco&sp=rl&se=2021-12-31T18:43:25Z&st=2020-12-31T10:43:25Z&spr=https&sig=xyJVtsCBUzPef2MDVOp9hkzuoLCYjA0VMZqL1Gtngbs%3D";

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobBaseUrl + blobSasToken);

const articleTemplate = async (issue, button, next, pic) => {
    return `<article>
    <a href="?sayi=${issue}&sayfa=${next}" class="image" title="${button}"><img src="${blobBaseUrl + issue + "/" + pic + blobSasToken}" alt="" /></a>
    <ul class="actions">
        <li><a href="?sayi=${issue}&sayfa=${next}" class="button">${button}</a></li>
    </ul>
</article>`;
};

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const checkDisplayLanguage = async () => {
    var language = window.navigator.userLanguage || window.navigator.language;
    if (language === "tr") {
        txtIssue.innerHTML = "Sayı";
        nextText = "İLERİ >";
        prevText = "< GERİ";
        finishText = `Bitti! <a href="/read.html?sayi=${parseInt(issue)-1}">Önceki sayıya devam et</a> veya <a href="/index.html">anasayfaya geri dön</a>.`;
    }
};

const listFiles = async () => {
    try {
        issueNo.innerHTML = issue;
        const containerName = issue;
        const containerClient = blobServiceClient.getContainerClient(containerName);

        reportStatus("Retrieving file list...");
        let iter = containerClient.listBlobsFlat();
        if (page > 1) {
            for (let i = 0; i < ((page - 1) * 2); i++) {
                await iter.next();
            }
        }

        let response = await iter.next();
        let blobItem = response.value;
        if (blobItem === undefined) {
            issues.innerHTML += "<article>" + finishText + "</article>";
            return;
        }
        issues.innerHTML += await articleTemplate(containerName, prevText, page - 1, blobItem.name);
        response = await iter.next();
        blobItem = response.value;
        issues.innerHTML += await articleTemplate(containerName, nextText, page + 1, blobItem.name);
        reportStatus("Done.");
    } catch (error) {
        reportStatus(error.message);
    }
};

document.addEventListener("DOMContentLoaded", function (event) {
    checkDisplayLanguage();
    listFiles();
});