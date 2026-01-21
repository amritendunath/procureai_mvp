import React, { useState } from 'react';
import { createVendor, deleteVendor } from '../lib/api';
import { Plus, Mail, Trash2 } from 'lucide-react';
import { useData } from '../lib/DataContext';

export const Vendors: React.FC = () => {
    const { vendors, refreshVendors, addVendorOptimistic, removeVendorOptimistic } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: '', email: '', tags: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Optimistic Update (Instant feedback)
        const tempId = Date.now().toString(); // Temporary ID
        const tempVendor = { ...newVendor, id: tempId, createdAt: new Date().toISOString() };
        addVendorOptimistic(tempVendor);
        setIsAdding(false);
        setNewVendor({ name: '', email: '', tags: '' });

        // 2. API Call (Background)
        try {
            await createVendor(newVendor);
            await refreshVendors(); // Re-fetch to get real ID
        } catch (error) {
            console.error("Failed to add vendor", error);
            removeVendorOptimistic(tempId); // Revert on failure
            alert("Failed to add vendor.");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Vendor Directory</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm sm:text-base self-start sm:self-auto"
                >
                    <Plus size={18} />
                    <span>Add Vendor</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold mb-4">New Vendor Details</h3>
                    <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newVendor.name}
                                onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newVendor.email}
                                onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma sep)</label>
                            <input
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newVendor.tags}
                                onChange={e => setNewVendor({ ...newVendor, tags: e.target.value })}
                                placeholder="e.g. electronics, services"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700">
                            Save Vendor
                        </button>
                    </form>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map(vendor => (
                    <div key={vendor.id} className="p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                                {vendor.name[0]}
                            </div>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();

                                    // 1. Optimistic Delete (Instance)
                                    removeVendorOptimistic(vendor.id);

                                    // 2. API Call (Background)
                                    try {
                                        await deleteVendor(vendor.id);
                                        // No need to refresh if successful, local state is already correct
                                        // But good practice to ensure sync:
                                        refreshVendors();
                                    } catch (error) {
                                        console.error("Failed to delete vendor", error);
                                        refreshVendors(); // Revert/Refresh on failure
                                        alert("Failed to delete vendor.");
                                    }
                                }}
                                className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Delete Vendor"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <Mail size={14} /> {vendor.email}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {vendor.tags?.split(',').map((tag: string) => (
                                <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
