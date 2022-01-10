// index.js
const { BlobServiceClient } = require("@azure/storage-blob");

const issues = document.getElementById("issues");

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasToken = "?sv=2020-08-04&ss=b&srt=sco&sp=rl&se=2023-03-01T22:03:12Z&st=2022-01-10T14:03:12Z&spr=https&sig=4lCq9eMFtNz8D%2BlTwOfHO8mJf0wlvaOdrTkiPqXJHT0%3D";

const blobServiceClient = new BlobServiceClient(blobBaseUrl + blobSasToken);

const articleTemplate = async (issue, pic) => {
    return `<article>
    <a href="read.html?sayi=${issue}" class="image" style="height: 320px;">
        <img src="${blobBaseUrl + "thumbnails/" + pic + blobSasToken}" alt="" />
    </a>
    <h3>Sayı: ${issue}</h3>
    <ul class="actions">
        <li><a href="read.html?sayi=${issue}" class="button">Oku</a></li>
    </ul>
</article>`;
};

const listIssues = async () => {
    try {
        var containerClient = blobServiceClient.getContainerClient("issues");

        for await (const blob of containerClient.listBlobsFlat()) {
            if (blob.name.includes("/01.jp")) {
                var issue = blob.name.split("/")[0];
                issues.innerHTML = await articleTemplate(issue, blob.name) + issues.innerHTML;
            }
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

document.addEventListener("DOMContentLoaded", function (event) {
    listIssues();
});
