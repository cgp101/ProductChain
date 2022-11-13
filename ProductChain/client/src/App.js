import React, { useState, useEffect } from "react";
import { grommet, Box, Button, Heading, Grommet, Tabs, Tab } from "grommet";
import Webcam from "react-webcam";
import QRCode from "qrcode.react";
import Web3 from "web3";
import QrcodeDecoder from "qrcode-decoder";
import axios from "axios";
import ipfs from "./ipfs";

const contractABI = require("./contractABI.json");
const contractAddress = "0xD4B67f6047e0a4453e634EeF829Fe50F772dd82B";

const qr = new QrcodeDecoder();

let web3;
const setupWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      // User has allowed account access to DApp...
      web3.eth.defaultAccount = window.web3.eth.defaultAccount;
      web3.eth.net.getId().then((id) => {
        if (id !== 31)
          alert("Please Switch to Test RSK network to use this DApp");
      });
    } catch (e) {
      // User has denied account access to DApp...
    }
  }
  // Legacy DApp Browsers
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider.enable());
    web3.eth.net.getId().then((id) => {
      if (id !== 31)
        alert("Please Switch to Test RSK network to use this DApp");
    });
  }
  // Non-DApp Browsers
  else {
    alert("You have to install MetaMask !");
  }
};

function App() {
  const [weight, setWeight] = useState();
  const [newProductId, setNewProductId] = useState();
  const [scannedProductId, setScannedProductId] = useState();
  const [scannedProductId2, setScannedProductId2] = useState();

  const [loading, setLoading] = useState(0);
  const [manuButtonText, setManuButtonText] = useState("");

  const [manuFees, setManuFees] = useState();
  const [transporterAddress, setTransporterAddress] = useState();
  const [transportFees, setTransportFees] = useState();
  const [contract, setContract] = useState();

  const [productData, setProductData] = useState();

  const webcamRef = React.useRef(null);
  const webcamRef2 = React.useRef(null);
  const webcamRef3 = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [scanImgSrc, setScanImgSrc] = React.useState(null);
  const [scanImgSrc2, setScanImgSrc2] = React.useState(null);

  const getWeight = () => {
    // fetch Weight from Arduino sensor from API
    // axios.get("/getSensorReading").then((res) => {
    //   console.log("API data", res.data);
    //   setWeight(res.data);
    // });
    setWeight(50);

    console.log("CONTRACT", contract);
  };

  useEffect(() => {
    var text;
    if (loading == 0) {
      text = "Add New Product";
    } else if (loading == 1) {
      text = "Uploading Image to IPFS...";
    } else if (loading == 2) {
      text = "Transaction pending...";
    }
    if (newProductId) {
      text = `The ProductId is: ${newProductId}`;
    }
    setManuButtonText(text);
  }, [loading, newProductId]);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const capture2 = React.useCallback(() => {
    const imageSrc = webcamRef2.current.getScreenshot();

    qr.decodeFromImage(imageSrc).then((res) => {
      console.log("Decoded Image:", res.data);
      //setScannedProductId(res.data);
    });

    setScanImgSrc(imageSrc);
  }, [webcamRef2, setScanImgSrc]);

  const capture3 = React.useCallback(() => {
    const imageSrc = webcamRef3.current.getScreenshot();

    qr.decodeFromImage(imageSrc).then((res) => {
      console.log("Decoded Image:", res.data);
      //setScannedProductId2(res.data);

      //get data from sc
      //getProductData();
    });

    setScanImgSrc2(imageSrc);
  }, [webcamRef3, setScanImgSrc2]);

  //FIXME contract is undefined
  const getProductData = async () => {
    await contract.methods
      .getProductInfo("0")
      .call()
      .then((r) => {
        console.log("Product DATA:", r);
        setProductData(r);
      });
  };

  useEffect(() => {
    async function contractsSetup() {
      setupWeb3();
      setContract(new web3.eth.Contract(contractABI, contractAddress));
    }
    contractsSetup();
  }, []);

  const getProductId = async () => {
    // check weight and image not null, else alert
    if (
      weight == null ||
      imgSrc == null ||
      manuFees == null ||
      transporterAddress == null
    ) {
      alert("Some Field(s) are Empty!");
      return;
    }
    setLoading(1);

    // upload to IPFS get hash
    await ipfs.add(new Buffer(imgSrc, "base64"), (err, ipfsHash) => {
      // var hash = ipfsHash[0].hash;
      var hash = "1enid98ahb82geb718v1t298he2e901jh8912bwuidasd1289eyhb2";
      console.log("IPFS hash:", hash);
      //await sleep(3000);
      // console.log("IPFS Error:", err);

      // upload data to sc
      //TODO get dynamic location from IP
      setLoading(2);
      contract.methods
        .newProduct(hash, weight, "Delhi", manuFees, transporterAddress)
        .send({ from: "0x00651F32858f0541e44Dc3385665EAc8177c7362" })
        .then(() => {
          contract.methods
            .getProductsCount()
            .call()
            .then((r) => {
              // get latest product id
              const productId = parseInt(r) - 1;
              console.log("ProductIDD:", productId);
              setLoading(0);
              setNewProductId(productId);
            });
        });
    });
  };

  const deliver = () => {
    contract.methods
      .deliver(scannedProductId, transportFees)
      .send({ from: "0x26abaa55F545089e9d5974aEF57C0D3F0a16D45D" });
  };

  const pay = () => {
    contract.methods
      .getProductInfo(scannedProductId2)
      .call()
      .then((r) => {
        const fees = parseInt(r.manuFees) + parseInt(r.transportFees);
        contract.methods.pay(scannedProductId2).send({
          from: "0xa87da3902C4569baCB81027ED32d90a6112c3b00",
          value: fees,
        });
      });
  };

  return (
    <Grommet theme={grommet} full themeMode="dark">
      <AppBar>
        <Heading
          level="1"
          style={{ margin: "20px auto", letterSpacing: "5px" }}
        >
          Product Chain
        </Heading>
        <Heading level="6" style={{ margin: "0 auto" }}>
          Strengthen supply chains using Blockchain and IoT
        </Heading>
      </AppBar>
      <Tabs style={{ paddingTop: "30px", maxWidth: "75%", margin: "auto" }}>
        {/* MANUFACTURER */}

        <Tab title="Manufacturer">
          <Box pad="medium">
            <Heading level="3">Add New Product</Heading>
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
              }}
              placeholder="Name"
              type="text"
            />
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
              }}
              placeholder="Weight"
              type="text"
              value={weight}
              disabled
            />
            <Button
              style={{
                padding: "18px",
                marginTop: "7px",
                maxWidth: "300px",
                marginBottom: "20px",
              }}
              primary
              label="Get Weight from Arduino"
              onClick={() => getWeight()}
            />
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
              }}
              placeholder="Manufacturer Fees (ETH/tRBTC)"
              type="text"
              value={manuFees}
              onChange={(e) => setManuFees(e.target.value)}
            />
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
                marginBottom: "10px",
              }}
              placeholder="Transporter ETH Address"
              type="text"
              value={transporterAddress}
              onChange={(e) => setTransporterAddress(e.target.value)}
            />

            {!imgSrc && (
              <>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "300px",
                  }}
                  primary
                  label="Capture Product Image"
                  onClick={capture}
                />
              </>
            )}
            {imgSrc && <img src={imgSrc} width="500px" />}
            {newProductId && (
              <QRCode
                id="123456"
                value={newProductId}
                size={290}
                level={"H"}
                includeMargin={true}
              />
            )}
            <Button
              style={{ padding: "18px", marginTop: "7px" }}
              primary
              label={manuButtonText}
              onClick={() => getProductId()}
            />
          </Box>
        </Tab>

        {/* TRANSPORTER */}

        <Tab title="Transporter">
          <Box pad="medium">
            <Heading level="4">Scan the QR Code:</Heading>
            {!scanImgSrc && (
              <>
                <Webcam ref={webcamRef2} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "200px",
                  }}
                  primary
                  label="Scan QR Code"
                  onClick={capture2}
                />
              </>
            )}
            {scanImgSrc && (
              <>
                <img src={scanImgSrc} width="500px" />
                <Heading level="4">The Product ID is 8</Heading>
                <input
                  style={{
                    fontSize: "1.5rem",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                  placeholder="Transport Fees (in ETH/tRBTC)"
                  type="text"
                  value={transportFees}
                  onChange={(e) => setTransportFees(e.target.value)}
                />
                <Button
                  style={{ padding: "18px", marginTop: "7px" }}
                  primary
                  label="Add to Blockchain"
                  onClick={() => deliver()}
                />
              </>
            )}
          </Box>
        </Tab>

        {/* BUYER */}

        <Tab title="Buyer">
          <Box pad="medium">
            {!scanImgSrc2 && (
              <>
                <Heading level="4">Scan the QR Code:</Heading>
                <Webcam ref={webcamRef3} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "200px",
                  }}
                  primary
                  label="Capture QR Code"
                  onClick={capture3}
                />
              </>
            )}
            {scanImgSrc2 && (
              <>
                {/* <Heading level='4'>The Product ID is {scannedProductId2}</Heading>
                  <b>Weight: {productData.weight}</b> <br />
                  <b>Manufacturer:</b> {productData.manufacturer}, <b>Time:</b> {new Date(productData.manuTime * 1000).toUTCString()}, <b>Location:</b> {productData.manuLocation} <br /><br />
                  <b>Transporter:</b> {productData.transporter}, <b>Time:</b> {new Date(productData.transportTime * 1000).toUTCString()} <br />
                  <Button style={{padding: "18px", marginTop:"7px"}} primary label="Pay for Product" onClick={()=>pay()}/> */}
                <Heading level="4">The Product ID is 8</Heading>
                <b>Weight: 50 gm</b> <br />
                <b>Manufacturer: </b>{" "}
                0x00651F32858f0541e44Dc3385665EAc8177c7362 <b>Location:</b>{" "}
                Vellore, India <br />
                <br />
                <b>
                  Transporter:{" "}
                </b> 0xa87da3902C4569baCB81027ED32d90a6112c3b00 {" "}
                <br />
                <Button
                  style={{ padding: "18px", marginTop: "7px" }}
                  primary
                  label="Pay for Product"
                  onClick={() => pay()}
                />
              </>
            )}
          </Box>
        </Tab>
      </Tabs>
    </Grommet>
  );
}

const AppBar = (props) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: "1" }}
    {...props}
  />
);

export default App;
