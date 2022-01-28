import React,{useEffect, useState} from "react";
import './App.css';
import { ethers } from "ethers";
import abi from "./utils/wavePortal.json";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves,setAllWaves]=useState([]);
  const [msg,setMsg] = useState('');
  const contractAddress="0x93177Bf852560Adf26709dA208276193337D1ea6"
  const contractAbi=abi.abi;

  const getAllWaves = async () => {
    try{
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);

        const waves= await wavePortalContract.getAllWaves();

        let wavesCleaned=[];
        waves.forEach( wave => {
          wavesCleaned.push({
            address : wave.waver,
            timestamp: new Date(wave.timestamp*1000),
            message: wave.message
          });
        } );
        console.log(allWaves);
        setAllWaves(wavesCleaned);
      }else{
          console.log("Ethereum object doesn't exist!")

      }
  }catch(error){
    console.log(error)
  }
 }

  const checkIfWalletIsConnected =async () => {
    try{
      const {ethereum}= window;

      if(!ethereum){
        console.log("Make sure you have metamask!");
      }else{
        console.log("We have the ethereum Obejct",ethereum);
      }
  
      const accounts= await ethereum.request({method: "eth_accounts"});

      if (accounts.length !== 0){
        const account= accounts[0];
        console.log("Found an authorized account:",account);
        setCurrentAccount(account);
        getAllWaves();
        
      }else{
              console.log("No authorized account found!");
      }
    }catch(error){
      console.log(error);
    }

  }

  const connectWallet = async () => {
    try {
      const{ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected",accounts[0]);
      setCurrentAccount(accounts[0]);

    }catch(error){
        console.log(error);
    }

  }

  const wave = async () => {
    try{
      const{ethereum} = window;
      
      if(ethereum){
        const provider= new ethers.providers.Web3Provider(ethereum);
        const signer =provider.getSigner();
        const wavePortalContract= new ethers.Contract(contractAddress,contractAbi,signer);

        let count= await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn= await wavePortalContract.wave(msg,{gasLimit: 300000});
        console.log("Mining", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined --", waveTxn.hash);

        count= await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
      }else{
            console.log("Ethereum object doesn't exist!");
      }
    }catch(error){
      console.log(error);
    }
  }

  const getTotalWaves = async () =>{
      try{
        const {ethereum} = window;
        if(ethereum){
          const provider= new ethers.providers.Web3Provider(ethereum);
          const signer =provider.getSigner();
          const wavePortalContract= new ethers.Contract(contractAddress,contractAbi,signer);

          let count= await wavePortalContract.getTotalWaves();
          count = count.toNumber();
          console.log("Total waves:",count)

          setTotalWaves(`Total Waves:${count}`)
          
        }else{
            console("eth object doesnt exist");
        }
      }catch(error){
          console.log(error);
      }
    }
  

  
  useEffect( () =>{
    checkIfWalletIsConnected();
    getTotalWaves();

    let wavePortalContract;

    const onNewWave=(from,timestamp,message) =>{
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address:from,
          timestamp:new Date(timestamp * 1000),
          message: message,

      },
      ]);
    };
    if(window.ethereum){
      const provider=new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(contractAddress, contractAbi, signer);

      wavePortalContract.on("NewWave",onNewWave);
    }

    return () => {
      if(wavePortalContract){
        wavePortalContract.off("NewWave",onNewWave);
      }
    };


  },[])

  const [totalwaves,setTotalWaves]=useState("")

  return(
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
        I am dev and i love coding.
        </div>
        <button className="waveButton" onClick={wave}>
          Wave At Me
        </button>
        <div className="msg-box">
          <input id="message" type="text" required placeholder="Enter your message here" class="input-box" onChange={e => setMsg(e.target.value)} />
        </div>
        { !currentAccount && (
        <button className="waveButton" onClick={connectWallet}> Connect Wallet</button>
        )}
        <button className="total-waves" >
          {totalwaves}
        </button>
        {allWaves.map( (wave,index) =>{
              return(
                <div key={index} style={{backgroundColor:"OldLace",marginTop:"16px",padding: "8px"}}>
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              )
          } )
        }
      </div>

    </div>
  );

}

export default App