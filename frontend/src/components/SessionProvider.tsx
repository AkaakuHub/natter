"use client";

import { createContext, useContext } from "react";
import { ExtendedSession } from "@/types";

type ContextProps = {
    session: ExtendedSession | null;
};

const SessionContext = createContext<ContextProps | undefined>(undefined);

export function useSessionContext() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSessionContext must be used within a SessionProvider");
    }
    return context;
}

export default function SessionProvider({
    children,
    session,
}: {
    children: React.ReactNode;
    session: ExtendedSession | null;
}) {
    return (
        <SessionContext.Provider value={{ session }}>
            {children}
        </SessionContext.Provider>
    );
}
