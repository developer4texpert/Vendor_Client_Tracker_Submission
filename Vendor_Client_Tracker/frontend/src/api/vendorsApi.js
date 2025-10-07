import coreApi from "./core";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

// === Vendors CRUD ===
export const getVendors = () =>
  coreApi.get("vendor/GetVendor/", { headers: authHeader() });

export const getVendorById = (id) =>
  coreApi.get(`vendor/GetVendorByID/${id}/`, { headers: authHeader() });

export const addVendor = (payload) =>
  coreApi.post("vendor/AddVendor/", payload, { headers: authHeader() });

export const updateVendor = (id, payload) =>
  coreApi.put(`vendor/UpdateVendor/${id}/`, payload, { headers: authHeader() });

export const deleteVendor = (id) =>
  coreApi.delete(`vendor/DeleteVendor/${id}/`, { headers: authHeader() });

// === Vendor Addresses ===
export const getVendorAddresses = (id) =>
  coreApi.post("vendor/GetVendorAddresses/", { vendor_id: id }, { headers: authHeader() });

export const addVendorAddress = (payload) =>
  coreApi.post("vendor/AddVendorAddress/", payload, { headers: authHeader() });

export const updateVendorAddress = (payload) =>
  coreApi.put("vendor/UpdateVendorAddress/", payload, { headers: authHeader() });

export const deleteVendorAddress = (id, addrId) =>
  coreApi.delete("vendor/DeleteVendorAddress/", {
    headers: authHeader(),
    data: { vendor_id: id, address_id: addrId },
  });

// === Vendor Contacts ===
export const getVendorContacts = (id) =>
  coreApi.get(`vendor/GetVendorContacts/${id}/`, { headers: authHeader() });

export const addVendorContact = (id, payload) =>
  coreApi.post(`vendor/AddVendorContact/${id}/`, payload, { headers: authHeader() });

export const updateVendorContact = (id, payload) =>
  coreApi.put(`vendor/UpdateVendorContact/${id}/`, payload, { headers: authHeader() });

export const deleteVendorContact = (id, contactId) =>
  coreApi.delete("vendor/DeleteVendorContact/", {
    headers: authHeader(),
    data: { vendor_id: id, contact_id: contactId },
  });
