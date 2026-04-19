import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

const DATA_FILE = path.join(process.cwd(), 'clipboard.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');
const IMGBB_API_KEY = '6389731c687f134713a1ebb5807d0d95';

// Check if we are running on Vercel with KV configured
const useKV = !!process.env.KV_REST_API_URL;

async function getClipboard() {
  console.log("--- GET Clipboard ---");
  console.log("Mode:", useKV ? "Vercel KV" : "Local File");
  
  if (useKV) {
    try {
      const data = await kv.get('clipboard');
      return data || { text: '', files: [], lastUpdated: new Date().toISOString() };
    } catch (e) {
      console.error("CRITICAL: KV GET failed:", e);
    }
  }

  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { text: '', files: [], lastUpdated: new Date().toISOString() };
  }
}

async function saveClipboard(data: any) {
  console.log("--- SAVE Clipboard ---");
  console.log("Mode:", useKV ? "Vercel KV" : "Local File");

  if (useKV) {
    try {
      await kv.set('clipboard', data);
      console.log("KV Save Successful");
      return;
    } catch (e) {
      console.error("CRITICAL: KV SET failed:", e);
    }
  }

  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("Local Save Successful");
  } catch (e) {
    console.error("Local Save Failed:", e);
  }
}

export async function GET() {
  const data = await getClipboard();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  const currentData = await getClipboard();
  let updatedData = { ...currentData };

  try {
    if (contentType.includes('application/json')) {
      const newData = await request.json();
      console.log("Updating text...");
      updatedData = {
        ...currentData,
        ...newData,
        lastUpdated: new Date().toISOString(),
      };
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (file) {
        console.log("Processing file upload:", file.name);
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
          console.log("Uploading to imgBB...");
          const imgbbFormData = new FormData();
          imgbbFormData.append('image', file);
          
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: imgbbFormData,
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log("imgBB Upload Success:", result.data.url);
            const fileInfo = {
              name: file.name,
              url: result.data.url,
              displayUrl: result.data.display_url,
              deleteUrl: result.data.delete_url,
              type: 'image',
              size: file.size,
              timestamp: new Date().toISOString()
            };
            updatedData.files = [fileInfo, ...(currentData.files || [])].slice(0, 50);
          } else {
            console.error("imgBB Upload Error:", result);
          }
        } else {
          // Local fallback (won't work on Vercel production)
          if (!useKV) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(UPLOADS_DIR, fileName);
            await fs.writeFile(filePath, buffer);
            
            const fileInfo = {
              name: file.name,
              url: `/uploads/${fileName}`,
              type: 'file',
              size: file.size,
              timestamp: new Date().toISOString()
            };
            updatedData.files = [fileInfo, ...(currentData.files || [])].slice(0, 50);
          } else {
            console.warn("Non-image file uploads are only supported locally for now.");
          }
        }
        
        updatedData.lastUpdated = new Date().toISOString();
      }
    }

    await saveClipboard(updatedData);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("POST Handler Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
