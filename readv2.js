// readv2.js
const { BlobServiceClient } = require("@azure/storage-blob");

const issueNo = document.getElementById("issue");
const issues = document.getElementById("issues");
const txtIssue = document.getElementById("txtIssue");
const focus = document.getElementById("focus");
const imgFocus = document.getElementById("imgFocus");
const actions = document.getElementById("actions");

const issue = getParameterByName("sayi");
let pageName = "";

let nextText = "NEXT >";
let prevText = "< PREVIOUS";
let finishText = `Done! <a href="/read.html?sayi=${parseInt(issue) - 1}">Continue to read the previous issue</a> or <a href="/index.html">go back to the main page</a>.`;

const reportStatus = message => {
    console.log(message);
}

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasToken = "?sv=2019-12-12&ss=b&srt=sco&sp=rl&se=2021-12-31T18:43:25Z&st=2020-12-31T10:43:25Z&spr=https&sig=xyJVtsCBUzPef2MDVOp9hkzuoLCYjA0VMZqL1Gtngbs%3D";

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobBaseUrl + blobSasToken);

const articleTemplate = (pic) => {
    return `${blobBaseUrl + "issues/" + pic + blobSasToken}`;
};

const thumbnailTemplate = async (page, pic) => {
    return `<a href="#${page}" data-pic="${pic}" class="btnThumbnail"><img src="${blobBaseUrl + "thumbnails/" + pic + blobSasToken}" style="width: 100px;" /></a>`;
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
        finishText = `Bitti! <a href="/read.html?sayi=${parseInt(issue) - 1}">Önceki sayıya devam et</a> veya <a href="/index.html">anasayfaya geri dön</a>.`;
    }
};

const listFiles = async () => {
    try {
        issueNo.innerHTML = issue;
        const containerClient = blobServiceClient.getContainerClient("issues");

        reportStatus("Retrieving file list...");
        let i = 1;
        for await (const blob of containerClient.listBlobsFlat({ prefix: issue + "/" })) {
            if (blob.name.includes("/01.jp") && pageName === "") {
                pageName = blob.name;
            }
            issues.innerHTML += await thumbnailTemplate(i++, blob.name);
        }

        var thumnbnailButtons = document.getElementsByClassName("btnThumbnail");

        for (let i = 0; i < thumnbnailButtons.length; i++) {
            thumnbnailButtons[i].addEventListener("click", function() {
                imgFocus.src = articleTemplate(this.getAttribute("data-pic"));
                window.scrollTo(0, 0);
            })
        }

        imgFocus.src = articleTemplate(pageName);

        //actions.innerHTML = `<a href="#${page - 1}">${prevText}</a><a href="#${page + 1}" style="float: right;">${nextText}</a>`


        reportStatus("Done.");
    } catch (error) {
        reportStatus(error.message);
    }
};



document.addEventListener("DOMContentLoaded", function (event) {
    checkDisplayLanguage();
    listFiles();
});