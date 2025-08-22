/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios, authUser} = useContext(AuthContext);

    const getUsers = async () => {
        try {
            const timestamp = new Date().getTime();
            const { data } = await axios.get(`/api/messages/users?t=${timestamp}`);
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData );
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const subscribeToMessages = () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if ((selectedUser && newMessage.senderId === selectedUser._id) || newMessage.senderId === authUser._id) {
                newMessage.isSeen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                if (selectedUser && newMessage.senderId === selectedUser._id) {
                    axios.put(`/api/messages/seen/${newMessage._id}`)
                }
            }
            else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }));
            }
        })
    }

    const unSubscribeFromMessages = () => {
        if (socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribeToMessages()
        return () => unSubscribeFromMessages()
    }, [socket, selectedUser])
    



    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,        
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}