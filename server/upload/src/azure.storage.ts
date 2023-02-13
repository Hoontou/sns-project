//https://github.com/Azure-Samples/AzureStorageSnippets/blob/master/blobs/howto/JavaScript/NodeJS-v12/dev-guide/upload-blob-from-local-file-path.js
//https://learn.microsoft.com/ko-kr/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-azure-cli#upload-blobs-to-a-container
//마소 Azure제공 코드.
//코드좀 읽어보고 내맘대로 수정했음.

// <Snippet_UploadBlob>
// containerName: string
// blobName: string, includes file extension if provided
// localFileWithPath: fully qualified path and file name
// uploadOptions: {
//   metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//   tags: {project: 'xyz', owner: 'accounts-payable'}
// }

async function createBlobFromLocalPath(
  containerClient,
  blobName: string,
  localFileWithPath: string,
  uploadOptions,
): Promise<void> {
  // create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // upload file to blob storage
  await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);
  console.log(`${blobName} succeeded`);
}
// </Snippet_UploadBlob>

export async function uploadToAzure(
  blobServiceClient,
  localFileList: string[],
  uuid: string,
) {
  const blobs: Promise<void>[] = [];
  //타입명시.

  // create container
  const containerName = uuid;

  const containerOptions = {
    access: 'container',
  };

  const { containerClient } = await blobServiceClient.createContainer(
    containerName, //스토리지 컨테이너이름이고 그냥 폴더명이라고 생각하면 되는듯?
    containerOptions,
  );
  console.log('container creation succeeded');

  // create 10 blobs with Promise.all
  for (let i = 0; i < localFileList.length; i++) {
    const uploadOptions = {}; //딱히 줄게 없다.

    blobs.push(
      createBlobFromLocalPath(
        containerClient,
        localFileList[i],
        `files/${uuid}/${localFileList[i]}`,
        uploadOptions,
      ),
    );
  }
  await Promise.all(blobs);
}
