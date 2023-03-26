import * as multer from 'multer';
import {
  MulterAzureStorage,
  MASNameResolver,
  MASObjectResolver,
} from 'multer-azure-blob-storage';
import { Express } from 'express';

const connString: string | undefined =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connString) {
  throw Error('missing connString');
}

const resolveBlobName: MASNameResolver = (
  req: any,
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const blobName: string = yourCustomLogic(req, file);
    resolve(blobName);
  });
};

export type MetadataObj = { [k: string]: string };
const resolveMetadata: MASObjectResolver = (
  req: any,
  file: Express.Multer.File,
): Promise<MetadataObj> => {
  return new Promise<MetadataObj>((resolve, reject) => {
    const metadata: MetadataObj = yourCustomLogic(req, file);
    resolve(metadata);
  });
};

const resolveContentSettings: MASObjectResolver = (
  req: any,
  file: Express.Multer.File,
): Promise<MetadataObj> => {
  return new Promise<MetadataObj>((resolve, reject) => {
    const contentSettings: MetadataObj = yourCustomLogic(req, file);
    resolve(contentSettings);
  });
};

const azureStorage: MulterAzureStorage = new MulterAzureStorage({
  connectionString: connString,
  accessKey:
    'sVDkSKQZyQPURSTGJrDoCOjizHGlaiRdgCwC00qqBggymMWDqWH49aslc8tVLX9VIrZW7r6B2f/Z+AStBA649Q==',
  accountName: 'snsupload',
  containerName: 'documents',
  blobName: resolveBlobName,
  metadata: resolveMetadata,
  contentSettings: resolveContentSettings,
  containerAccessLevel: 'container',
  urlExpirationTime: -1,
});

const upload: multer.Instance = multer({
  storage: azureStorage,
});

export const uploadToAzure = upload.fields([{ name: 'file', maxCount: 4 }]);
