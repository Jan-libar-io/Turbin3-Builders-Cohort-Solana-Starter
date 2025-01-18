import wallet from "../dev-wallet.json";

import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

import { imagesData } from "./state/nft";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const recieverAddresses = [
  "2WKb1EQDfEKbivtmYHjx2cErQjASaNizVUC1AW2nbHKR",
  "4gTWiPwC7AHdsu6BtySRd9KvEZVJmhQJRkB9rNH2P1Kj",
  "DYD14Q9hked8pWxFHPLpJdTcXpSX4S4in9FYd82nnfFE",
].map((address) => new PublicKey(address));

(async () => {
  imagesData.forEach(async (image, index) => {
    try {
      const mint = new PublicKey(image.nftAddress);

      // Get the token account of the fromWallet address, and if it does not exist, create it
      const fromWallet = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mint,
        keypair.publicKey
      );

      // Get the token account of the toWallet address, and if it does not exist, create it
      const toWallet = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mint,
        recieverAddresses[index]
      );

      // Transfer the new token to the "toTokenAccount" we just created
      const tx = await transfer(
        connection,
        keypair,
        fromWallet.address,
        toWallet.address,
        keypair.publicKey,
        1
      );
      console.log(`Transaction signature: ${tx}`);
    } catch (e) {
      console.error(`Oops, something went wrong: ${e}`);
    }
  });
})();
