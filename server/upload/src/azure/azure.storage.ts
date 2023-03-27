//https://github.com/Azure-Samples/AzureStorageSnippets/blob/master/blobs/howto/JavaScript/NodeJS-v12/dev-guide/upload-blob-from-local-file-path.js
//https://learn.microsoft.com/ko-kr/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-azure-cli#upload-blobs-to-a-container
//마소 Azure제공 코드.
//코드좀 읽어보고 내맘대로 수정했음.
//https://github.com/Azure-Samples/AzureStorageSnippets/blob/master/blobs/howto/JavaScript/NodeJS-v12/dev-guide/upload-blob-from-buffer.js
//위 링크는 버퍼를 바로 올리는 코드예시.

// <Snippet_UploadBlob>
// containerName: string
// blobName: string, includes file extension if provided
// buffer: blob content
// uploadOptions: {
//    blockSize: destination block blob size in bytes,
//    concurrency: concurrency of parallel uploading - must be greater than or equal to 0,
//    maxSingleShotSize: blob size threshold in bytes to start concurrency uploading
//    metadata: { reviewer: 'john', reviewDate: '2022-04-01' },
//    tags: {project: 'xyz', owner: 'accounts-payable'}
//  }

async function createBlobFromBuffer(
  containerClient,
  blobName,
  buffer,
  uploadOptions,
) {
  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // Upload buffer
  await blockBlobClient.uploadData(buffer, uploadOptions);

  // do something with blob
  // const getTagsResponse = await blockBlobClient.getTags();
  // console.log(`tags for ${blobName} = ${JSON.stringify(getTagsResponse.tags)}`);
  console.log(`${blobName} upload complete`);
}

//메인코드
export const uploadToAzure = async (
  blobServiceClient,
  bufferList: Buffer[],
  fileNameList: string[],
  postId: string,
): Promise<void> => {
  try {
    const blobs: Promise<void>[] = [];
    //타입명시.

    // create container
    const containerName = postId;

    const containerOptions = {
      access: 'container',
    };
    const { containerClient } = await blobServiceClient.createContainer(
      containerName, //스토리지 컨테이너이름이고 그냥 폴더명이라고 생각하면 되는듯?
      containerOptions,
    );
    console.log('====== start azure upload ======');
    console.log('container creation succeeded');

    // create 10 blobs with Promise.all
    for (let i = 0; i < bufferList.length; i++) {
      // const uploadOptions = {}; //딱히 줄게 없다.
      blobs.push(
        createBlobFromBuffer(
          containerClient,
          fileNameList[i],
          bufferList[i],
          {},
        ),
      );
    }

    await Promise.all(blobs);
    console.log('======== upload Succeed ========');
  } catch {
    console.log('======== upload failed =========');
    throw new Error();
  }
};
