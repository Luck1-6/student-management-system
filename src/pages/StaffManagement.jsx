import { useEffect, useState } from "react";

import {
    getStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
} from "../api/adminStaffApi";

import "./styles/StaffManagement.css";


function StaffManagement() {

    const [staff, setStaff] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
    });


    // --------------------------------
    // Load Staff
    // --------------------------------

    const loadStaff = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getStaff();

            setStaff(data);

        } catch (error) {

            console.error("Error loading staff:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to load staff."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadStaff();
    }, []);


    // --------------------------------
    // Form Input
    // --------------------------------

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

    };


    // --------------------------------
    // Open Add Modal
    // --------------------------------

    const openAddModal = () => {

        setEditingStaff(null);

        setFormData({
            username: "",
            password: "",
            first_name: "",
            last_name: "",
            email: "",
        });

        setShowModal(true);

    };


    // --------------------------------
    // Open Edit Modal
    // --------------------------------

    const openEditModal = (member) => {

        setEditingStaff(member);

        setFormData({
            username: member.username || "",
            password: "",
            first_name: member.first_name || "",
            last_name: member.last_name || "",
            email: member.email || "",
        });

        setShowModal(true);

    };


    // --------------------------------
    // Close Modal
    // --------------------------------

    const closeModal = () => {

        setShowModal(false);
        setEditingStaff(null);

    };


    // --------------------------------
    // Add / Update Staff
    // --------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setError("");

            if (editingStaff) {

                const updateData = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                };

                await updateStaff(
                    editingStaff.id,
                    updateData
                );

                alert("Staff updated successfully.");

            } else {

                await createStaff(formData);

                alert("Staff created successfully.");

            }

            closeModal();

            await loadStaff();

        } catch (error) {

            console.error("Staff save error:", error);

            const errorData = error.response?.data;

            if (errorData) {

                setError(
                    Object.values(errorData)
                        .flat()
                        .join(" ")
                );

            } else {

                setError("Unable to save staff.");

            }

        }

    };


    // --------------------------------
    // Enable / Disable
    // --------------------------------

    const handleToggleStatus = async (member) => {

        const action = member.is_active
            ? "disable"
            : "enable";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${member.username}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await toggleStaffStatus(member.id);

            await loadStaff();

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to update staff status."
            );

        }

    };


    // --------------------------------
    // Delete Staff
    // --------------------------------

    const handleDelete = async (member) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${member.username}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteStaff(member.id);

            await loadStaff();

        } catch (error) {

            console.error(
                "Delete staff error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to delete staff."
            );

        }

    };


    // --------------------------------
    // Search
    // --------------------------------

    const filteredStaff = staff.filter((member) => {

        const searchText = search.toLowerCase();

        return (
            member.username?.toLowerCase().includes(searchText) ||
            member.first_name?.toLowerCase().includes(searchText) ||
            member.last_name?.toLowerCase().includes(searchText) ||
            member.email?.toLowerCase().includes(searchText)
        );

    });


    return (

        <div className="staff-management">

            {/* Header */}

            <div className="staff-header">

                <div>

                    <h1>Staff Management</h1>

                    <p>
                        Manage staff accounts and access
                    </p>

                </div>

                <button
                    className="add-staff-btn"
                    onClick={openAddModal}
                >
                    + Add Staff
                </button>

            </div>


            {/* Error */}

            {error && (

                <div className="staff-error">

                    {error}

                </div>

            )}


            {/* Search */}

            <div className="staff-toolbar">

                <input
                    type="text"
                    placeholder="Search by username, name or email..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="staff-search"
                />

                <div className="staff-count">

                    Total Staff: <strong>{filteredStaff.length}</strong>

                </div>

            </div>


            {/* Table */}

            <div className="staff-table-container">

                {loading ? (

                    <div className="staff-loading">
                        Loading staff...
                    </div>

                ) : filteredStaff.length === 0 ? (

                    <div className="staff-empty">

                        No staff members found.

                    </div>

                ) : (

                    <table className="staff-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredStaff.map((member) => (

                                <tr key={member.id}>

                                    <td>
                                        {member.id}
                                    </td>

                                    <td className="username-cell">
                                        {member.username}
                                    </td>

                                    <td>
                                        {member.first_name || member.last_name
                                            ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
                                            : "-"}
                                    </td>

                                    <td>
                                        {member.email || "-"}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                member.is_active
                                                    ? "status-badge active"
                                                    : "status-badge inactive"
                                            }
                                        >
                                            {member.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    openEditModal(member)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className={
                                                    member.is_active
                                                        ? "disable-btn"
                                                        : "enable-btn"
                                                }
                                                onClick={() =>
                                                    handleToggleStatus(member)
                                                }
                                            >
                                                {member.is_active
                                                    ? "Disable"
                                                    : "Enable"}
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(member)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>


            {/* Add / Edit Modal */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="staff-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingStaff
                                        ? "Edit Staff"
                                        : "Add Staff"}
                                </h2>

                                <p>
                                    {editingStaff
                                        ? "Update staff information"
                                        : "Create a new staff account"}
                                </p>

                            </div>

                            <button
                                className="close-btn"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            {/* Username */}

                            <div className="form-group">

                                <label>
                                    Username
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={!!editingStaff}
                                    required
                                />

                            </div>


                            {/* Password */}

                            {!editingStaff && (

                                <div className="form-group">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            )}


                            {/* First Name */}

                            <div className="form-group">

                                <label>
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* Last Name */}

                            <div className="form-group">

                                <label>
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* Email */}

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* Buttons */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                >
                                    {editingStaff
                                        ? "Update Staff"
                                        : "Create Staff"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default StaffManagement;