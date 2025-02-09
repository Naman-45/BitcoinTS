# **BitcoinTS**  

A simplified Bitcoin system design implementation in TypeScript.

![System Design Architecture](https://res.cloudinary.com/dxyexbgt6/image/upload/v1739131989/Untitled-2024-07-24-2243_1_cpy4wm.png)

## 🌟 Overview  
BitcoinTS is a decentralized blockchain network that enables secure transactions using a proof-of-work consensus mechanism. This project consists of multiple components that replicate the core functionalities of Bitcoin.

## ⚙️ **System Components**  

### 🖥 **Central Server (WebSocket Server)**  
- Acts as a communication hub for all connected miners.  
- Facilitates transaction propagation across the network.  
- Ensures all miners are synchronized.  

### ⛏ **Miner Server**  
- Handles block creation and proof-of-work computation.  
- Verifies transaction signatures, balances, and block validity.  
- Rejects erroneous or smaller blockchains.  
- Syncs up with the latest blockchain state when starting.  

### 💻 **Frontend**  
- Enables users to create Bitcoin wallets.  
- Allows users to sign transactions and send them to miner servers.  
- Displays blockchain status and transaction history.  

## 🚀 **Getting Started**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/your-repo/BitcoinTS.git
cd BitcoinTS
