# product-Chain
product Chain is a Supply Chain utilizing RSK Blockchain and IoT.

### Problem
In the current times of pandemic, it is very important that the people get safe products. But many scammers have popped up to sell fake and non-standard products that can be fatal to the innocent public.
So to have a decentralized verification mechanism to combat this, I have created product Chain.

### Walk through
1. 
The **Manufacturer** produces a new product. It is then put onto the weight measuring sensor, that transmits the data to computer from Arduino board via USB. The data is logged by the server. The webpage fetches this data from server.
The Manufacturer inputs the price as well as the transporter's Wallet Address. On clicking the button, the data is stored onto the smart contract on blockchain, along with additional data like location and time.

2. 
The **Transporter** on successfully delivering the package, scans the QR code to get productID. He/she then inputs the transportation fees and this data is then recorded onto the smart contract.

3. 
The buyer scans the QR code on the package received.
The Application fetches the data from blockchain and displays it to the buyer.


The Buyer can see the entire history of the package and hence verify its authenticity.

To pay the parties involved, the buyer clicks on Pay button and sends the transaction in form of R-BTC.

Due to the peer-to-peer nature, the amount is split up and sent to the individual wallets of Manufacturer and Transporter without any Middlemen taking a cut.
Here you can see it on blockexplorer:


### Setup
1. **Arduino**
Upload the code from `./arduino/weight.ino` and upload it to the Arduino. Connect USB to receive sensor Data to Serial Monitor via port `COM17` (might be different for different computers).

2. **Server**
a) In `server` directory, run `npm install` to install the required dependencies. It is a Express Node server.
b) `node server.js` to start the server on Port 5000. The server listens to data sent by Arduino and makes it accessible via API endpoint.

3. **Client**
a) The frontend is in React.js and available in `client` directory.
b) Use `npm install` to install required packages.
c) `npm run start` to start react application on Port 3000.
d) Grant webcam permissions to the application in browser and switch to RSK Testnet (network id: 31) via MetMask to interact with the DApp.

**Screenshots**

![image](https://user-images.githubusercontent.com/60684968/201526934-b2e7c626-534a-4a94-b9e4-6bc09a99de99.png)
![image](https://user-images.githubusercontent.com/60684968/201526952-57683477-0bf5-48d3-843f-47434f380de5.png)
![image](https://user-images.githubusercontent.com/60684968/201526922-a5773837-0d39-4074-af89-94c2df3ce7ab.png)
![image](https://user-images.githubusercontent.com/60684968/201526974-69f7120a-f22e-4bf7-b4ea-ac55d05ac408.png)
![image](https://user-images.githubusercontent.com/60684968/201526901-a50671cb-739e-40d7-b66d-50fd5aba021e.png)
 

