import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_API_SECRET,
//     });

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload
        (localFilePath,{
            resource_type : "auto"
        });
        // file uploaded on cloudinary successfully
        //console.log("file is uploaded on cloudinary", response.url)

        fs.unlinkSync(localFilePath)  // remove the locally saved temporary file after successful upload on cloudinary
        return response
    }
    catch(error){
        console.error("error in uploading on cloudinary:", error);
        fs.unlinkSync(localFilePath)  // remove the locally saved temporary file as the upload has been failed
        return null;
    }
}

const extractPublicIds = (cloudinaryUrl) =>{
  // Remove the base URL and split by '/'
  const parts = cloudinaryUrl.split('/');
  
  // Find the index of 'upload' or 'private'
  const uploadIndex = parts.findIndex(part => 
    part === 'upload' || part === 'private' || part === 'authenticated'
  );
  
  // Get everything after upload/private, excluding version if present
  const relevantParts = parts.slice(uploadIndex + 1);
  
  // Remove version (starts with 'v' followed by numbers)
  const withoutVersion = relevantParts.filter(part => 
    !/^v\d+$/.test(part)
  );
  
  // Join the remaining parts and remove file extension
  const publicIdWithExt = withoutVersion.join('/');
  const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
  
  return publicId;
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { 
            invalidate: true 
        });
        console.log("Deletion result:", result);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null; 
    }
};

export {
    uploadOnCloudinary,
    extractPublicIds,
    deleteFromCloudinary
};