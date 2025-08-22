import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js"

export const getUsersForSidebar = async (req, res)=>{
    try {
        const userId = req.user._id
        console.log("Current user ID:", userId.toString());
        console.log("Current user name:", req.user.fullName);
        
        const allUsers = await User.find().select("-password")
        console.log("All users in DB:", allUsers.map(u => ({
            id: u._id.toString(), 
            name: u.fullName,
            profilePic: u.profilePic
        })));
        
        const filteredUsers = allUsers.filter(user => user._id.toString() !== userId.toString())
        console.log("Filtered users to return:", filteredUsers.map(u => ({
            id: u._id.toString(), 
            name: u.fullName,
            profilePic: u.profilePic
        })));

        const unseenMessages = {}

        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({
                senderId: user._id, 
                receiverId: userId, 
                seen: false
            })
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length
            }
        })
        await Promise.all(promises)
        
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.json({success: true, users: filteredUsers, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params
        const myId = req.user._id
        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId:myId}, {seen: true})

        res.json({success: true, messages})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const markMessageAsSeen = async (req, res) =>{
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        const receiverSocketId = userSocketMap[receiverId]
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        const senderSocketId = userSocketMap[senderId]
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}