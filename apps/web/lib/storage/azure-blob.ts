import { BlobServiceClient } from '@azure/storage-blob';

export class AzureBlobStorageClient {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is required');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'daycare-documents';
  }

  async uploadFile(
    file: File,
    daycareId: string,
    childId: string,
    documentType: string
  ): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    
    // Create a unique blob name
    const fileExtension = file.name.split('.').pop();
    const blobName = `${daycareId}/${childId}/${documentType}/${Date.now()}-${file.name}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload the file
    await blockBlobClient.uploadData(arrayBuffer, {
      blobHTTPHeaders: {
        blobContentType: file.type,
      },
      metadata: {
        originalName: file.name,
        daycareId,
        childId,
        documentType,
        uploadDate: new Date().toISOString(),
      },
    });

    return blobName;
  }

  async downloadFile(blobName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const downloadResponse = await blockBlobClient.download();
    
    if (!downloadResponse.readableStreamBody) {
      throw new Error('Failed to download file');
    }

    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      downloadResponse.readableStreamBody!.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      downloadResponse.readableStreamBody!.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      downloadResponse.readableStreamBody!.on('error', reject);
    });
  }

  async deleteFile(blobName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.delete();
  }

  async getFileUrl(blobName: string, expiresInMinutes: number = 60): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Generate a SAS URL for temporary access
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
    
    // Note: This requires additional SAS token generation logic
    // For now, return the blob URL (this would be restricted in production)
    return blockBlobClient.url;
  }

  async listFiles(daycareId: string, childId?: string): Promise<string[]> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    
    const prefix = childId ? `${daycareId}/${childId}/` : `${daycareId}/`;
    const blobNames: string[] = [];
    
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobNames.push(blob.name);
    }
    
    return blobNames;
  }
}

// Singleton instance
let azureBlobClient: AzureBlobStorageClient | null = null;

export function getAzureBlobClient(): AzureBlobStorageClient {
  if (!azureBlobClient) {
    azureBlobClient = new AzureBlobStorageClient();
  }
  return azureBlobClient;
}