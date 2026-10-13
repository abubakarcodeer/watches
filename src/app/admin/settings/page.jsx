"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle2, ImagePlus, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { db } from "../../../lib/firebase";
import { can } from "../../../lib/admin";
import { CURRENCY_SYMBOL, DEFAULT_SETTINGS } from "../../../lib/config";
import { uploadImage } from "../../../lib/uploadImage";
import { IMAGES } from "../../../data/images";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { Card, EmptyState, Field, Loading, PageHeader } from "../../../components/admin/ui";
import ImageCropper from "../../../components/admin/ImageCropper";

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropState, setCropState] = useState({ open: false, image: null });
  const [emailConfigured, setEmailConfigured] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "store"))
      .then((snap) => setForm({ ...DEFAULT_SETTINGS, ...(snap.exists() ? snap.data() : {}) }))
      .catch(() => setForm(DEFAULT_SETTINGS));
    fetch("/api/send-email")
      .then((r) => r.json())
      .then((d) => setEmailConfigured(Boolean(d.configured)))
      .catch(() => setEmailConfigured(false));
  }, []);

  if (!can(userProfile?.role, "manageSettings")) {
    return <EmptyState icon={ShieldAlert} title="No permission" text="Only admins and managers can change store settings." />;
  }
  if (!form) return <Loading />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleHeroUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({ open: true, image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  async function handleCropComplete(blob) {
    setCropState({ open: false, image: null });
    setUploading(true);
    try {
      const url = await uploadImage(blob);
      setForm((f) => ({ ...f, heroImage: url }));
      addToast("Hero image uploaded. Save to publish it.");
    } catch (err) {
      addToast(err.message, "error", 5000);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    const threshold = Number(form.freeShippingThreshold);
    const flat = Number(form.flatShipping);
    if (!(threshold >= 0) || !(flat >= 0)) return addToast("Shipping values must be 0 or more", "error");

    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "store"),
        { ...form, freeShippingThreshold: threshold, flatShipping: flat, updatedAt: serverTimestamp() },
        { merge: true }
      );
      addToast("Settings saved. The store updates instantly.");
    } catch (err) {
      console.error(err);
      addToast("Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Settings"
        subtitle="Changes go live on the storefront as soon as you save."
        actions={
          <button disabled={saving || uploading} className="btn-dark py-2.5">
            {saving ? "Saving…" : "Save settings"}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <h2 className="font-semibold">Homepage hero</h2>
            <Field label="Eyebrow" hint="Small line above the headline">
              <input className="field" value={form.heroEyebrow} onChange={set("heroEyebrow")} />
            </Field>
            <Field label="Headline" hint="Press Enter for a new line. The end of the last line is shown in gold.">
              <textarea className="field min-h-[80px]" value={form.heroTitle} onChange={set("heroTitle")} />
            </Field>
            <Field label="Subtitle" hint="Press Enter for a new line">
              <textarea className="field min-h-[90px]" value={form.heroSubtitle} onChange={set("heroSubtitle")} />
            </Field>
            <Field label="Hero image">
              <div className="flex items-center gap-4">
                <img src={form.heroImage || IMAGES.hero} alt="" className="h-20 w-36 rounded-lg border border-line object-cover" />
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline gap-2 py-2">
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                    {uploading ? "Uploading…" : "Upload image"}
                  </button>
                  {form.heroImage && (
                    <button type="button" onClick={() => setForm({ ...form, heroImage: "" })} className="text-left text-xs text-muted link-underline">
                      Reset to default image
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleHeroUpload(e.target.files?.[0])} />
              </div>
            </Field>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <h2 className="font-semibold">Announcement & delivery</h2>
            <Field label="Announcement bar" hint="Leave empty to hide the bar">
              <input className="field" value={form.announcement} onChange={set("announcement")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Free delivery from (${CURRENCY_SYMBOL})`}>
                <input type="number" min="0" step="1" className="field" value={form.freeShippingThreshold} onChange={set("freeShippingThreshold")} />
              </Field>
              <Field label={`Delivery charge (${CURRENCY_SYMBOL})`}>
                <input type="number" min="0" step="1" className="field" value={form.flatShipping} onChange={set("flatShipping")} />
              </Field>
            </div>
            <Field label="Delivery time" hint="Shown on product pages, e.g. 3–5 working days">
              <input className="field" value={form.deliveryTime} onChange={set("deliveryTime")} />
            </Field>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="font-semibold">Social & contact</h2>
            <Field label="WhatsApp number" hint="Shows a WhatsApp chat button on the store, e.g. 0300 1234567">
              <input type="tel" className="field" value={form.whatsappNumber} onChange={set("whatsappNumber")} placeholder="03XX XXXXXXX" />
            </Field>
            <Field label="Instagram URL">
              <input type="url" className="field" value={form.instagramUrl} onChange={set("instagramUrl")} />
            </Field>
            <Field label="Facebook URL">
              <input type="url" className="field" value={form.facebookUrl} onChange={set("facebookUrl")} />
            </Field>
            <Field label="Twitter URL">
              <input type="url" className="field" value={form.twitterUrl} onChange={set("twitterUrl")} />
            </Field>
            <Field label="TikTok URL">
              <input type="url" className="field" value={form.tiktokUrl} onChange={set("tiktokUrl")} />
            </Field>
            <Field label="YouTube URL">
              <input type="url" className="field" value={form.youtubeUrl} onChange={set("youtubeUrl")} />
            </Field>
            <Field label="Contact phone" hint="Shown in the footer and on the Contact page">
              <input type="tel" className="field" value={form.contactPhone} onChange={set("contactPhone")} />
            </Field>
            <Field label="Address" hint="Press Enter for a new line">
              <textarea className="field min-h-[70px]" value={form.contactAddress} onChange={set("contactAddress")} />
            </Field>
            <Field label="Contact email">
              <input type="email" className="field" value={form.contactEmail} onChange={set("contactEmail")} placeholder="support@watchshop.com" />
            </Field>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Integrations</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                {emailConfigured ? <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" /> : <XCircle size={18} className="mt-0.5 text-forest" />}
                <div>
                  <p className="font-medium">New order email alerts (EmailJS)</p>
                  <p className="text-xs text-muted">
                    {emailConfigured === null
                      ? "Checking…"
                      : emailConfigured
                        ? "Configured. Admin is emailed for every new order."
                        : "Not configured. Add EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY and ADMIN_EMAIL to .env."}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-medium">Image uploads (ImgBB)</p>
                  <p className="text-xs text-muted">Uses IMGBB_API_KEY from .env. Try an upload above to confirm it works.</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <ImageCropper
        open={cropState.open}
        image={cropState.image}
        aspect={16 / 9}
        onCancel={() => setCropState({ open: false, image: null })}
        onComplete={handleCropComplete}
      />
    </form>
  );
}
