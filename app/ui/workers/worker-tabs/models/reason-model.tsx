import React from 'react';

export default function ReasonModal({
  reason,
  onClose
}: {
  reason: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Vacation Reason</h2>
        <p className="text-gray-700">{reason || 'No reason provided.'}</p>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
