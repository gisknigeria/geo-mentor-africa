import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendKey = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 503 }
    );
  }

  if (!resendKey) {
    console.warn("Email service not configured. Registrations will be saved but confirmation emails not sent.");
  }

  try {
    const body = await request.json();
    const {
      full_name,
      email,
      organization,
      role,
      country,
      message,
      interested_in,
      phone,
      state_region,
      city,
      job_title,
      professional_field,
      website,
      participation_type,
      contribution_areas,
      expertise_summary,
      commitment_level,
      estimated_time,
      geographic_interest,
      resource_offers,
      additional_information,
      consent_contact,
      consent_standards,
      consent_data,
      wants_updates,
    } = body;

    // Validate required fields
    const hasExpandedRegistration = participation_type !== undefined;
    if (!full_name || !email || (hasExpandedRegistration && (!country || !consent_contact || !consent_standards || !consent_data))) {
      return NextResponse.json(
        { error: "Please complete the required fields and consent statements" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Check if email already exists
    const { data: existing } = await supabase
      .from("waiting_list")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already on the waiting list" },
        { status: 409 }
      );
    }

    // Insert into waiting list
    const { data: waitlistEntry, error: insertError } = await supabase
      .from("waiting_list")
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        organization: organization || null,
        role: role || null,
        country: country || null,
        message: message || null,
        interested_in: interested_in || [],
        phone: phone || null,
        state_region: state_region || null,
        city: city || null,
        job_title: job_title || null,
        professional_field: professional_field || null,
        website: website || null,
        participation_type: participation_type || null,
        contribution_areas: contribution_areas || [],
        expertise_summary: expertise_summary || null,
        commitment_level: commitment_level || null,
        estimated_time: estimated_time || null,
        geographic_interest: geographic_interest || null,
        resource_offers: resource_offers || [],
        additional_information: additional_information || null,
        consent_contact: Boolean(consent_contact),
        consent_standards: Boolean(consent_standards),
        consent_data: Boolean(consent_data),
        wants_updates: Boolean(wants_updates),
        status: "PENDING",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to register for waiting list" },
        { status: 500 }
      );
    }

    // Send confirmation email if Resend is configured
    if (resendKey) {
      const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/waitlist/confirm?id=${waitlistEntry.id}`;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "GeoMentor <onboarding@resend.dev>",
            to: email,
            subject: "Welcome to GeoMentor Africa - Confirm Your Waiting List Spot",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0b4436; margin-bottom: 20px;">Welcome to GeoMentor Africa!</h2>
                
                <p>Hi ${full_name.split(" ")[0]},</p>
                
                <p>Thank you for joining our waiting list! We're excited to have you interested in the GeoMentor Africa programme.</p>
                
                <p>Please confirm your email address to secure your spot on the waiting list:</p>
                
                <p style="margin: 30px 0;">
                  <a href="${confirmationUrl}" style="background-color: #0b4436; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Confirm Your Email
                  </a>
                </p>
                
                <p><strong>Your Interest Areas:</strong></p>
                <ul>
                  ${interested_in && interested_in.length > 0
                    ? interested_in.map((item: string) => `<li>${item}</li>`).join("")
                    : "<li>Not specified</li>"
                  }
                </ul>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #666;">
                  If you did not sign up for this service, please disregard this email.
                </p>
                
                <p style="font-size: 12px; color: #666;">
                  Best regards,<br>
                  The GeoMentor Africa Team
                </p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Email send failed:", await emailResponse.text());
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the registration if email fails to send
      }
    }

    return NextResponse.json(
      {
        message: "Successfully registered for waiting list",
        id: waitlistEntry.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
