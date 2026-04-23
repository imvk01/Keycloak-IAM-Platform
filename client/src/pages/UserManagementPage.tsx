import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import { MdSearch, MdBusiness, MdAdd } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { useParams } from "react-router-dom";
import SelectedUserDetails from "../components/SelectedUserDetails";

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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const UserManagementPage = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [users, setUsers] = useState<BackendUser[]>([]);
const [usersLoading, setUsersLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedSubOrganizationId, setSelectedSubOrganizationId] =
    useState("");

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredUsers = users.filter((user) => {
    const fullName =
      `${user.vorname || ""} ${user.nachname || ""}`.toLowerCase();
    const username = (user.benutzername || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const query = search.toLowerCase();

    return (
      fullName.includes(query) ||
      username.includes(query) ||
      email.includes(query)
    );
  });

  const selectedOrganization = organizations.find(
    (org) => org._id === selectedOrganizationId
  );

  const availableSubOrganizations = selectedOrganization?.subOrganizations || [];

  const selectedUser =
    selectedUsers.length === 1
      ? users.find((user) => user._id === selectedUsers[0]) || null
      : null;

  const selectedUserOrganization = selectedUser
    ? organizations.find((org) => org._id === selectedUser.organizationId) ||
      null
    : null;

  const selectedUserSubOrganization =
    selectedUser && selectedUserOrganization
      ? (selectedUserOrganization.subOrganizations || []).find(
          (sub) => sub._id === selectedUser.subOrganizationId
        ) || null
      : null;

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchOrganizations = useCallback(async () => {
    if (!teamId) {
      alert("Team ID fehlt in der URL");
      return;
    }
  
    try {
      console.log(
        "Fetching organizations from:",
        `${API_BASE}/organizations/team/${teamId}`
      );
  
      const res = await axios.get(`${API_BASE}/organizations/team/${teamId}`, {
        withCredentials: true,
      });
  
      console.log("Organizations response:", res.data);
  
      if (res?.data?.success) {
        setOrganizations(res.data.data || []);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("ORG STATUS:", error.response?.status);
        console.log("ORG DATA:", error.response?.data);
        console.log("ORG ERROR:", error);
  
        alert(
          `Organizations API Error\nStatus: ${error.response?.status || "No status"}\nMessage: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        console.error(error);
        alert("Unknown organization error");
      }
    }
  }, [teamId]);
  

  const fetchUsers = useCallback(async () => {
    if (!teamId) {
      setUsersLoading(false);
      alert("Team ID fehlt in der URL");
      return;
    }
  
    try {
      console.log("Fetching users from:", `${API_BASE}/users/team/${teamId}`);
  
      const res = await axios.get(`${API_BASE}/users/team/${teamId}`, {
        withCredentials: true,
      });
  
      console.log("Users response:", res.data);
  
      if (res?.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("USERS STATUS:", error.response?.status);
        console.log("USERS DATA:", error.response?.data);
        console.log("USERS ERROR:", error);
  
        alert(
          `Users API Error\nStatus: ${error.response?.status || "No status"}\nMessage: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        console.error(error);
        alert("Unknown users error");
      }
    } finally {
      setUsersLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    console.log("teamId from URL:", teamId);
  
    const loadData = async () => {
      await fetchOrganizations();
      await fetchUsers();
    };
  
    loadData();
  }, [fetchOrganizations, fetchUsers, teamId]);

  const handleSaveUser = async () => {
    if (!formData.firstName.trim()) {
      alert("Vorname ist erforderlich");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email ist erforderlich");
      return;
    }

    if (!selectedOrganizationId) {
      alert("Bitte wählen Sie eine Organisation aus");
      return;
    }

    if (!teamId) {
      alert("Ungültige Team ID");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        teamId,
        organizationId: selectedOrganizationId,
        subOrganizationId: selectedSubOrganizationId || null,
        vorname: formData.firstName.trim(),
        nachname: formData.lastName.trim(),
        benutzername: formData.username.trim(),
        email: formData.email.trim(),
        telefonnummer: formData.phone.trim(),
      };

      const res = await axios.post(`${API_BASE}/users`, payload, {
        withCredentials: true,
      });

      if (res?.data?.success || res?.data?.user) {
        alert(res.data.message || "Benutzer erfolgreich erstellt");

        setFormData({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          phone: "",
        });

        setSelectedOrganizationId("");
        setSelectedSubOrganizationId("");

        await fetchUsers();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Fehler beim Erstellen des Benutzers"
        );
      } else {
        alert("Etwas ist schiefgelaufen");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      alert("Bitte wählen Sie mindestens einen Benutzer aus.");
      return;
    }

    const confirmed = window.confirm(
      selectedUsers.length === 1
        ? "Möchten Sie diesen Benutzer wirklich löschen?"
        : `Möchten Sie diese ${selectedUsers.length} Benutzer wirklich löschen?`
    );

    if (!confirmed) return;

    try {
      const res = await axios.delete(`${API_BASE}/users`, {
        withCredentials: true,
        data: {
          userIds: selectedUsers,
        },
      });

      if (res?.data?.success) {
        alert(res.data.message || "Benutzer erfolgreich gelöscht");
        setSelectedUsers([]);
        await fetchUsers();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Fehler beim Löschen der Benutzer"
        );
      } else {
        alert("Etwas ist schiefgelaufen");
      }
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
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex flex-1 gap-4">
              <section className="w-[30%] bg-white border border-slate-200 rounded-sm p-4 min-h-170">
                {usersLoading ? (
                  <p className="text-sm text-slate-400">
                    Benutzer werden geladen...
                  </p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Keine Benutzer gefunden
                  </p>
                ) : (
                  <div className="space-y-5">
                    {filteredUsers.map((user) => {
                      const displayName =
                        `${user.vorname || ""} ${user.nachname || ""}`.trim() ||
                        user.benutzername ||
                        "Unbekannter Benutzer";

                      return (
                        <div
                          key={user._id}
                          className="flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-[#5e63d6]">
                              <FaUser className="w-4 h-4" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-900 leading-tight">
                                {displayName}
                              </p>
                              <p className="text-xs text-slate-500 break-all">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUser(user._id)}
                            className="mt-1 w-4 h-4 accent-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <section className="w-[70%] bg-slate-50 border border-slate-200 rounded-sm px-10 py-8 min-h-170">
  {selectedUsers.length === 0 ? (
    <div className="space-y-4">
      <FormField
        label="Vorname *"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
      />

      <FormField
        label="Nachname"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
      />

      <FormField
        label="Benutzername"
        name="username"
        value={formData.username}
        onChange={handleChange}
      />

      <FormField
        label="Email *"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <FormField
        label="Telefonnummer"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <div className="pt-6">
        <div className="flex items-start gap-4">
          <MdBusiness className="w-7 h-7 text-slate-700 mt-2" />

          <div className="flex-1 border border-slate-300 rounded-sm bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-800">
                Organisation wechseln *
              </p>

              <button
                type="button"
                onClick={() => setShowOrgModal(true)}
                className="text-slate-500"
              >
                <MdAdd className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-4 text-xs text-slate-500">
              {selectedOrganization ? (
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Organisation:</span>{" "}
                    {selectedOrganization.name}
                  </p>
                  <p>
                    <span className="font-medium">SubOrganisation:</span>{" "}
                    {selectedSubOrganizationId
                      ? availableSubOrganizations.find(
                          (sub) => sub._id === selectedSubOrganizationId
                        )?.name || "Keine"
                      : "Keine"}
                  </p>
                </div>
              ) : (
                <p className="italic text-slate-400">
                  Bitte Organisation auswählen
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleSaveUser}
          disabled={saving}
          className="px-8 py-2.5 text-sm text-white bg-blue-500 rounded-sm hover:bg-blue-600 transition disabled:opacity-60"
        >
          {saving ? "Speichern..." : "Benutzer anlegen"}
        </button>
      </div>
    </div>
  ) : selectedUsers.length === 1 && selectedUser ? (
    <SelectedUserDetails
      selectedUser={selectedUser}
      selectedUserOrganization={selectedUserOrganization}
      selectedUserSubOrganization={selectedUserSubOrganization}
      organizations={organizations}
      onClose={clearUserSelection}
      onDelete={handleDeleteSelectedUsers}
      onUserUpdated={async () => {
        await fetchOrganizations();
        await fetchUsers();
      }}
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="text-lg font-medium text-slate-700">
        {selectedUsers.length} Benutzer ausgewählt
      </p>
      <p className="text-sm text-slate-400 mt-2 mb-6">
        Sie können die ausgewählten Benutzer gemeinsam löschen.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={clearUserSelection}
          className="px-6 py-2.5 text-sm bg-slate-700 text-white rounded-sm hover:bg-slate-800"
        >
          Zurück
        </button>

        <button
          onClick={handleDeleteSelectedUsers}
          className="px-6 py-2.5 text-sm text-white bg-red-600 rounded-sm hover:bg-red-700"
        >
          Ausgewählte Benutzer löschen
        </button>
      </div>
    </div>
  )}
</section>
            </div>
          </main>
        </div>
      </main>

      {showOrgModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-115 rounded-md shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Organisation auswählen
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
              </div>

              <div>
                <label className="text-xs text-slate-500">SubOrganisation</label>
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
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-sm"
              >
                Abbrechen
              </button>

              <button
                onClick={() => {
                  if (!selectedOrganizationId) {
                    alert("Bitte wählen Sie eine Organisation aus");
                    return;
                  }
                  setShowOrgModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function FormField({ label, name, value, onChange }: FormFieldProps) {
  return (
    <div>
      <p className="text-sm text-slate-700 mb-1 font-medium">{label}</p>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-sm outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

export default UserManagementPage;