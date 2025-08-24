import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Register Billboard Function
export const registerBillboard = async (billboardData: {
  id: string;
  address: string;
  owner: string;
  status: string;
  image_url: string;
  validity_from: string;
  validity_till: string;
  size: string;
  gps_latitude: number;
  gps_longitude: number;
}) => {
  try {
    const { data, error } = await supabase
      .from("billboards")
      .insert([billboardData]);

    if (error) {
      console.error("Billboard registration error:", error);
      return error;
    }

    console.log("Billboard registered successfully:", data);
    return null;
  } catch (error) {
    console.error("Unexpected error during billboard registration:", error);
    return error;
  }
};

// Insert Complaint Function (update this based on your complaints table structure)
export const insertComplaint = async (complaintData: {
  billboard_id: string;
  report_type: string;
  description: string;
  status: string;
  image_url: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("complaints") // Make sure this table exists
      .insert([complaintData]);

    if (error) {
      console.error("Complaint insertion error:", error);
      return error;
    }

    console.log("Complaint inserted successfully:", data);
    return null;
  } catch (error) {
    console.error("Unexpected error during complaint insertion:", error);
    return error;
  }
};

// Upload image to Supabase Storage
export const uploadImageToSupabase = async (
  file: File,
  bucketName: string = "adminbillboard"
) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Image upload error:", error);
      return { error, data: null, publicUrl: null };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return { error: null, data, publicUrl };
  } catch (error) {
    console.error("Unexpected error during image upload:", error);
    return { error, data: null, publicUrl: null };
  }
};
