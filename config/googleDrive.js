import { google } from 'googleapis';

// Initialize Google Drive API
const initializeDrive = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    return drive;
  } catch (error) {
    console.error('Error initializing Google Drive:', error);
    return null;
  }
};

// Upload file to Google Drive
export const uploadToGoogleDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const drive = initializeDrive();
    if (!drive) throw new Error('Drive not initialized');

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: mimeType,
      body: require('stream').Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId: response.data.id,
      fileName: response.data.name,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink,
      embedLink: `https://drive.google.com/file/d/${response.data.id}/preview`,
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

// Delete file from Google Drive
export const deleteFromGoogleDrive = async (fileId) => {
  try {
    const drive = initializeDrive();
    if (!drive) throw new Error('Drive not initialized');

    await drive.files.delete({
      fileId: fileId,
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw error;
  }
};

export default { uploadToGoogleDrive, deleteFromGoogleDrive };
