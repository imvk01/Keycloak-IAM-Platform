import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

type Setting = {
  key: string;
  title: string;
  description: string;
  helper?: string;
};

const userAuthSettings: Setting[] = [
  {
    key: "passkeys",
    title: "Passkeys",
    description:
      "Nutzer können sich mit einem Passkey anmelden. Passkeys werden als alternative Login-Option angezeigt.",
    helper: "Passwort wird entfernt, wenn Passkey aktiviert wird.",
  },
  {
    key: "passwordLoginEnabled",
    title: "Passwort",
    description:
      "Nutzer können sich mit Passwort anmelden. Pflicht bei Registrierung ohne Social Login.",
  },
  {
    key: "emailUser",
    title: "E-Mail Passcodes",
    description: "Login per Einmalcode via E-Mail.",
  },
  {
    key: "smsUser",
    title: "Mobilfunknummer",
    description: "Login per SMS Einmalcode.",
  },
];

const mfaSettings: Setting[] = [
  {
    key: "totp",
    title: "TOTP App",
    description:
      "QR-Code basierte Authenticator App als zweiter Faktor.",
  },
  {
    key: "emailMfa",
    title: "E-Mail Code",
    description: "Fallback 2FA via E-Mail.",
  },
  {
    key: "smsMfa",
    title: "SMS Code",
    description: "Fallback 2FA via SMS.",
  },
];

const GlobalSettings = () => {
  const [activeTab, setActiveTab] = useState<"user" | "mfa">("user");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    passkeys: false,
    passwordLoginEnabled: false,
    emailUser: false,
    smsUser: false,
    totp: false,
    emailMfa: false,
    smsMfa: false,
  });

  const teamId = localStorage.getItem("teamId");
  const list = activeTab === "user" ? userAuthSettings : mfaSettings;

  useEffect(() => {
    const fetchSettings = async () => {
      if (!teamId) {
        setLoading(false);
        console.error("teamId not found in localStorage");
        return;
      }

      try {
        console.log("Fetching settings for teamId:", teamId);

        const res = await axios.get(`/api/global-settings/${teamId}`, {
          withCredentials: true,
        });

        console.log("Settings response:", res.data);

        if (res.data.success && res.data.data) {
          const settings = res.data.data;

          setToggles({
            passkeys: settings.userAuth?.passkeys ?? false,
            passwordLoginEnabled:
              settings.userAuth?.passwordLoginEnabled ?? false,
            emailUser: settings.userAuth?.emailUser ?? false,
            smsUser: settings.userAuth?.smsUser ?? false,
            totp: settings.mfa?.totp ?? false,
            emailMfa: settings.mfa?.emailMfa ?? false,
            smsMfa: settings.mfa?.smsMfa ?? false,
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        alert("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [teamId]);

  const handleToggle = async (key: string) => {
    if (!teamId) {
      alert("teamId not found. Please login again.");
      return;
    }

    const newValue = !toggles[key];

    setToggles((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    let section = "userAuth";
    if (["totp", "emailMfa", "smsMfa"].includes(key)) {
      section = "mfa";
    }

    try {
      setSavingKey(key);

      await axios.patch(
        `/api/global-settings/${teamId}`,
        {
          section,
          key,
          value: newValue,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Failed to save setting:", error);

      setToggles((prev) => ({
        ...prev,
        [key]: !newValue,
      }));

      alert("Failed to save setting");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-6">
            Globale Einstellungen
          </h1>

          <div className="flex gap-8">
            <section className="w-80 bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="px-4 py-4 border-b border-slate-200 text-right font-serif text-sm font-semibold text-slate-800">
                Authentifizierungs Einstellungen
              </div>

              <div className="flex flex-col items-end text-sm">
                <button
                  onClick={() => setActiveTab("user")}
                  className={`px-4 py-3 w-full text-right border-b border-slate-200 ${
                    activeTab === "user"
                      ? "bg-slate-200 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Benutzer Authentifizierung
                </button>

                <button
                  onClick={() => setActiveTab("mfa")}
                  className={`px-4 py-3 w-full text-right ${
                    activeTab === "mfa"
                      ? "bg-slate-200 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Multifaktor Authentifizierung
                </button>
              </div>
            </section>

            <section className="flex-1">
              <h2 className="text-lg items-right font-semibold text-slate-800 mb-4">
                {activeTab === "user"
                  ? "Benutzer Authentifizierung"
                  : "Multifaktor Authentifizierung"}
              </h2>

              {loading ? (
                <p className="text-sm text-slate-500">Loading settings...</p>
              ) : (
                list.map((item) => (
                  <div
                    key={item.key}
                    className="bg-white border border-slate-200 rounded-sm shadow-sm mb-4 p-5 flex justify-between items-start"
                  >
                    <div className="pr-6">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {item.description}
                      </p>
                      {item.helper && (
                        <p className="text-[11px] text-slate-400 mt-2">
                          {item.helper}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <button
                        onClick={() => handleToggle(item.key)}
                        disabled={savingKey === item.key}
                        className={`w-11 h-6 flex items-center rounded-full transition ${
                          toggles[item.key] ? "bg-blue-500" : "bg-slate-300"
                        } ${savingKey === item.key ? "opacity-60" : ""}`}
                      >
                        <span
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                            toggles[item.key]
                              ? "translate-x-5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>

                      {savingKey === item.key && (
                        <span className="text-[10px] text-slate-400 mt-1">
                          Saving...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GlobalSettings;