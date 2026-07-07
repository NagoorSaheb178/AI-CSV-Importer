import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { CRMRecord } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { imported, skipped } = body as {
      imported: CRMRecord[];
      skipped: Record<string, string>[];
    };

    if (!Array.isArray(imported)) {
      return NextResponse.json(
        { error: "Invalid payload: imported must be an array" },
        { status: 400 }
      );
    }

    const batch_id = uuidv4();
    const docsToInsert = imported.map((record) => ({
      ...record,
      imported_at: new Date(),
      batch_id,
    }));

    const savedLeads = await Lead.insertMany(docsToInsert, { ordered: false });

    return NextResponse.json(
      {
        success: true,
        total_imported: savedLeads.length,
        total_skipped: skipped?.length ?? 0,
        batch_id,
        imported: savedLeads,
        skipped: skipped ?? [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving leads:", error);
    return NextResponse.json(
      { error: "Failed to save leads to database" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch_id = searchParams.get("batch_id");

    const query = batch_id ? { batch_id } : {};
    const leads = await Lead.find(query).sort({ imported_at: -1 }).limit(500);

    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
