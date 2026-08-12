import axios from "axios";

const API_URL =
    "http://127.0.0.1:8000/api/attendance/admin/staff/";


const getAuthHeaders = () => {
    const token = localStorage.getItem("access");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};


// GET - Get all staff
export const getStaff = async () => {
    const response = await axios.get(
        API_URL,
        getAuthHeaders()
    );

    return response.data;
};


// POST - Create staff
export const createStaff = async (staffData) => {
    const response = await axios.post(
        API_URL,
        staffData,
        getAuthHeaders()
    );

    return response.data;
};


// PUT - Update staff
export const updateStaff = async (id, staffData) => {
    const response = await axios.put(
        `${API_URL}${id}/`,
        staffData,
        getAuthHeaders()
    );

    return response.data;
};


// PATCH - Enable / Disable staff
export const toggleStaffStatus = async (id) => {
    const response = await axios.patch(
        `${API_URL}${id}/status/`,
        {},
        getAuthHeaders()
    );

    return response.data;
};


// DELETE - Delete staff
export const deleteStaff = async (id) => {
    const response = await axios.delete(
        `${API_URL}${id}/delete/`,
        getAuthHeaders()
    );

    return response.data;
};