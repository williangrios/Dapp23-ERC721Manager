import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';

import ERC721Token from './artifacts/contracts/ERC721Token.sol/ERC721Token.json';

function App() {

  const [userAccount, setUserAccount] = useState('');

  const [tokenCount, setTokenCount] = useState();

  const [ownerOfToken, setOwnerOfToken] = useState('');

  const [approvedAddressOfTokenId, setApprovedAddressOfTokenId] = useState('');

  const [ownerIsApprovedForAll, setOwnerIsApprovedForAll] = useState('');
  const [operatorIsApprovedForAll, setOperatorIsApprovedForAll] = useState('');

  const [approveAddres, setApproveAddress] = useState('');
  const [approveTokenId, setApproveTokenId] = useState('');

  const [operatorSetApprovalForAll, setOperatorSetApprovalForAll] = useState('');
  
  const [fromTransferFrom, setFromTransferFrom] = useState('');
  const [toTransferFrom, setToTransferFrom] = useState('');
  const [tokenIdTransferFrom, setTokenIdTransferFrom] = useState('');

  const [fromSafeTransferFrom, setFromSafeTransferFrom] = useState('');
  const [toSafeTransferFrom, setToSafeTransferFrom] = useState('');
  const [tokenIdSafeTransferFrom, setTokenIdSafeTransferFrom] = useState('');

  const addressContract = '0x98Bfd710c12a42c2d7eBf9381266880Dd02fB731';
  
  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  async function getProvider(connect = false){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, ERC721Token.abi, provider)
    }
    if (contractDeployedSigner == null){
      contractDeployedSigner = new ethers.Contract(addressContract, ERC721Token.abi, provider.getSigner());
    }
    if (connect && userAccount==''){
      let userAcc = await provider.send('eth_requestAccounts', []);
      setUserAccount(userAcc[0]);
    }
  }

  async function disconnect(){
    try {
      setUserAccount('');
    } catch (error) {
      
    }
  }

  useEffect(() => {
    getData()
  }, [])

  function toastMessage(text) {
    toast.info(text)  ;
  }

  async function getData(connect = false) {
    await getProvider(connect);
    setTokenCount((await contractDeployed.nextTokenId()).toString())
  }

  async function handleMint(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.mint();  
      console.log(resp);
      toastMessage("Minted.")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleOwnerOfToken(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.ownerOf(ownerOfToken);  
      if(resp == '0x0000000000000000000000000000000000000000'){
        toastMessage("Token burned or not minted")
      }else{
        toastMessage(`The owner is ${resp}`)
      }
     
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleApprovedAddressOfToken(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.getApproved(approvedAddressOfTokenId);  
      if(resp == '0x0000000000000000000000000000000000000000'){
        toastMessage("Token not approved")
      }else{
        toastMessage(`Approved for ${resp}`)
      }
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleSetApprovalForAll(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.setApprovalForAll(operatorSetApprovalForAll, true);  
      console.log(resp);
      toastMessage("Set Approved for all")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleIsApprovedForAll(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.isApprovedForAll(ownerIsApprovedForAll, operatorIsApprovedForAll);  
      console.log(resp);
      if (resp){
        toastMessage("Is Approved for all")
      }else{
        toastMessage("Is NOT Approved for all")
      }
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleBalanceOf(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.balanceOf(userAccount);  
      console.log(resp);
      toastMessage(`Your balance is ${resp.toString()}`)
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleTransferFrom(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.transferFrom(fromTransferFrom, toTransferFrom, tokenIdTransferFrom);  
      console.log(resp);
      toastMessage("Done")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleSafeTransferFrom(){
    await getProvider(true);
    try {
      console.log('ent');
      const resp  = await contractDeployedSigner.safeTransferFrom(fromSafeTransferFrom, toSafeTransferFrom, tokenIdSafeTransferFrom);  
      console.log(resp);
      toastMessage("Done")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  async function handleApprove(){
    await getProvider(true);
    try {
      const resp  = await contractDeployedSigner.approve(approveAddres, approveTokenId);  
      console.log(resp);
      toastMessage("Approved.")
    } catch (error) {
      toastMessage(error.reason);
    }
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="ERC 721 TOKEN" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>
        {
          userAccount =='' ?<>
            <h2>Connect your wallet</h2>
            <button className="btn btn-primary col-3" onClick={() => getData(true)}>Connect</button>
          </>
          :<>
            <h2>User data</h2>
            <label>User account: {userAccount}</label>
            <button className="btn btn-primary col-3" onClick={disconnect}>Disconnect</button></>
        }
        
        <hr/>
        { tokenCount &&<>
          <h2>Contract data</h2>
          <div className="row col-3 mb-3 justify-content-center">
            <label>Tokens Minted: {tokenCount}</label>
          </div></>
        }
                
        <h2>Mint token (only admin)</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <button className="btn btn-primary" onClick={handleMint}>Click to mint</button>
        </div>

        <h2>Owner of Token</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="number" className="mb-1" placeholder="Token id" onChange={(e) => setOwnerOfToken(e.target.value)} value={ownerOfToken} />
          <button className="btn btn-primary" onClick={handleOwnerOfToken}>Click to discover</button>
        </div>
        

        <h2>Approved address of token</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="number" className="mb-1" placeholder="Token id" onChange={(e) => setApprovedAddressOfTokenId(e.target.value)} value={approvedAddressOfTokenId} />
          <button className="btn btn-primary" onClick={handleApprovedAddressOfToken}>Click to discover</button>
        </div>

        <h2>Approve</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="Address" onChange={(e) => setApproveAddress(e.target.value)} value={approveAddres} />
          <input type="number" className="mb-1" placeholder="Token id" onChange={(e) => setApproveTokenId(e.target.value)} value={approveTokenId} />
          <button onClick={handleApprove} className="btn btn-primary">Approve</button>
        </div>

        <h2>Approval for all</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="Operator address" onChange={(e) => setOperatorSetApprovalForAll(e.target.value)} value={operatorSetApprovalForAll} />
          <button className="btn btn-primary" onClick={handleSetApprovalForAll}>Approval for all</button>
        </div>

        <h2>Is approved for all</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="Owner address" onChange={(e) => setOwnerIsApprovedForAll(e.target.value)} value={ownerIsApprovedForAll} />
          <input type="text" className="mb-1" placeholder="Operator address" onChange={(e) => setOperatorIsApprovedForAll(e.target.value)} value={operatorIsApprovedForAll} />
          <button className="btn btn-primary" onClick={handleIsApprovedForAll}>Click to discover</button>
        </div>
        
        <h2>Balance</h2>
        <button className="col-3 btn btn-primary" onClick={handleBalanceOf}>Click to discover</button>
        
        <h2>Transfer from</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="From" onChange={(e) => setFromTransferFrom(e.target.value)} value={fromTransferFrom} />
          <input type="text" className="mb-1" placeholder="To" onChange={(e) => setToTransferFrom(e.target.value)} value={toTransferFrom} />
          <input type="number" className="mb-1" placeholder="Token Id" onChange={(e) => setTokenIdTransferFrom(e.target.value)} value={tokenIdTransferFrom} />
          <button className="btn btn-primary " onClick={handleTransferFrom}>Transfer from</button>
        </div>
        
        <h2>Safe transfer from</h2>
        <div className="row col-3 mb-3 justify-content-center">
          <input type="text" className="mb-1" placeholder="From" onChange={(e) => setFromSafeTransferFrom(e.target.value)} value={fromSafeTransferFrom} />
          <input type="text" className="mb-1" placeholder="To" onChange={(e) => setToSafeTransferFrom(e.target.value)} value={toSafeTransferFrom} />
          <input type="number" className="mb-1" placeholder="Token Id" onChange={(e) => setTokenIdSafeTransferFrom(e.target.value)} value={tokenIdSafeTransferFrom} />
          <button className="btn btn-primary " onClick={handleSafeTransferFrom}>Safe transfer from</button>
        </div>
       
      </WRContent>
      <WRTools react={true} hardhat={true} bootstrap={true} solidity={true} css={true} javascript={true} ethersjs={true} />
      <WRFooter />         
    </div>
  );
}

export default App;
