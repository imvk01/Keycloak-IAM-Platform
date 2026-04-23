import { useState, useEffect, useCallback } from "react";
import { MdSearch, MdBusiness } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { LuMove } from "react-icons/lu";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import { useParams } from "react-router-dom";

interface User {
  _id: string;
  vorname: string;
  nachname?: string;
  benutzername?: string;
  email: string;
  telefonnummer?: string;
  organizationId?: string;
  subOrganizationId?: string | null;
}

interface EmailItem {
  _id?: string;
  email: string;
}

interface SubOrganization {
  _id: string;
  name: string;
  emails?: EmailItem[];
}

interface Organization {
  _id: string;
  name: string;
  emails?: EmailItem[];
  subOrganizations?: SubOrganization[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const OrganizationChange = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const [search, setSearch] = useState("");
  const [orgSearch, setOrgSearch] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [modalParentOrganizationId, setModalParentOrganizationId] =
    useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const filteredUsers = users.filter((u) =>
    `${u.vorname || ""} ${u.nachname || ""} ${u.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredOrganizations = organizations.filter((org) => {
    const searchValue = orgSearch.toLowerCase();
    const orgMatch = org.name.toLowerCase().includes(searchValue);
    const subMatch = (org.subOrganizations || []).some((sub) =>
      sub.name.toLowerCase().includes(searchValue)
    );
    return orgMatch || subMatch;
  });

  const handleUserCheckboxChange = (userId: string) => {
    setSelectedOrganizationId("");
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
  
    const confirmed = window.confirm(
      selectedUserIds.length === 1
        ? "Möchten Sie diesen Benutzer wirklich löschen?"
        : `Möchten Sie diese ${selectedUserIds.length} Benutzer wirklich löschen?`
    );
  
    if (!confirmed) return;
  
    try {
      const res = await axios.delete(`${API_BASE}/users`, {
        withCredentials: true,
        data: {
          userIds: selectedUserIds,
        },
      });
  
      if (res?.data?.success) {
        setSuccessMessage(
          res.data.message || "Benutzer wurden erfolgreich gelöscht."
        );
        setSelectedUserIds([]);
        fetchUsers();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Delete users error:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message || "Fehler beim Löschen der Benutzer"
        );
      } else {
        console.error("Unexpected delete users error:", error);
        alert("Etwas ist schiefgelaufen");
      }
    }
  };

  const normalizeOrganizations = (data: Organization[] = []) => {
    return data.map((org) => ({
      ...org,
      subOrganizations: org.subOrganizations || [],
      emails: org.emails || [],
    }));
  };

  const fetchOrganizations = useCallback(async () => {
    if (!teamId) return;

    try {
      const res = await axios.get(`${API_BASE}/organizations/team/${teamId}`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        setOrganizations(normalizeOrganizations(res.data.data || []));
      }
    } catch (error) {
      console.error("Fetch organization error:", error);
    }
  }, [teamId]);

  const fetchUsers = useCallback(async () => {
    if (!teamId) return;

    try {
      const res = await axios.get(`${API_BASE}/users/team/${teamId}`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  }, [teamId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchOrganizations(), fetchUsers()]);
    };
  
    loadData();
  }, [fetchOrganizations, fetchUsers]);

  const openCreateModal = () => {
    setShowModal(true);
    setOrgName("");
    setModalParentOrganizationId(selectedOrganizationId || "");
  };

  const handleDelete = async () => {
    if (selectedUserIds.length > 0) {
      await handleDeleteUsers();
      return;
    }
  
    if (!selectedOrganizationId) {
      alert("Bitte wählen Sie zuerst eine Organisation oder Benutzer aus.");
      return;
    }
  
    try {
      const infoRes = await axios.get(
        `${API_BASE}/organizations/${selectedOrganizationId}/delete-info`,
        {
          withCredentials: true,
        }
      );
  
      if (!infoRes?.data?.success) {
        alert("Löschinformationen konnten nicht geladen werden.");
        return;
      }
  
      const { organizationName, usersCount } = infoRes.data.data;
  
      let confirmed = false;
  
      if (usersCount === 0) {
        confirmed = window.confirm(
          `Möchten Sie die Organisation "${organizationName}" wirklich löschen?`
        );
      } else {
        confirmed = window.confirm(
          `Die Organisation "${organizationName}" hat ${usersCount} Benutzer. Möchten Sie die Organisation trotzdem löschen? Die Unterorganisationen und die zugehörigen Benutzer werden ebenfalls gelöscht.`
        );
      }
  
      if (!confirmed) return;
  
      const deleteRes = await axios.delete(
        `${API_BASE}/organizations/${selectedOrganizationId}`,
        {
          withCredentials: true,
        }
      );
  
      if (deleteRes?.data?.success) {
        setSuccessMessage(
          deleteRes.data.message ||
            "Die Organisation wurde erfolgreich gelöscht."
        );
        setSelectedOrganizationId("");
        fetchOrganizations();
        fetchUsers();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Delete organization error:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            "Fehler beim Löschen der Organisation"
        );
      } else {
        console.error("Unexpected delete error:", error);
        alert("Etwas ist schiefgelaufen");
      }
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setModalParentOrganizationId("");
    setOrgName("");
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!orgName.trim()) {
      alert("Name is required");
      return;
    }

    if (!teamId) {
      alert("Invalid team id");
      return;
    }

    try {
      setLoading(true);

      if (!modalParentOrganizationId) {
        const payload = {
          organizationName: orgName.trim(),
          emails: [],
        };

        const res = await axios.post(
          `${API_BASE}/organizations/${teamId}`,
          payload,
          { withCredentials: true }
        );

        if (res?.data?.success) {
          setSuccessMessage("Die Organisation wurde erstellt.");
          resetModal();
          fetchOrganizations();
        }
      } else {
        const payload = {
          subOrganizationName: orgName.trim(),
          emails: [],
        };

        const res = await axios.post(
          `${API_BASE}/suborganizations/${modalParentOrganizationId}`,
          payload,
          { withCredentials: true }
        );

        if (res?.data?.success) {
          setSuccessMessage("Die Unterorganisation wurde erstellt.");
          resetModal();
          fetchOrganizations();
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Create organization/suborganization error:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            "Error creating organization/suborganization"
        );
      } else {
        console.error("Unexpected error:", error);
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSubOrganizationText = (subOrganizations?: SubOrganization[]) => {
    if (!subOrganizations || subOrganizations.length === 0) {
      return "Keine Unterorganisationen";
    }

    return `Unterorganisationen - ${subOrganizations
      .map((sub) => sub.name)
      .join(", ")}`;
  };

  const getOrganizationUserCount = (organizationId: string) => {
    const org = organizations.find((item) => item._id === organizationId);

    if (!org) return 0;

    const subOrgIds = (org.subOrganizations || []).map((sub) => sub._id);

    return users.filter((user) => {
      const belongsToOrg = user.organizationId === organizationId;

      const belongsToSubOrg =
        !!user.subOrganizationId && subOrgIds.includes(user.subOrganizationId);

      return belongsToOrg || belongsToSubOrg;
    }).length;
  };

  const getUserText = (organizationId: string) => {
    const count = getOrganizationUserCount(organizationId);

    if (count === 0) {
      return "Keine Benutzer";
    }

    return `Benutzer - ${count}`;
  };

  return (
    <div className="min-h-screen flex bg-[#efefef]">
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="flex flex-1 bg-[#efefef]">
          <Sidebar />

          <div className="flex-1 flex flex-col px-3 py-3">
            <div className="mb-3">
              <p className="text-[12px] text-slate-700 mb-1">Benutzer suchen</p>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7f89d9]">
                  <MdSearch className="w-4 h-4" />
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder=""
                  aria-label="Search users"
                  className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-xs outline-none"
                />
              </div>
            </div>

            <div className="flex flex-1 gap-3">
              {/* Left Users Panel */}
              <section className="w-[35%] bg-[#f5f5f5] border border-slate-300 rounded-xs overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="h-full flex items-center justify-center px-4">
                    <p className="text-sm text-slate-400 text-center">
                      Keine Benutzer gefunden.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {filteredUsers.map((user) => (
                      <li
                        key={user._id}
                        className="flex items-center justify-between px-4 py-3 border-b border-slate-200 hover:bg-slate-50"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 text-[#5e63d6]">
                            <FaUser className="w-4 h-4" />
                          </div>

                          <div>
                            <p className="text-[13px] font-medium text-slate-800 leading-tight">
                              {`${user.vorname || ""} ${
                                user.nachname || ""
                              }`.trim() ||
                                user.benutzername ||
                                "Kein Name"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <input
  type="checkbox"
  checked={selectedUserIds.includes(user._id)}
  onChange={() => handleUserCheckboxChange(user._id)}
  className="w-4 h-4 accent-blue-500"
  aria-label={`Select user ${user.email}`}
/>


                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {/* Right Organization Panel */}
              <section className="flex-1 bg-[#f3f3f3] border border-slate-300 rounded-xs p-3 flex flex-col">
                {successMessage && (
                  <div className="mb-3 bg-green-600 text-white text-[12px] px-3 py-2 rounded-xs flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button
                      onClick={() => setSuccessMessage("")}
                      className="text-white/80 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="mb-2">
                  <p className="text-[12px] text-slate-700 mb-1">
                    Organisation suchen
                  </p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7f89d9]">
                        <MdSearch className="w-4 h-4" />
                      </span>

                      <input
                        value={orgSearch}
                        onChange={(e) => setOrgSearch(e.target.value)}
                        placeholder=""
                        aria-label="Search organizations"
                        className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-xs outline-none"
                      />
                    </div>

                    <button
                      onClick={openCreateModal}
                      className="px-5 h-9 text-[12px] text-white bg-blue-600 rounded-xs hover:bg-blue-700"
                    >
                      Erstellen
                    </button>

                    <button
                      onClick={handleDelete}
                      className="px-5 h-9 text-[12px] text-white bg-slate-700 rounded-xs hover:bg-slate-800"
                    >
                      Löschen
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-xs overflow-y-auto">
                  {filteredOrganizations.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center mt-10">
                      Keine Organisationen gefunden.
                    </p>
                  ) : (
                    <div className="p-3 space-y-3">
                      {filteredOrganizations.map((org) => (
                        <div key={org._id}>
                          <div
                            onClick={() => {
                              setSelectedOrganizationId(org._id);
                              setSelectedUserIds([]);
                            }}
                            className={`flex items-start justify-between px-3 py-2 border rounded-xs cursor-pointer ${
                              selectedOrganizationId === org._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 bg-[#fafafa]"
                            }`}
                          >
                            <div className="flex items-start gap-2 mt-3">
                              <MdBusiness className="text-slate-700 w-4 h-4 mt-0.5" />
                              <div>
                                <p className="text-[13px] font-medium text-slate-800">
                                  {org.name}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2">
                                  {getUserText(org._id)}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2 mb-3">
                                  {getSubOrganizationText(org.subOrganizations)}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrganizationId(org._id);
                              }}
                              className="text-slate-500 hover:text-slate-700 mt-0.5"
                              aria-label="Select organization"
                            >
                              <LuMove className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white w-105 rounded-xs shadow-2xl px-5 py-5">
            <h2 className="text-[18px] font-medium text-blue-500 mb-3">
              Organisation erstellen
            </h2>

            <p className="text-[13px] text-slate-600 leading-6 mb-4">
              Bitte wählen Sie eine übergeordnete Organisation aus oder lassen
              Sie dieses Feld leer, um eine neue Stammorganisation zu erstellen.
              Geben Sie dann den Namen der neuen Organisation ein.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400">
                  Übergeordnete Organisation
                </label>
                <select
                  value={modalParentOrganizationId}
                  onChange={(e) => setModalParentOrganizationId(e.target.value)}
                  className="w-full mt-1 border-b border-slate-300 bg-white px-1 py-2 text-sm outline-none"
                >
                  <option value="">Neu erstellen</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder=""
                  className="w-full mt-1 border-b border-slate-500 bg-[#f8f8f8] px-2 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <button
                onClick={resetModal}
                className="px-6 py-2 text-sm bg-slate-700 text-white rounded-xs"
              >
                Abbrechen
              </button>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-8 py-2 text-sm bg-blue-500 text-white rounded-xs hover:bg-blue-600 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Ja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationChange;
