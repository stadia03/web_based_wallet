import { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import Wallet from "../components/Wallet";
import axios from 'axios';


const apiKey = 'DZHbnZioln7-ITlLrhFgZZlcSSiP3yan';

// Interface for a wallet
interface WalletType {
  publicKey: string;       // Public key of the wallet (Solana address)
  privateKey: string;      // Private key of the wallet
  balance: number;        // Optional balance of the wallet 
}


export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [currIndex, updateIndex] = useState(0);
  const [wallets, setWallets] = useState<WalletType[]>([]);

  // Load wallets and mnemonic from local storage on component mount
  useEffect(() => {
    const storedWallets = JSON.parse(localStorage.getItem("wallets") || "[]");
    const storedMnemonic = localStorage.getItem("mnemonic") || "";
    
    setWallets(storedWallets);
    setMnemonic(storedMnemonic);
  }, []);

  const generateNewMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    localStorage.setItem("mnemonic", newMnemonic); // Save to local storage
  };

  const generateKeyPair = () => {
    // Step 1: Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);
    
    // Step 2: Derive path for the current wallet index
    const path = `m/44'/501'/${currIndex}'/0'`; 
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    
    // Step 3: Generate keypair using the derived seed
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58();
    const privateKey = bs58.encode(secret);

    // Step 4: Create new wallet object 
    const newWallet = { publicKey, privateKey, balance : 0};
  
    // Step 5: Update wallets state and local storage
    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);

    // Save updated wallets to local storage
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    
    // Step 6: Update the current index for next wallet derivation
    updateIndex(currIndex + 1);

    // Optional: Log the new wallet
    console.log(`Wallet ${currIndex}:`, newWallet);
};


  const deleteWallets = () => {
    setMnemonic("");
    localStorage.setItem("mnemonic", "");
    setWallets([]);
    localStorage.setItem("wallets", "[]"); 
    updateIndex(0);
  };

  const deleteWallet = (index: number) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    setWallets(updatedWallets);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
  };



const getBalance = async (index : number) => {
  // Create a copy of the wallets array
    const updatedWallets = [...wallets];
    const address = updatedWallets[index].publicKey;
    console.log(address);
    let balanceInSol =0;
    try {
    const response = await axios.post(`https://solana-devnet.g.alchemy.com/v2/${apiKey}`, {
      id: 1,
      jsonrpc: "2.0",
      method: "getBalance",
      params: [address]
    });
    
   
     balanceInSol = response.data.result.value / 1000000000; 
     
   console.log('Balance (in SOL):', balanceInSol);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }



    //console.log("called");
  
    
    // Modify the copy, not the original state
    updatedWallets[index] = {
      ...updatedWallets[index],
      balance: balanceInSol, // or any logic to calculate the balance
    };
  
    // Update the state with the new wallets array
    setWallets(updatedWallets);
    localStorage.setItem("wallets", JSON.stringify(updatedWallets));

    //console.log(updatedWallets[index]);
  };
  
  return (
    <div>
      <h1>Web Based Wallet  </h1>
      {mnemonic && (
        <div>
          <h3>Seed Phase</h3>
          <h2>{mnemonic}</h2>
        </div>
      )}
      
      
      
      <Stack spacing={2} direction="row">
        <Button disabled={!!mnemonic} onClick={generateNewMnemonic} variant="contained">
          Create Seed Phrase
        </Button>
        <Button disabled={!mnemonic} onClick={generateKeyPair} variant="contained">
          Add Wallet
        </Button>
        <Button disabled={wallets.length === 0} onClick={deleteWallets} variant="contained">
          Clear Wallets
        </Button>
      </Stack>
      
      {wallets.length > 0 && wallets.map((wallet, index) => (
        <Wallet  
        key={wallet.publicKey}
        id={index}
        publicKey={wallet.publicKey}
        privateKey={wallet.privateKey}
        balance={wallet.balance }  // If balance is undefined, default to 0
        handleDelete={() => deleteWallet(index)}
        getBalance={()=>getBalance(index)}
      />
      
      ))}
    </div>
  );
}
