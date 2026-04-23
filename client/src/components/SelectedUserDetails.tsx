import { useMemo, useState } from "react";
import axios from "axios";
import {
  MdBusiness,
  MdEmail,
  MdPhoneAndroid,
  MdMoreVert,
  MdClose,
  MdAdd,
} from "react-icons/md";
import { FaUser } from "react-icons/fa";

type BackendUser = {
  _id: string;
  vorname: string;
  nachname?: string;
  benutzername?: string;
  email: string;
  telefonnummer?: string;
  organizationId: string;
  subOrganizationId?: string | null;

  systemAdministrator?: boolean;
  globalUserAdministrator?: boolean;
  globalThirdLevelUser?: boolean;
};

interface SubOrganization {
  _id: string;
  name: string;
}

interface Organization {
  _id: string;
  name: string;
  subOrganizations?: SubOrganization[];
}

type SelectedUserDetailsProps = {
  selectedUser: BackendUser;
  selectedUserOrganization: Organization | null;
  selectedUserSubOrganization: SubOrganization | null;
  organizations?: Organization[];
  onClose: () => void;
  onDelete: () => void;
  onUserUpdated?: () => void;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SelectedUserDetails = ({
  selectedUser,
  selectedUserOrganization,
  selectedUserSubOrganization,
  organizations = [],
  onClose,
  onUserUpdated,
}: SelectedUserDetailsProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userEnabled, setUserEnabled] = useState(true);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [permissions, setPermissions] = useState({
    systemAdministrator: !!selectedUser.systemAdministrator,
    globalUserAdministrator: !!selectedUser.globalUserAdministrator,
    globalThirdLevelUser: !!selectedUser.globalThirdLevelUser,
  });

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    selectedUser.organizationId || ""
  );
  const [selectedSubOrganizationId, setSelectedSubOrganizationId] = useState(
    selectedUser.subOrganizationId || ""
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [editForm, setEditForm] = useState({
    vorname: selectedUser.vorname || "",
    nachname: selectedUser.nachname || "",
    benutzername: selectedUser.benutzername || "",
    email: selectedUser.email || "",
    telefonnummer: selectedUser.telefonnummer || "",
  });

  const selectedOrganization = useMemo(
    () => organizations.find((org) => org._id === selectedOrganizationId),
    [organizations, selectedOrganizationId]
  );

  const availableSubOrganizations =
    selectedOrganization?.subOrganizations || [];

  const savePermissions = async (nextPermissions: {
    systemAdministrator: boolean;
    globalUserAdministrator: boolean;
    globalThirdLevelUser: boolean;
  }) => {
    try {
      setSavingPermissions(true);

      await axios.put(
        `${API_BASE}/users/${selectedUser._id}/permissions`,
        nextPermissions,
        { withCredentials: true }
      );

      onUserUpdated?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Fehler beim Speichern der Berechtigungen"
        );
      } else {
        alert("Etwas ist schiefgelaufen");
      }
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrganizationId) {
      alert("Bitte wählen Sie eine Organisation aus");
      return;
    }

    try {
      setSavingOrganization(true);

      const res = await axios.put(
        `${API_BASE}/users/${selectedUser._id}`,
        {
          organizationId: selectedOrganizationId,
          subOrganizationId: selectedSubOrganizationId || null,
        },
        { withCredentials: true }
      );

      alert(res.data.message || "Organisation erfolgreich aktualisiert");
      setShowOrgModal(false);
      onUserUpdated?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Fehler beim Aktualisieren der Organisation"
        );
      } else {
        alert("Etwas ist schiefgelaufen");
      }
    } finally {
      setSavingOrganization(false);
    }
  };

  const handleSaveUser = async () => {
    if (!editForm.vorname.trim()) {
      alert("Vorname ist erforderlich");
      return;
    }

    if (!editForm.email.trim()) {
      alert("E-Mail ist erforderlich");
      return;
    }

    try {
      setSavingUser(true);

      const payload = {
        vorname: editForm.vorname.trim(),
        nachname: editForm.nachname.trim(),
        benutzername: editForm.benutzername.trim(),
        email: editForm.email.trim(),
        telefonnummer: editForm.telefonnummer.trim(),
      };

      const res = await axios.put(
        `${API_BASE}/users/${selectedUser._id}`,
        payload,
        { withCredentials: true }
      );

      alert(res.data.message || "Benutzer erfolgreich aktualisiert");
      setShowEditModal(false);
      setShowUserMenu(false);
      onUserUpdated?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Fehler beim Aktualisieren des Benutzers"
        );
      } else {
        alert("Etwas ist schiefgelaufen");
      }
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      `Möchten Sie ${selectedUser.vorname || "diesen Benutzer"} wirklich löschen?`
    );

    if (!confirmed) return;

    try {
      setDeletingUser(true);

      const res = await axios.delete(`${API_BASE}/users`, {
        data: {
          userIds: [selectedUser._id],
        },
        withCredentials: true,
      });

      setShowUserMenu(false);
      onUserUpdated?.();
      onClose();

      alert(res.data.message || "Benutzer erfolgreich gelöscht");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Delete user error:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message || "Fehler beim Löschen des Benutzers"
        );
      } else {
        console.error("Delete user error:", error);
        alert("Etwas ist schiefgelaufen");
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const fullName =
    `${selectedUser.vorname || ""} ${selectedUser.nachname || ""}`.trim() ||
    selectedUser.benutzername ||
    "Unbekannter Benutzer";

  return (
    <>
      <div className="h-full flex flex-col relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-medium text-blue-600 leading-tight">
              {fullName}
            </h2>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => setUserEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                userEnabled ? "bg-blue-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  userEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="text-slate-800"
            >
              <MdMoreVert className="w-5 h-5" />
            </button>

            <button type="button" onClick={onClose} className="text-slate-800">
              <MdClose className="w-6 h-6" />
            </button>

            {showUserMenu && (
              <div className="absolute top-10 right-8 w-55 bg-white border border-slate-200 shadow-lg rounded-sm z-30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                >
                  Benutzer bearbeiten
                </button>

                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  {deletingUser ? "Wird gelöscht..." : "Benutzer löschen"}
                </button>

                <div className="border-t border-slate-200" />

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Die Berechtigungen werden vom Administrator festgelegt. Es ist nicht erforderlich, das Passwort zu ändern – Sie sind Administrator."
                    )
                  }
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                >
                  Passwort zurücksetzen
                </button>

                <div className="border-t border-slate-200" />

                <div className="px-4 py-3">
                  <p className="text-sm">Autorisierung</p>
                  <p className="text-xs text-slate-700 mt-1">
                    Für Organisationen
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <FaUser className="w-4 h-4 text-black" />
              <p className="text-sm text-slate-800">
                {selectedUser.benutzername || "-"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MdEmail className="w-4 h-4 text-black" />
              <p className="text-sm text-slate-800 break-all">
                {selectedUser.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MdPhoneAndroid className="w-4 h-4 text-black" />
              <p className="text-sm text-slate-800">
                {selectedUser.telefonnummer || "-"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-3">
              Globale Berechtigungen
            </h3>

            <div className="space-y-3 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={permissions.systemAdministrator}
                  disabled={savingPermissions}
                  onChange={(e) => {
                    const nextPermissions = {
                      ...permissions,
                      systemAdministrator: e.target.checked,
                    };
                    setPermissions(nextPermissions);
                    savePermissions(nextPermissions);
                  }}
                />
                <span>Systemadministrator</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={permissions.globalUserAdministrator}
                  disabled={savingPermissions}
                  onChange={(e) => {
                    const nextPermissions = {
                      ...permissions,
                      globalUserAdministrator: e.target.checked,
                    };
                    setPermissions(nextPermissions);
                    savePermissions(nextPermissions);
                  }}
                />
                <span>Globaler Benutzeradministrator</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={permissions.globalThirdLevelUser}
                  disabled={savingPermissions}
                  onChange={(e) => {
                    const nextPermissions = {
                      ...permissions,
                      globalThirdLevelUser: e.target.checked,
                    };
                    setPermissions(nextPermissions);
                    savePermissions(nextPermissions);
                  }}
                />
                <span>Globaler 3rd-Level Benutzer</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-3">
              Benutzer Authentifizierung
            </h3>
            <p className="text-sm italic text-slate-700 leading-6">
              Der Benutzer kann sich momentan nicht anmelden. Wenn die globalen
              Einstellungen eine Authentifizierung zulassen, muss der Benutzer
              seine Konfiguration noch abschließen.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-3">
              Multifaktor Authentifizierung
            </h3>
            <p className="text-sm italic text-slate-700 leading-6">
              Entweder sehen die globalen Einstellungen keine 2-FA
              Authentifizierung vor oder der Benutzer hat kein Gerät dafür
              eingerichtet.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3">
          <MdBusiness className="w-5 h-5 text-slate-800 mt-1" />

          <div className="flex-1 border border-slate-300 bg-slate-100 rounded-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-slate-800">Organisation wechseln</p>
              <button
                type="button"
                onClick={() => setShowOrgModal(true)}
                disabled={organizations.length === 0}
                className="text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdAdd className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-sm text-slate-700">
                <span>{selectedUserOrganization?.name || "Keine"}</span>
                {selectedUserSubOrganization?.name ? (
                  <span className="text-slate-500">
                    / {selectedUserSubOrganization.name}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOrgModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-107.5 rounded-md shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Organisation ändern
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500">Organisation *</label>
                <select
                  value={selectedOrganizationId}
                  onChange={(e) => {
                    setSelectedOrganizationId(e.target.value);
                    setSelectedSubOrganizationId("");
                  }}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Organisation auswählen</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>

                {organizations.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    Keine Organisationen verfügbar
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  SubOrganisation
                </label>
                <select
                  value={selectedSubOrganizationId}
                  onChange={(e) => setSelectedSubOrganizationId(e.target.value)}
                  disabled={!selectedOrganizationId}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-100"
                >
                  <option value="">Keine</option>
                  {availableSubOrganizations.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowOrgModal(false);
                  setSelectedOrganizationId(selectedUser.organizationId || "");
                  setSelectedSubOrganizationId(
                    selectedUser.subOrganizationId || ""
                  );
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-sm"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={handleUpdateOrganization}
                disabled={savingOrganization}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {savingOrganization ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-125 rounded-md shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Benutzer bearbeiten
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">Vorname *</label>
                <input
                  type="text"
                  value={editForm.vorname}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      vorname: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Nachname</label>
                <input
                  type="text"
                  value={editForm.nachname}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nachname: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">Benutzername</label>
                <input
                  type="text"
                  value={editForm.benutzername}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      benutzername: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">E-Mail *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">Telefonnummer</label>
                <input
                  type="text"
                  value={editForm.telefonnummer}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      telefonnummer: e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({
                    vorname: selectedUser.vorname || "",
                    nachname: selectedUser.nachname || "",
                    benutzername: selectedUser.benutzername || "",
                    email: selectedUser.email || "",
                    telefonnummer: selectedUser.telefonnummer || "",
                  });
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-sm"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={handleSaveUser}
                disabled={savingUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {savingUser ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectedUserDetails;