import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 503 }
    );
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "No confirmation ID provided" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Update the waiting list entry status
    const { data, error } = await supabase
      .from("waiting_list")
      .update({ status: "CONFIRMED" })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid confirmation ID or already confirmed" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Email confirmed successfully", entry: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
