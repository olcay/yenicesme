// index.js
const { BlobServiceClient } = require("@azure/storage-blob");

const issues = document.getElementById("issues");

const reportStatus = message => {
    console.log(message);
}

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasToken = "?sv=2019-12-12&ss=b&srt=sco&sp=rl&se=2021-12-31T18:43:25Z&st=2020-12-31T10:43:25Z&spr=https&sig=xyJVtsCBUzPef2MDVOp9hkzuoLCYjA0VMZqL1Gtngbs%3D";

const blobServiceClient = new BlobServiceClient(blobBaseUrl + blobSasToken);

const articleTemplate = async (issue, pic) => {
    return `<article>
    <a href="read.html?sayi=${issue}" class="image"><img src="${blobBaseUrl + issue + "/" + pic + blobSasToken}" alt="" /></a>
    <h3>Sayı: ${issue}</h3>
    <ul class="actions">
        <li><a href="read.html?sayi=${issue}" class="button">Oku</a></li>
    </ul>
</article>`;
};

const listIssues = async () => {
    try {
        reportStatus("Retrieving issue list...");
        const iter = blobServiceClient.listContainers();
        let containerItem = await iter.next();
        while (!containerItem.done) {
            var containerName = containerItem.value.name;
            if (!containerName.startsWith("8")) continue;
            var containerClient = blobServiceClient.getContainerClient(containerName);
            let blobIter = containerClient.listBlobsFlat();
            let blobItem = await blobIter.next();

            issues.innerHTML = await articleTemplate(containerName, blobItem.value.name) + issues.innerHTML;
            containerItem = await iter.next();
        }
        reportStatus("Done.");
    } catch (error) {
        reportStatus(error.message);
    }
};

document.addEventListener("DOMContentLoaded", function (event) {
    listIssues();
});