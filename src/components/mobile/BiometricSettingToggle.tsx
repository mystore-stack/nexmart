"use client";

import { useEffect, useState } from "react";
import { Fingerprint, Check, ShieldCheck } from "lucide-react";
import { isBiometricsAvailable, isBiometricEnrolled, enrollBiometrics, disableBiometrics } from "@/lib/biometrics";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function BiometricSettingToggle() {
  const { data: session } = useSession();
  const [supported, setSupported] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isBiometricsAvailable().then((res) => {
      setSupported(res);
      setEnrolled(isBiometricEnrolled());
    });
  }, []);

  if (!supported) return null;

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    if (enrolled) {
      disableBiometrics();
      setEnrolled(false);
      toast("Authentification biométrique désactivée");
      setLoading(false);
    } else {
      const user = session?.user;
      const success = await enrollBiometrics(user?.email || "user", user?.name || "Client NexMart");
      if (success) {
        setEnrolled(true);
        toast.success("Empreinte / Biométrie activée avec succès !");
      } else {
        toast.error("Impossible d'activer la biométrie");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm my-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Fingerprint size={22} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900">Connexion biométrique</h4>
          <p className="text-xs text-slate-500">Empreinte digitale / Reconnaissance faciale</p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
          enrolled ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
        }`}
        aria-label="Activer la biométrie"
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
      </button>
    </div>
  );
}
