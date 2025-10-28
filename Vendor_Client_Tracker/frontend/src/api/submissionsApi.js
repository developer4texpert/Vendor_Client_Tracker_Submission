// src/components/Sales/Submissions/SubmissionService.js
import coreApi from "./core";

const authHeader = {
  headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
};

const SubmissionService = {
  getAll: () => coreApi.get("sale/GetAllSubmissions/", authHeader),
  getById: (id) => coreApi.post("sale/GetSubmissionByID/", { SubmissionId: id }, authHeader),
  add: (payload) => coreApi.post("sale/AddSubmission/", payload, authHeader),
  update: (payload) => coreApi.put("sale/UpdateSubmission/", payload, authHeader),
  updateResponse: (payload) => coreApi.post("sale/UpdateVendorResponse/", payload, authHeader),
  getByVendor: (vendorId) =>
    coreApi.post("sale/GetSubmissionByVendor/", { VendorId: vendorId }, authHeader),
  getByClient: (clientId) =>
    coreApi.post("sale/GetSubmissionByClient/", { ClientId: clientId }, authHeader),
  getByConsultant: (consultantId) =>
    coreApi.post("sale/GetSubmissionByConsultant/", { ConsultantId: consultantId }, authHeader),
  getByMarketer: (marketerId) =>
    coreApi.post("sale/GetSubmissionByMarketer/", { MarketerId: marketerId }, authHeader),
  getReport: (period) =>
    coreApi.post("sale/GetSubmissionReport/", { Period: period }, authHeader),
};

export default SubmissionService;
