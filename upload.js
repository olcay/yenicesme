// upload.js
const { BlobServiceClient } = require("@azure/storage-blob");

const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const status = document.getElementById("status");
const issueNo = document.getElementById("issue-no");

const reportStatus = message => {
    status.innerHTML += `${message}<br/>`;
    status.scrollTop = status.scrollHeight;
}

const blobSasUrl = "https://yenicesmestorage.blob.core.windows.net/" + window.location.search;

const blobServiceClient = new BlobServiceClient(blobSasUrl);

const uploadFiles = async () => {
    if (!issueNo.value) {
        reportStatus("Bir sayı giriniz.");
        return;
    }

    var issue = issueNo.value;
    var containerClient = blobServiceClient.getContainerClient("issues");

    try {
        reportStatus("Uploading files...");
        const promises = [];
        for (const file of fileInput.files) {
            var fileName = file.name;
            if (fileName.length === 5) {
                fileName = "0" + fileName;
            }
            reportStatus("Uploading file: " + fileName);
            const blockBlobClient = containerClient.getBlockBlobClient(issue + "/" + fileName);
            promises.push(blockBlobClient.uploadBrowserData(file));
        }
        await Promise.all(promises);
        reportStatus("Files are uploaded.");
    }
    catch (error) {
        reportStatus(error.message);
    }
}

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);