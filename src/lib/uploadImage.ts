export const uploadImageToCloudinary = async (base64Image: string): Promise<string | null> => {
  // If the string is already a URL (not base64), return it directly to avoid re-uploading
  if (!base64Image.startsWith("data:image/")) {
    return base64Image;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration missing. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local");
    return null;
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Image,
        upload_preset: uploadPreset
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Cloudinary upload failed:", err);
      return null;
    }

    const data = await response.json();
    
    // Cloudinary automatically returns a secure_url.
    // We inject transformations to optimize quality and format (q_auto, f_auto) without reducing dimensions
    const optimizedUrl = data.secure_url.replace("/upload/", "/upload/q_auto,f_auto/");
    return optimizedUrl;

  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};
