// index.js
const { BlobServiceClient } = require("@azure/storage-blob");


const listIssueButton = document.getElementById("list-issue-button");
const listFilesButton = document.getElementById("list-file-button");
const status = document.getElementById("status");
const fileList = document.getElementById("file-list");
const images = document.getElementById("images");

const reportStatus = message => {
    status.innerHTML += `${message}<br/>`;
    status.scrollTop = status.scrollHeight;
}

const blobBaseUrl = "https://yenicesmestorage.blob.core.windows.net/";
const blobSasUrl = blobBaseUrl + window.location.search;

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

const listIssues = async () => {
    fileList.size = 0;
    fileList.innerHTML = "";
    try {
        reportStatus("Retrieving issue list...");
        let i = 1;
        const iter = blobServiceClient.listContainers();
        let containerItem = await iter.next();
        while (!containerItem.done) {
            fileList.size += 1;
            fileList.innerHTML += `<option>${containerItem.value.name}</option>`;
            containerItem = await iter.next();
        }
        if (fileList.size > 0) {
            reportStatus("Done.");
        } else {
            reportStatus("The storage does not contain any issues.");
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

const listFiles = async () => {
    try {
        if (fileList.selectedOptions.length > 0) {
            const containerName = fileList.selectedOptions[0].text;
            const containerClient = blobServiceClient.getContainerClient(containerName);

            fileList.size = 0;
            fileList.innerHTML = "";
            reportStatus("Retrieving file list...");
            let iter = containerClient.listBlobsFlat();
            let blobItem = await iter.next();
            while (!blobItem.done) {
                fileList.size += 1;
                fileList.innerHTML += `<option>${blobItem.value.name}</option>`;
                images.innerHTML += `<img src="${blobBaseUrl + containerName + "/" + blobItem.value.name + window.location.search}" />`;
                blobItem = await iter.next();
            }
            if (fileList.size > 0) {
                reportStatus("Done.");
            } else {
                reportStatus("The container does not contain any files.");
            }
        } else {
            reportStatus("No files selected.");
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

listIssueButton.addEventListener("click", listIssues);
listFilesButton.addEventListener("click", listFiles);