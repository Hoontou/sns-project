export const requestUrl =
  process.env.NODE_ENV === 'development'
    ? '/upload/files'
    : 'https://snsupload.blob.core.windows.net';
