import React, { createContext, useContext, useEffect } from 'react';
import socket from '../api/socket';
import { supabase } from '../api/supabaseClient';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                socket.connect();
                console.log('[SocketContext] Utilizador logado. Conectando o socket.');
            } else if (event === 'SIGNED_OUT') {
                socket.disconnect();
                console.log('[SocketContext] Utilizador deslogado. Desconectando o socket.');
            }
        });

        const connectOnLoad = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                socket.connect();
            }
        };
        connectOnLoad();

        return () => {
            subscription.unsubscribe();
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};