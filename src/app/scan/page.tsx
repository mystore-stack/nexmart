"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, RefreshCw, AlertCircle, ShoppingCart, Search, Check } from "lucide-react";
import toast from "react-hot-toast";

interface ScannedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock?: number;
  category?: { name: string };
  brand?: { name: string };
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "nexmart-scanner-viewfinder";

  const startScanner = async () => {
    setCameraError(null);
    setProduct(null);
    setNotFoundMessage(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId, {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        });
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError("Aucune caméra détectée sur cet appareil.");
        return;
      }

      // Prefer back camera
      const backCam = cameras.find((c) => /back|rear|environment/i.test(c.label)) || cameras[0];

      await scannerRef.current.start(
        backCam.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error("[NexScan] Camera start error:", err);
      if (err?.name === "NotAllowedError" || String(err).includes("Permission")) {
        setCameraError("L'accès à la caméra a été refusé. Veuillez l'autoriser dans les paramètres.");
      } else {
        setCameraError("Impossible d'accéder à la caméra. Utilisez la saisie manuelle ci-dessous.");
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (e) {
        console.error("Stop error", e);
      }
    }
  };

  const handleCodeDetected = async (code: string) => {
    // Vibrate briefly on detection if available
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80);
    }

    setScannedCode(code);
    await stopScanner();
    await lookupProduct(code);
  };

  const lookupProduct = async (code: string) => {
    setLookingUp(true);
    setProduct(null);
    setNotFoundMessage(null);

    try {
      const res = await fetch("/api/mobile/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success && data.found) {
        setProduct(data.product);
        toast.success("Produit trouvé !");
      } else {
        setNotFoundMessage(data.message || "Code non reconnu");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLookingUp(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setScannedCode(manualInput.trim());
    lookupProduct(manualInput.trim());
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-sm">NexScan</h1>
          <p className="text-[11px] text-emerald-400">Scanner QR & Code-barres</p>
        </div>
        <button
          onClick={scanning ? stopScanner : startScanner}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          aria-label="Recharger"
        >
          <RefreshCw size={16} className={scanning ? "" : "opacity-50"} />
        </button>
      </div>

      {/* Viewfinder Container */}
      <div className="relative max-w-sm mx-auto mt-4 px-4">
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center">
          <div id={containerId} className="w-full h-full" />

          {/* Scanner UI Overlay Reticle */}
          {scanning && !product && !lookingUp && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="relative w-60 h-60 border-2 border-emerald-400/80 rounded-2xl">
                {/* Corner markers */}
                <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_12px_#10b981]" />
              </div>
              <p className="text-xs text-slate-400 mt-4 bg-slate-900/80 px-3 py-1 rounded-full">
                Placez le code dans le cadre
              </p>
            </div>
          )}

          {/* Camera Error State */}
          {cameraError && !scanning && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle size={40} className="text-amber-400 mb-3" />
              <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
              >
                Réessayer la caméra
              </button>
            </div>
          )}

          {/* Looking up loader */}
          {lookingUp && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-emerald-400 font-medium">Recherche du produit...</p>
            </div>
          )}
        </div>
      </div>

      {/* Scanned Result Card */}
      {product && (
        <div className="max-w-sm mx-auto px-4 mt-6 animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-3">
              <Check size={16} />
              <span>Produit identifié avec succès</span>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                <Image
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">{product.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">SKU: {product.sku}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-emerald-400 font-extrabold text-base">
                    {product.price.toLocaleString("fr-MA")} MAD
                  </span>
                  {product.comparePrice && (
                    <span className="text-[11px] text-slate-500 line-through">
                      {product.comparePrice.toLocaleString("fr-MA")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition"
              >
                Voir le produit
              </Link>
              <button
                onClick={() => {
                  setProduct(null);
                  startScanner();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Nouveau scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Found State */}
      {notFoundMessage && !product && !lookingUp && (
        <div className="max-w-sm mx-auto px-4 mt-6">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-4 text-center">
            <p className="text-xs text-rose-300 mb-3">{notFoundMessage}</p>
            <button
              onClick={() => {
                setNotFoundMessage(null);
                startScanner();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Scanner à nouveau
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="max-w-sm mx-auto px-4 mt-8">
        <form onSubmit={handleManualSearch} className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800">
          <p className="text-[11px] text-slate-400 mb-2 font-medium">Ou saisissez un code / SKU manuellement :</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Ex: SKU-12345 ou slug"
              className="flex-1 bg-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none border border-slate-700 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Search size={14} />
              Chercher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
