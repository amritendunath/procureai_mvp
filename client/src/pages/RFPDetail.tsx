import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRfp, sendRfp, checkResponses, getVendors, getComparison } from '../lib/api';
import type { Rfp, Vendor } from '../lib/types';
import { Mail, RefreshCw, BarChart2, Check } from 'lucide-react';

import { useData } from '../lib/DataContext'; // Ensure this import exists

export const RFPDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [rfp, setRfp] = useState<Rfp | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [checkingMail, setCheckingMail] = useState(false);
    const [comparing, setComparing] = useState(false);
    const [sendingRfp, setSendingRfp] = useState(false);
    const [comparison, setComparison] = useState<string | null>(null);

    const { rfpDetails, cacheRfpDetail } = useData();

    useEffect(() => {
        if (id) {
            if (rfpDetails[id]) {
                setRfp(rfpDetails[id]); // Load from cache instantly
            } else {
                loadRfp(); // Fetch if not in cache
            }
            getVendors().then(setVendors);
        }
    }, [id]);

    const loadRfp = () => {
        if (id) {
            getRfp(id).then(data => {
                setRfp(data);
                cacheRfpDetail(data); // Update cache
            });
        }
    };

    const handleSend = async () => {
        if (!id || selectedVendors.length === 0) return;
        setSendingRfp(true);
        try {
            await sendRfp(id, selectedVendors);
            alert('RFP sent to selected vendors!');
            loadRfp();
        } catch (e) {
            console.error(e);
            alert('Failed to send emails.');
        } finally {
            setSendingRfp(false);
        }
    };

    const handleCheckResponses = async () => {
        if (!id) return;
        setCheckingMail(true);
        try {
            await checkResponses(id);
            loadRfp();
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingMail(false);
        }
    };

    const handleCompare = async () => {
        if (!id) return;
        setComparing(true);
        try {
            const res = await getComparison(id);
            setComparison(res.analysis);
        } catch (e) {
            console.error(e);
        } finally {
            setComparing(false);
        }
    };

    const toggleVendor = (vId: string) => {
        if (selectedVendors.includes(vId)) {
            setSelectedVendors(selectedVendors.filter(v => v !== vId));
        } else {
            setSelectedVendors([...selectedVendors, vId]);
        }
    };

    if (!rfp) return <div className="p-8 text-center">Loading...</div>;

    const structured = typeof rfp.structuredData === 'string'
        ? JSON.parse(rfp.structuredData)
        : rfp.structuredData;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{rfp.title}</h1>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide border ${rfp.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {rfp.status}
                        </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 max-w-2xl">{rfp.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button onClick={handleCheckResponses} disabled={checkingMail} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50">
                        <RefreshCw size={16} className={`sm:w-[18px] sm:h-[18px] ${checkingMail ? 'animate-spin' : ''}`} />
                        Check Mail
                    </button>
                    <button onClick={handleCompare} disabled={comparing} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base disabled:opacity-50">
                        <BarChart2 size={16} className={`sm:w-[18px] sm:h-[18px] ${comparing ? 'animate-spin' : ''}`} />
                        Compare
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Col: Details & Vendors */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Requirements Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Requirements (AI Extracted)</h3>
                        <div className="space-y-4">
                            {structured.items && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                                    <ul className="space-y-2">
                                        {structured.items.map((item: any, i: number) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded">
                                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                {typeof item === 'string' ? item : `${item.quantity}x ${item.name} (${item.specs})`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Estimated Budget</h4>
                                    <p className="text-lg font-semibold">${structured.budget?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Due Date</h4>
                                    <p className="text-lg font-semibold">{structured.deliveryDate || structured.dueDate || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Result */}
                    {comparison && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
                            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <BotIcon /> AI Recommendation
                            </h3>
                            <div className="prose prose-sm max-w-none text-indigo-800">
                                {comparison.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        </div>
                    )}

                    {/* Proposals List */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Proposals Received ({rfp.proposals?.length || 0})</h3>
                        <div className="space-y-4">
                            {rfp.proposals?.map(p => {
                                const analysis = typeof p.structuredAnalysis === 'string' ? JSON.parse(p.structuredAnalysis) : p.structuredAnalysis;
                                return (
                                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between mb-4">
                                            <h4 className="font-bold text-lg">{p.vendor?.name || 'Unknown Vendor'}</h4>
                                            <span className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <span className="text-xs text-gray-500 uppercase">Price</span>
                                                <div className="font-semibold text-lg">${analysis.price?.toLocaleString()}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <span className="text-xs text-gray-500 uppercase">Delivery</span>
                                                <div className="font-semibold">{analysis.deliveryTimeline || analysis.delivery || 'N/A'}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <span className="text-xs text-gray-500 uppercase">Warranty</span>
                                                <div className="font-semibold">{analysis.warranty || 'N/A'}</div>
                                            </div>
                                        </div>
                                        {analysis.pros && (
                                            <div className="mb-2">
                                                <span className="text-xs font-bold text-green-600 uppercase">Pros: </span>
                                                <span className="text-sm text-gray-600">{analysis.pros.join(', ')}</span>
                                            </div>
                                        )}
                                        {analysis.cons && (
                                            <div>
                                                <span className="text-xs font-bold text-red-600 uppercase">Cons: </span>
                                                <span className="text-sm text-gray-600">{analysis.cons.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {(!rfp.proposals || rfp.proposals.length === 0) && (
                                <p className="text-gray-500 italic">No proposals received yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Send to Vendors</h3>
                        {rfp.status === 'sent' && (
                            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                                <Check size={16} /> Already sent. You can send to more.
                            </div>
                        )}
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-2">
                            {vendors.map(v => (
                                <label key={v.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedVendors.includes(v.id)}
                                        onChange={() => toggleVendor(v.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{v.name}</div>
                                        <div className="text-xs text-gray-500">{v.email}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={selectedVendors.length === 0 || sendingRfp}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            {sendingRfp ? 'Sending...' : (
                                <>
                                    <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span className="hidden sm:inline">Send RFP ({selectedVendors.length})</span>
                                    <span className="sm:hidden">Send ({selectedVendors.length})</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M6 14h12" />
        <path d="M8 8v-2" />
        <path d="M16 8v-2" />
    </svg>
);
