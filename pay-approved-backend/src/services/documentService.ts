import { supabaseAdmin } from "../db/supabase";
import { Document } from "../types";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "documents";

export const documentService = {
  async upload(contractId: string, file: Express.Multer.File, fileName: string): Promise<Document> {
    const filePath = `${contractId}/${uuidv4()}-${file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }

    const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    const { data: doc, error: insertError } = await supabaseAdmin
      .from("documents")
      .insert({
        contract_id: contractId,
        name: fileName,
        type: file.mimetype,
        url: publicUrl.publicUrl,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save document record: ${insertError.message}`);
    }

    return mapDocumentRow(doc);
  },

  async getByContractId(contractId: string): Promise<Document[]> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("contract_id", contractId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
    return (data ?? []).map(mapDocumentRow);
  },

  async getById(id: string): Promise<Document | null> {
    const { data, error } = await supabaseAdmin.from("documents").select("*").eq("id", id).single();

    if (error || !data) {
      return null;
    }
    return mapDocumentRow(data);
  },

  async updateStatus(id: string, status: "approved" | "rejected"): Promise<Document | null> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }
    return mapDocumentRow(data);
  },

  async getPending(): Promise<Document[]> {
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("status", "pending")
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending documents: ${error.message}`);
    }
    return (data ?? []).map(mapDocumentRow);
  },
};

function mapDocumentRow(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    name: row.name as string,
    type: row.type as string,
    url: row.url as string,
    status: row.status as Document["status"],
    uploadedAt: row.uploaded_at as string,
  };
}
