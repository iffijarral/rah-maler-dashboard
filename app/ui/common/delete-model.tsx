import React from 'react'

type DeleteModelProps = {
    handleConfirmDelete: () => void;
    handleCancelDelete: () => void;
}

const DeleteModel = ({handleConfirmDelete, handleCancelDelete}: DeleteModelProps ) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
                <p className="text-gray-600">Are you sure you want to delete?</p>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                        onClick={handleCancelDelete} // Close the modal without deleting
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleConfirmDelete} // Proceed with deletion
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModel