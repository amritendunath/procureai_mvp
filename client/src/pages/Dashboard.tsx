import React from 'react';
import { Link } from 'react-router-dom';
import { deleteRfp } from '../lib/api';
import { Plus, ChevronRight, FileText, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useData } from '../lib/DataContext';

export const Dashboard: React.FC = () => {
    const { rfps, refreshRfps, removeRfpOptimistic } = useData();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'text-blue-600 bg-blue-50';
            case 'closed': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm sm:text-base text-gray-500">Manage your procurement requests</p>
                </div>
                <Link to="/create" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap self-start sm:self-auto">
                    <Plus size={18} />
                    <span className="text-sm sm:text-base">New RFP</span>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {rfps.map(rfp => (
                    <Link key={rfp.id} to={`/rfp/${rfp.id}`} className="block p-4 sm:p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                                    <FileText size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">{rfp.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{rfp.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> {new Date(rfp.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {rfp._count?.proposals || 0} Proposals
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 self-start sm:self-center">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(rfp.status)}`}>
                                    {rfp.status}
                                </span>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();

                                        // 1. Optimistic (Instant)
                                        removeRfpOptimistic(rfp.id);

                                        // 2. Background
                                        try {
                                            await deleteRfp(rfp.id);
                                            refreshRfps();
                                        } catch (e) {
                                            console.error(e);
                                            refreshRfps(); // Revert
                                            alert("Failed to delete RFP.");
                                        }
                                    }}
                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete RFP"
                                >
                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                                <ChevronRight className="hidden sm:block text-gray-300" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {rfps.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="inline-block p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No RFPs yet</h3>
                    <p className="text-gray-500 mb-6">Create your first request to get started.</p>
                    <Link to="/create" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                        Create RFP
                    </Link>
                </div>
            )}
        </div>
    );
};
