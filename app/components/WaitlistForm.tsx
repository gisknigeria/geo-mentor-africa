"use client";

import { FormEvent, useState } from "react";
import { Mail, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface WaitlistFormState {
  isSubmitting: boolean;
  message: string;
  isSuccess: boolean;
  isError: boolean;
}

export function WaitlistForm() {
  const [formState, setFormState] = useState<WaitlistFormState>({
    isSubmitting: false,
    message: "",
    isSuccess: false,
    isError: false,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    role: "School",
    country: "",
    message: "",
    interestedIn: {
      mentorship: false,
      fieldCapture: false,
      partnershipFunding: false,
      research: false,
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({
      isSubmitting: true,
      message: "",
      isSuccess: false,
      isError: false,
    });

    try {
      const interested = Object.entries(formData.interestedIn)
        .filter(([, checked]) => checked)
        .map(([key]) => key);

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          organization: formData.organization.trim() || null,
          role: formData.role,
          country: formData.country.trim() || null,
          message: formData.message.trim() || null,
          interested_in: interested.length > 0 ? interested : null,
        }),
      });

      if (response.ok) {
        setFormState({
          isSubmitting: false,
          message:
            "Thank you! Check your email to confirm your spot on the waiting list.",
          isSuccess: true,
          isError: false,
        });
        setFormData({
          fullName: "",
          email: "",
          organization: "",
          role: "School",
          country: "",
          message: "",
          interestedIn: {
            mentorship: false,
            fieldCapture: false,
            partnershipFunding: false,
            research: false,
          },
        });
      } else {
        const error = await response.json();
        setFormState({
          isSubmitting: false,
          message:
            error.error ||
            "Something went wrong. Please try again or contact us.",
          isSuccess: false,
          isError: true,
        });
      }
    } catch (err) {
      setFormState({
        isSubmitting: false,
        message:
          "Network error. Please check your connection and try again.",
        isSuccess: false,
        isError: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="fullName" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
          FULL NAME *
        </label>
        <input
          id="fullName"
          type="text"
          required
          placeholder="Your name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
          EMAIL ADDRESS *
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="organization" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
          SCHOOL / ORGANIZATION
        </label>
        <input
          id="organization"
          type="text"
          placeholder="Name of your institution"
          value={formData.organization}
          onChange={(e) =>
            setFormData({ ...formData, organization: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Role and Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="role" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
            I'M INTERESTED AS *
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="School">School / Educator</option>
            <option value="Mentor">Geo-Mentor / Expert</option>
            <option value="Partner">Partner / Sponsor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="country" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
            COUNTRY / REGION
          </label>
          <input
            id="country"
            type="text"
            placeholder="e.g., Kenya, West Africa"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      {/* Interested In Checkboxes */}
      <div>
        <label className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-3">
          WHAT ARE YOU INTERESTED IN?
        </label>
        <div className="space-y-2">
          {[
            { key: "mentorship", label: "Mentorship & guidance for students" },
            { key: "fieldCapture", label: "Field data capture & biodiversity tracking" },
            {
              key: "partnershipFunding",
              label: "Partnership opportunities & funding",
            },
            { key: "research", label: "Research & data access" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  formData.interestedIn[
                    key as keyof typeof formData.interestedIn
                  ]
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interestedIn: {
                      ...formData.interestedIn,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200 cursor-pointer"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-black tracking-[.14em] text-emerald-700 mb-2">
          MESSAGE (OPTIONAL)
        </label>
        <textarea
          id="message"
          placeholder="Tell us about your interest or how you'd like to participate..."
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Status Messages */}
      {formState.message && (
        <div
          className={`flex gap-3 rounded-lg px-4 py-3 text-sm ${
            formState.isSuccess
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {formState.isSuccess ? (
            <CheckCircle className="size-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
          )}
          <span>{formState.message}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-sm py-3.5 transition"
      >
        {formState.isSubmitting ? (
          <>
            <Loader className="size-4 animate-spin" />
            Joining waiting list...
          </>
        ) : (
          <>
            <Mail className="size-4" />
            Join the waiting list
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center">
        We'll send you updates about our launch and early access opportunities.
        We won't share your email with anyone else.
      </p>
    </form>
  );
}
