import { createClient } from "@supabase/supabase-js";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function registerBillboard(data: {
  id: string;
  address: string;
  owner: string;
  status: string;
  image_url?: string;
  created_at?: string;
  validity_from: string;
  validity_till: string;
  size: string;
  "latitude and latitude": string;
}) {
  const { error } = await supabase.from("billboards").insert([data]);
  return error;
}

// Insert into admin table
export async function insertAdmin(data: {
  admin_name: string;
  adminpass: string;
}) {
  const { error } = await supabase.from("admin").insert([data]);
  return error;
}

// Insert into complaints table
export async function insertComplaint(data: {
  billboard_id: string;
  report_type: string;
  description: string;
  status?: string;
  image_url?: string;
  created_at?: Timestamp;
  validity_from?: Date;
  validity_till?: Date;
}) {
  const { error } = await supabase.from("complaints").insert([data]);
  return error;
}
