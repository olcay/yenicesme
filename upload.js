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

// Create a unique name for the container by 
// appending the current time to the file name
var containerName, containerClient;

const createContainer = async () => {
    try {
        containerName = issueNo.value;
        containerClient = blobServiceClient.getContainerClient(containerName);
        reportStatus(`Creating folder "${containerName}"...`);
        await containerClient.create();
        reportStatus("Folder is created.");
    } catch (error) {
        reportStatus(error.message);
    }
};

const uploadFiles = async () => {
    await createContainer();
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