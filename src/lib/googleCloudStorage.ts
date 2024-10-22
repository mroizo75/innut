import { Storage } from '@google-cloud/storage';

let credentials;
try {
  const credentialsString = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (!credentialsString) {
    throw new Error('GOOGLE_CLOUD_CREDENTIALS is not set');
  }
  
  // Sjekk om credentials allerede er et objekt
  if (typeof credentialsString === 'object') {
    credentials = credentialsString;
  } else {
    // Hvis det er en streng, prøv å parse den
    credentials = JSON.parse(credentialsString);
  }
  
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('client_email or private_key is missing in GOOGLE_CLOUD_CREDENTIALS');
  }

  // Erstatt "\n" med faktiske linjeskift i private_key
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

  console.log('Credentials parsed successfully');
} catch (error) {
  console.error('Detaljert feil ved parsing av GOOGLE_CLOUD_CREDENTIALS:', error);
  throw error;
}

console.log('Initialiserer Storage med projectId:', process.env.GOOGLE_CLOUD_PROJECT_ID);
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '');

export async function uploadFile(file: File): Promise<{ url: string; navn: string }> {
  console.log('uploadFile startet med fil:', file.name);
  const fileName = `${Date.now()}-${file.name}`;
  console.log('Generert filnavn:', fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  console.log('Starter opplasting til Cloud Storage');
  const cloudFile = bucket.file(fileName);
  try {
    console.log('Bucket navn:', bucket.name);
    console.log('Prosjekt ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
    await cloudFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });
    console.log('Fil lastet opp til Cloud Storage');

    // Generer en enkel offentlig URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('Offentlig URL generert:', publicUrl);

    return { url: publicUrl, navn: file.name };
  } catch (error) {
    console.error('Feil ved opplasting av fil:', error);
    throw error;
  }
}

export async function deleteFile(fileName: string): Promise<void> {
  console.log('Starter sletting av fil:', fileName);
  try {
    const [exists] = await bucket.file(fileName).exists();
    if (!exists) {
      console.log('Filen eksisterer ikke i Cloud Storage:', fileName);
      return;
    }
    await bucket.file(fileName).delete();
    console.log('Fil slettet fra Cloud Storage:', fileName);
  } catch (error) {
    console.error('Feil ved sletting av fil:', error);
    throw error;
  }
}

export async function downloadFile(fileName: string): Promise<Buffer> {
  console.log('Starter nedlasting av fil:', fileName);
  const cloudFile = bucket.file(fileName);

  try {
    const [exists] = await cloudFile.exists();
    if (!exists) {
      throw new Error(`Filen ${fileName} eksisterer ikke i Cloud Storage`);
    }

    const data = await cloudFile.download();
    console.log('Fil lastet ned fra Cloud Storage');
    return data[0]; // Returnerer bufferen
  } catch (error) {
    console.error('Feil ved nedlasting av fil:', error);
    throw error;
  }
}