import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const documentLabels: Record<string, string> = {
  cert_incorporation: 'Company Certificate of Incorporation',
  gst_certificate: 'GST/ VAT/ SST Certificate',
  memorandum: 'Memorandum of Article and Association',
  financial_statement: 'Recent 3 years audited financial statement',
  bank_statement: 'Bank statement letterhead',
  national_id: 'Payee National ID card',
  company_profile: 'Company profile and organization chart',
  project_reference: 'Project reference',
  anti_corruption: "LEGB Vendor's Anti-Corruption Declaration Form",
  human_rights: "LEGB Vendor's Human Rights Declaration Form",
  code_of_conduct: "LEGB Supplier's Code of Conduct and Business Ethics form",
};

interface Document {
  id: number;
  documentType: string;
  fileName: string;
  uploadedAt: string;
}

interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  taxId: string;
  status: string;
  createdAt: string;
  documents: Document[];
}

export default function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSupplierDetails();
  }, [id]);

  const fetchSupplierDetails = async () => {
    try {
      const res = await fetch(`/api/suppliers/${id}`);
      if (!res.ok) throw new Error("Supplier not found");
      const data = await res.json();
      setSupplier(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/suppliers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSupplier((prev) => (prev ? { ...prev, status } : null));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Supplier Not Found</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(supplier.status)}`}>
            {supplier.status === "Approved" && <CheckCircle className="w-4 h-4 mr-1.5" />}
            {supplier.status === "Rejected" && <XCircle className="w-4 h-4 mr-1.5" />}
            {supplier.status === "Pending" && <Clock className="w-4 h-4 mr-1.5" />}
            {supplier.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {supplier.id}</p>
          </div>
          {supplier.status === "Pending" && (
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusChange("Rejected")}
                disabled={updating}
                className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusChange("Approved")}
                disabled={updating}
                className="px-4 py-2 border border-transparent text-white bg-green-600 hover:bg-green-700 rounded-xl font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                Approve Supplier
              </button>
            </div>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building className="w-5 h-5 text-indigo-500" /> Company Details
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.companyName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Company Registration No</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{supplier.taxId}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Application Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(supplier.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-indigo-500" /> Contact Information
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Primary Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.contactName}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email
                </dt>
                <dd className="mt-1 text-sm text-indigo-600 hover:underline">
                  <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.phone}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Submitted Documents
          </h3>
          <p className="text-sm text-gray-500 mt-1">Review the documents uploaded by the supplier.</p>
        </div>
        <div className="p-8">
          {supplier.documents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {supplier.documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs sm:max-w-md">
                        {documentLabels[doc.documentType] || doc.documentType}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {doc.fileName} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      download
                      className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
