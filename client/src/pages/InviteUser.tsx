import { useCallback, useEffect, useMemo, useState } from "react";
import { MdSearch, MdBusiness } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

type BackendUser = {
  _id: string;
  vorname: string;
  nachname?: string;
  benutzername?: string;
  email: string;
};

type EmailItem = {
  _id?: string;
  email: string;
};

type SubOrganization = {
  _id: string;
  name: string;
  emails?: EmailItem[];
};

type Organization = {
  _id: string;
  name: string;
  emails?: EmailItem[];
  subOrganizations?: SubOrganization[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const InviteUser = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedSubOrganizationId, setSelectedSubOrganizationId] =
    useState("");

  const teamId = localStorage.getItem("teamId");

  const fetchUsers = useCallback(async () => {
    if (!teamId) {
      alert("No teamId found. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/users/team/${teamId}`, {
        withCredentials: true,
      });

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else if (Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Benutzer konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const fetchOrganizations = useCallback(async () => {
    if (!teamId) return;

    try {
      setOrgLoading(true);

      const res = await axios.get(`${API_BASE}/organizations/team/${teamId}`, {
        withCredentials: true,
      });

      if (Array.isArray(res.data)) {
        setOrganizations(res.data);
      } else if (Array.isArray(res.data.data)) {
        setOrganizations(res.data.data);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      alert("Organisationen konnten nicht geladen werden");
    } finally {
      setOrgLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUsers(), fetchOrganizations()]);
    };

    loadData();
  }, [fetchUsers, fetchOrganizations]);

  const filteredUsers = users.filter((u) => {
    const fullName =
      `${u.vorname || ""} ${u.nachname || ""}`.trim() ||
      u.benutzername ||
      "";

    return `${fullName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const selectedOrganization = useMemo(() => {
    return (
      organizations.find((org) => org._id === selectedOrganizationId) || null
    );
  }, [organizations, selectedOrganizationId]);

  const selectedUserEmails = useMemo(() => {
    return users
      .filter((user) => selectedUserIds.includes(user._id))
      .map((user) => user.email);
  }, [users, selectedUserIds]);

  const manualEmailList = useMemo(() => {
    return [
      ...new Set(
        manualEmails
          .split(/[\n,; ]+/)
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  }, [manualEmails]);

  const finalEmailList = useMemo(() => {
    return [...new Set([...selectedUserEmails, ...manualEmailList])];
  }, [selectedUserEmails, manualEmailList]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (!selectedOrganizationId) {
      alert("Bitte wählen Sie zuerst eine Organisation aus.");
      return;
    }

    if (finalEmailList.length === 0) {
      alert(
        "Bitte wählen Sie Benutzer aus oder geben Sie E-Mail-Adressen ein."
      );
      return;
    }

    try {
      if (selectedSubOrganizationId) {
        await axios.put(
          `${API_BASE}/suborganizations/${selectedOrganizationId}/${selectedSubOrganizationId}/append-emails`,
          { emails: finalEmailList },
          { withCredentials: true }
        );
      } else {
        await axios.put(
          `${API_BASE}/organizations/${selectedOrganizationId}/append-emails`,
          { emails: finalEmailList },
          { withCredentials: true }
        );
      }

      alert("E-Mails erfolgreich gespeichert.");

      setSelectedUserIds([]);
      setManualEmails("");
      setSelectedSubOrganizationId("");

      fetchOrganizations();
    } catch (error) {
      console.error("Failed to save emails:", error);
      alert("E-Mails konnten nicht gespeichert werden.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <main className="flex-1 flex flex-col">
        <Header />

        <div className="min-h-screen flex bg-slate-100">
          <Sidebar />

          <main className="flex-1 flex flex-col px-4 py-4">
            <div className="mb-4">
              <p className="text-sm text-slate-700 mb-1 font-medium">
                Benutzer suchen
              </p>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                  <MdSearch className="w-4 h-4" />
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex flex-1 gap-4">
              <section className="w-[35%] bg-white border border-slate-200 rounded-sm">
                {loading ? (
                  <div className="p-4 text-sm text-slate-500">
                    Benutzer werden geladen...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    Keine Benutzer gefunden
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const fullName =
                        `${user.vorname || ""} ${user.nachname || ""}`.trim() ||
                        user.benutzername ||
                        "Unbekannter Benutzer";

                      return (
                        <li
                          key={user._id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        >
                          <div className="flex items-center min-w-0">
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white mr-3 shrink-0">
                              <FaUser className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {fullName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="w-4 h-4 accent-blue-500 shrink-0"
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="w-[65%] bg-slate-50 border border-slate-200 p-4 flex flex-col rounded-sm">
                <div className="mb-4">
                  <p className="text-sm text-slate-700 mb-1 font-medium">
                    Email Adressen eingeben
                  </p>

                  <textarea
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                    placeholder="Mehrere E-Mails mit Komma, Leerzeichen oder neuer Zeile eingeben"
                    className="w-full h-28 border border-slate-300 bg-white text-sm p-2 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="bg-white border border-slate-200 mb-6 rounded-sm">
                  <div className="flex items-center px-3 py-2 border-b border-slate-200">
                    <MdBusiness className="w-5 h-5 text-slate-700 mr-3" />

                    <p className="text-sm font-medium text-slate-800 flex-1">
                      Organisation wechseln
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowOrgPicker((prev) => !prev)}
                      className="text-lg text-slate-500"
                    >
                      +
                    </button>
                  </div>

                  {showOrgPicker ? (
                    <div className="px-3 py-3 space-y-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Organisation
                        </label>
                        <select
                          value={selectedOrganizationId}
                          onChange={(e) => {
                            setSelectedOrganizationId(e.target.value);
                            setSelectedSubOrganizationId("");
                          }}
                          className="w-full border border-slate-300 bg-white text-sm p-2 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Organisation auswählen</option>
                          {organizations.map((org) => (
                            <option key={org._id} value={org._id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          SubOrganisation
                        </label>
                        <select
                          value={selectedSubOrganizationId}
                          onChange={(e) =>
                            setSelectedSubOrganizationId(e.target.value)
                          }
                          disabled={!selectedOrganization}
                          className="w-full border border-slate-300 bg-white text-sm p-2 rounded-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-100"
                        >
                          <option value="">Nur Organisation speichern</option>
                          {selectedOrganization?.subOrganizations?.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-xs text-slate-400 italic">
                      Organisation auswählen oder suchen
                    </div>
                  )}
                </div>

                <div className="mb-4 text-xs text-slate-600">
                  <p>
                    Ausgewählte Benutzer:{" "}
                    <span className="font-medium">{selectedUserIds.length}</span>
                  </p>
                  <p>
                    Gesamte E-Mails zum Speichern:{" "}
                    <span className="font-medium">{finalEmailList.length}</span>
                  </p>
                  {selectedOrganization && (
                    <p>
                      Ziel:{" "}
                      <span className="font-medium">
                        {selectedOrganization.name}
                        {selectedSubOrganizationId
                          ? ` / ${
                              selectedOrganization.subOrganizations?.find(
                                (s) => s._id === selectedSubOrganizationId
                              )?.name || ""
                            }`
                          : ""}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleInvite}
                    disabled={
                      !selectedOrganizationId ||
                      finalEmailList.length === 0 ||
                      orgLoading
                    }
                    className="px-6 py-2 text-sm text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    Einladen
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </main>
    </div>
  );
};

export default InviteUser;