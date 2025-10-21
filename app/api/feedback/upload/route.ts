import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `feedback-${timestamp}-${file.name}`;
    const path = join(process.cwd(), 'public', 'uploads', 'feedback', filename);

    // Ensure directory exists
    const fs = require('fs');
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'feedback');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);

    // Return the public URL
    const publicUrl = `/uploads/feedback/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename 
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}
