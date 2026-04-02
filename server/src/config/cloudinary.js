import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Helper
// folder: "avatars" | "attachments"
const uploadToCloudinary = async (filePath, folder) => {
  try {
    // Validate folder
    if (!["avatars", "attachments"].includes(folder)) {
      throw new Error("Invalid folder type");
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `codsoft/${folder}`,
      resource_type: "auto",
      transformation:
        folder === "avatars"
          ? [{ width: 200, height: 200, crop: "fill", gravity: "face" }]
          : [],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw error;
  }
};

// Delete Helper
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    throw error;
  }
};

export { cloudinary, uploadToCloudinary, deleteFromCloudinary };