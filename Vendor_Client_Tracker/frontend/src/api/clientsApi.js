import coreApi from "./core";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access")}`,
});

// === Clients CRUD ===
export const getClients = () =>
  coreApi.get("client/GetClient/", { headers: authHeader() });

export const getClientById = (id) =>
  coreApi.get(`client/GetClientByID/${id}/`, { headers: authHeader() });

export const addClient = (payload) =>
  coreApi.post("client/AddClient/", payload, { headers: authHeader() });

export const updateClient = (id, payload) =>
  coreApi.put(`client/UpdateClient/${id}/`, payload, { headers: authHeader() });

export const deleteClient = (id) =>
  coreApi.delete(`client/DeleteClient/${id}/`, { headers: authHeader() });

// === Client Addresses ===
export const getClientAddresses = (id) =>
  coreApi.post("client/GetClientAddresses/", { client_id: id }, { headers: authHeader() });

export const addClientAddress = (payload) =>
  coreApi.post("client/AddClientAddress/", payload, { headers: authHeader() });

export const updateClientAddress = (payload) =>
  coreApi.put("client/UpdateClientAddress/", payload, { headers: authHeader() });

export const deleteClientAddress = (addrid) =>
  coreApi.delete("client/DeleteClientAddress/", {
    headers: authHeader(),
    data: { addrid },
  });

// === Client Vendors ===
export const getVendorsForClient = (id) =>
  coreApi.get(`client/GetVendorsForClient/${id}/`, { headers: authHeader() });

export const attachVendorToClient = (id, payload) =>
  coreApi.post(`client/AttachVendor/${id}/`, payload, { headers: authHeader() });

export const detachVendorFromClient = (id, vendorId) =>
  coreApi.delete(`client/DetachVendorFromClient/${id}/${vendorId}/`, { headers: authHeader() });
