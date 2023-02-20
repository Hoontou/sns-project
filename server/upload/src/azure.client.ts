import { BlobServiceClient } from '@azure/storage-blob';

//azure 스토리지 접근을 위한 string키
const connString: string | undefined =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) {
  throw Error('missing connString');
}
export const client = BlobServiceClient.fromConnectionString(connString);
