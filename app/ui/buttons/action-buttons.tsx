"use client";

import { TrashIcon, ClipboardDocumentListIcon, AtSymbolIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Toast } from "../common/toast";
import { sendInvoice } from "@/app/lib/actions/emailActions";
import { deleteWorker } from "@/app/lib/actions/workerActions";
import { deleteCustomer } from "@/app/lib/actions/customerActions";
import { deleteInvoice, reloadInvoices } from "@/app/lib/actions/invoiceActions";
import { deleteProject, reloadProjects } from "@/app/lib/actions/projectActions";
import DeleteModel from "../common/delete-model";
import InvoicePreviewModal from "../common/InvoicePreviewModal";
import { InvoiceTableRow } from "@/app/lib/definitions";

type DeleteState = {
  error?: {
    id?: string[];
  };
  message?: string | null;
  success: boolean;
};

export function Delete({ id, route }: { id: string, route: string }) {
  const [showConfirm, setShowConfirm] = useState(false); // For confirmation modal
  const [state, setState] = useState<DeleteState>({
    success: false,
    message: null,
    error: {},
  });

  const handleConfirmDelete = async () => {
    try {
      let response;
      if (route === 'customer')
        response = await deleteCustomer(id); // Perform the delete
      else if (route === 'worker')
        response = await deleteWorker(id); // Perform the delete
      else if (route === 'project')
        response = await deleteProject(id); // Perform the delete      
      else
        response = await deleteInvoice(id); // Perform the delete
      if (response?.success) {
        setState({
          success: true,
          message: "Deleted successfully",
        });
      } else {
        setState({
          success: false,
          message: "Failed to delete",
        });
      }
      setShowConfirm(false); // Close the confirmation modal
    } catch (error) {
      console.log(error);
      setState({
        success: false,
        message: "An error occurred while deleting",
      });
      setShowConfirm(false); // Close the modal on error
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false); // Close the confirmation modal without deleting
  };

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        className="rounded-md border p-2 hover:bg-gray-100"
        onClick={() => setShowConfirm(true)} // Show confirmation modal on click
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 text-red-500" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <DeleteModel handleConfirmDelete={handleConfirmDelete} handleCancelDelete={handleCancelDelete} />
      )}

      {/* Show the toast notification */}
      {state.message && (
        <Toast
          message={state.message}
          type={state.success ? "success" : "error"}
          onClose={async () => {
            // await reload(); // ✅ Revalidate AFTER toast closes
            if (route === 'project') {
              await reloadProjects(); // Reload projects if the route is project
            } else if (route === 'invoice') {
              await reloadInvoices(); // Reload invoices if the route is invoice
            }
            setState({ ...state, message: null }); // Reset the message state
          }}
        />
      )}
    </>
  );
}

// Worker Log
export function Log({ id, route }: { id: string, route: string }) {
  console.log("Log button clicked for ID:", id, "Route:", route);
  return (
    <>
      <button
        type="button"
        className="rounded-md border p-2 hover:bg-gray-100"
        onClick={() => console.log('log button clicked')} // Open the modal on click
      >
        <span className="sr-only">Log</span>
        <ClipboardDocumentListIcon className="w-5" />
      </button>
    </>
  );
}

// SendMail component
export function SendMail({ invoice }: { invoice: InvoiceTableRow }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<null | { message: string; type: "success" | "error" }>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMail = async () => {
    setIsLoading(true); // Set loading state
    try {
      // Perform the send mail action here
      // console.log("Sending mail for invoice:", invoice);
      const response = await sendInvoice(invoice); // Replace with actual send mail function

      if (response.success) {
        console.log("Mail sent successfully");
        setToast({ message: "Mail sent successfully", type: "success" });
        setIsOpen(false); // Close the modal after sending

      } else {
        setToast({ message: "Error sending mail:", type: "error" });
      }
      // Close the modal after sending
    } catch (error) {
      console.error("Error sending mail:", error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };
  return (
    <>
      <button
        type="button"
        className="rounded-md border p-2 hover:bg-gray-100"
        onClick={() => setIsOpen(true)} // Open the modal on click
      >
        <span className="sr-only">Send Mail</span>
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        ) : (
          <AtSymbolIcon className="w-5" />
        )}
      </button>
      <InvoicePreviewModal
        invoice={invoice}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSendMail={handleSendMail} // Pass the send mail function to the modal
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
