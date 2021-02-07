// read.js
const { BlobServiceClient } = require("@azure/storage-blob");

const issueNo = document.getElementById("issue");
const issues = document.getElementById("issues");
const txtIssue = document.getElementById("txtIssue");
const imgFocus = document.getElementById("imgFocus");
const btnNext = document.getElementById("btnNext");
const btnPrevious = document.getElementById("btnPrevious");

const issue = getParameterByName("sayi");

let pages = [], currentPage = 0;

const reportStatus = message => {
    console.log(message);
}

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasToken = "?sv=2019-12-12&ss=b&srt=sco&sp=rl&se=2021-12-31T18:43:25Z&st=2020-12-31T10:43:25Z&spr=https&sig=xyJVtsCBUzPef2MDVOp9hkzuoLCYjA0VMZqL1Gtngbs%3D";

const blobServiceClient = new BlobServiceClient(blobBaseUrl + blobSasToken);

const getSource = (pic) => {
    return `${blobBaseUrl + "issues/" + pic + blobSasToken}`;
};

const thumbnailTemplate = async (id, pic) => {
    return `<a href="#${id}" id="btnThumbnail${id}">
    <img src="${blobBaseUrl + "thumbnails/" + pic + blobSasToken}" style="width: 100px;" />
    </a>`;
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
        btnNext.innerHTML = "İLERİ >";
        btnPrevious.innerHTML = "< GERİ";
    }
};

const listFiles = async () => {
    try {
        issueNo.innerHTML = issue;
        const containerClient = blobServiceClient.getContainerClient("issues");

        reportStatus("Retrieving file list...");
        let i = 0;
        for await (const blob of containerClient.listBlobsFlat({ prefix: issue + "/" })) {
            issues.innerHTML += await thumbnailTemplate(i++, blob.name);
            pages.push(blob.name);
        }
        changePage();
    } catch (error) {
        reportStatus(error.message);
    }
};

const changePage = async () => {
    var hash = window.location.hash.slice(1);
    if (currentPage === hash) return;
    currentPage = hash;
    if (currentPage === "") currentPage = 0;
    imgFocus.src = getSource(pages[currentPage]);
    window.scrollTo(0, 0);

    var activeThumnbnailButtons = issues.getElementsByClassName("active");

    for (let i = 0; i < activeThumnbnailButtons.length; i++) {
        activeThumnbnailButtons[i].classList.remove("active");
    }

    var thumnbnailButton = document.getElementById("btnThumbnail" + currentPage);
    thumnbnailButton.classList.add("active");
    thumnbnailButton.scrollIntoView();
};
window.onhashchange = changePage;

btnNext.addEventListener("click", function (e) {
    e.preventDefault();
    var page = +currentPage + 1;
    if (page >= pages.length) page = 0;
    window.location.hash = page;
});

btnPrevious.addEventListener("click", function () {
    e.preventDefault();
    var page = +currentPage - 1;
    if (page < 0) page = 0;
    window.location.hash = page;
});

document.addEventListener("DOMContentLoaded", function (event) {
    checkDisplayLanguage();
    listFiles();
});