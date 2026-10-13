import { NextResponse } from "next/server";
import { verifyStaff } from "../../../lib/server/verifyStaff";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  if (!process.env.IMGBB_API_KEY) {
    return NextResponse.json({ success: false, error: "IMGBB_API_KEY is not configured" }, { status: 500 });
  }

  const staff = await verifyStaff(request, ["admin", "manager"]);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Not authorised" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }
    if (!image.type?.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 });
    }
    if (image.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Image must be smaller than 8 MB" }, { status: 400 });
    }

    const body = new FormData();
    body.append("image", image);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { method: "POST", body });
    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ success: false, error: data.error?.message || "ImgBB upload failed" }, { status: 502 });
    }
    return NextResponse.json({ success: true, url: data.data.display_url || data.data.url });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
