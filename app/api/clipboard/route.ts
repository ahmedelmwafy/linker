import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'clipboard.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

async function getClipboard() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { text: '', files: [], lastUpdated: new Date().toISOString() };
  }
}

async function saveClipboard(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = await getClipboard();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  await ensureUploadsDir();
  const contentType = request.headers.get('content-type') || '';
  const currentData = await getClipboard();
  let updatedData = { ...currentData };

  try {
    if (contentType.includes('application/json')) {
      const newData = await request.json();
      updatedData = {
        ...currentData,
        ...newData,
        lastUpdated: new Date().toISOString(),
      };
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(UPLOADS_DIR, fileName);
        
        await fs.writeFile(filePath, buffer);
        
        const fileInfo = {
          name: file.name,
          url: `/uploads/${fileName}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          size: file.size,
          timestamp: new Date().toISOString()
        };
        
        updatedData.files = [fileInfo, ...(currentData.files || [])].slice(0, 50);
        updatedData.lastUpdated = new Date().toISOString();
      }
    }

    await saveClipboard(updatedData);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Local Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
