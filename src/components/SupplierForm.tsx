import React, { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Building, User, Mail, Phone, FileText } from "lucide-react";
import { motion } from "motion/react";

const documentRequirements = [
  { id: 'cert_incorporation', label: 'Company Certificate of Incorporation', required: true },
  { id: 'gst_certificate', label: 'GST/ VAT/ SST Certificate', required: true },
  { id: 'memorandum', label: 'Memorandum of Article and Association', required: true },
  { id: 'financial_statement', label: 'Recent 3 years audited financial statement', required: true },
  { id: 'bank_statement', label: 'Bank statement letterhead', required: true },
  { id: 'national_id', label: 'Payee National ID card', required: true },
  { id: 'company_profile', label: 'Company profile and organization chart', required: true },
  { id: 'project_reference', label: 'Project reference (if applicable)', required: false },
  { id: 'anti_corruption', label: "LEGB Vendor's Anti-Corruption Declaration Form", required: true },
  { id: 'human_rights', label: "LEGB Vendor's Human Rights Declaration Form", required: true },
  { id: 'code_of_conduct', label: "LEGB Supplier's Code of Conduct and Business Ethics form", required: true },
];

export default function SupplierForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    taxId: "",
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      if (file) {
        newFiles[id] = file;
      } else {
        delete newFiles[id];
      }
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFiles = documentRequirements.filter(req => req.required && !files[req.id]);
    if (missingFiles.length > 0) {
      setError(`Please upload all required documents. Missing: ${missingFiles.map(m => m.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value as string);
    });
    
    Object.entries(files).forEach(([id, file]) => {
      data.append(id, file as Blob);
    });

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to submit application");
      }

      const result = await res.json();
      setSuccessId(result.supplierId);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for registering. Your application is under review. Please save your unique Supplier ID for future reference.
        </p>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 inline-block">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Your Supplier ID</p>
          <p className="text-2xl font-mono font-bold text-indigo-600">{successId}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-2xl font-bold text-gray-900">Supplier Registration</h2>
        <p className="text-gray-500 mt-1">Please provide your company details and required documents.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" /> Company Name
            </label>
            <input
              required
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Company Registration No
            </label>
            <input
              required
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="XX-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Contact Name
            </label>
            <input
              required
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> Email Address
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="jane@acme.com"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" /> Phone Number
            </label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Required Documents</h3>
          <div className="grid grid-cols-1 gap-4">
            {documentRequirements.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50 gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {req.label}
                    {req.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {files[req.id] && (
                    <div className="flex items-center text-sm text-green-600 max-w-[150px] sm:max-w-[200px] truncate">
                      <CheckCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{files[req.id].name}</span>
                    </div>
                  )}
                  <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm">
                    {files[req.id] ? 'Change File' : 'Upload'}
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
