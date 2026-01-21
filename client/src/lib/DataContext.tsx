import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getRfps, getVendors } from './api';
import type { Rfp, Vendor } from './types';

interface DataContextType {
    rfps: Rfp[];
    vendors: Vendor[];
    refreshRfps: () => Promise<void>;
    refreshVendors: () => Promise<void>;
    isLoading: boolean;
    addVendorOptimistic: (vendor: Vendor) => void;
    removeVendorOptimistic: (id: string) => void;
    removeRfpOptimistic: (id: string) => void;
    rfpDetails: Record<string, Rfp>;
    cacheRfpDetail: (rfp: Rfp) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rfps, setRfps] = useState<Rfp[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [rfpDetails, setRfpDetails] = useState<Record<string, Rfp>>({});
    const [isLoading, setIsLoading] = useState(true);

    const refreshRfps = async () => {
        try {
            const data = await getRfps();
            setRfps(data);
        } catch (error) {
            console.error('Failed to load RFPs:', error);
        }
    };

    const refreshVendors = async () => {
        try {
            const data = await getVendors();
            setVendors(data);
        } catch (error) {
            console.error('Failed to load vendors:', error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            await Promise.all([refreshRfps(), refreshVendors()]);
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    const addVendorOptimistic = (newVendor: Vendor) => {
        setVendors(prev => [...prev, newVendor]);
    };

    const removeVendorOptimistic = (id: string) => {
        setVendors(prev => prev.filter(v => v.id !== id));
    };

    const removeRfpOptimistic = (id: string) => {
        setRfps(prev => prev.filter(r => r.id !== id));
        const { [id]: _, ...rest } = rfpDetails;
        setRfpDetails(rest);
    };

    const cacheRfpDetail = (rfp: Rfp) => {
        setRfpDetails(prev => ({ ...prev, [rfp.id]: rfp }));
    };

    return (
        <DataContext.Provider value={{
            rfps, vendors, refreshRfps, refreshVendors, isLoading,
            addVendorOptimistic, removeVendorOptimistic, removeRfpOptimistic,
            rfpDetails, cacheRfpDetail
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};
