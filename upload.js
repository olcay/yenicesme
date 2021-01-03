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

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

const uploadFiles = async () => {
    if (!issueNo.value) {
        reportStatus("Bir sayı numarası giriniz.");
        return;
    }

    var containerName, containerClient;
    try {
        containerName = issueNo.value;
        containerClient = blobServiceClient.getContainerClient(containerName);
        reportStatus(`Creating folder "${containerName}"...`);
        await containerClient.create();
        reportStatus("Folder is created.");
    } catch (error) {
        reportStatus(error.message);
        return;
    }

    try {
        reportStatus("Uploading files...");
        const promises = [];
        for (const file of fileInput.files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
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