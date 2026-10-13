"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Drawer } from "./ui";

/**
 * Basic canvas utility to get the cropped image from react-easy-crop results.
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

export default function ImageCropper({ open, image, aspect = 1, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onComplete(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  if (!open) return null;

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      title="Crop Image"
      footer={
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-outline flex-1 py-2.5">
            Cancel
          </button>
          <button type="button" onClick={handleDone} className="btn-dark flex-1 py-2.5">
            Crop & Upload
          </button>
        </div>
      }
    >
      <div className="relative h-[400px] w-full bg-sand">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="mt-4 px-2">
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">Zoom</label>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          className="w-full accent-forest"
        />
      </div>
    </Drawer>
  );
}
