import wallet from "../dev-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import base58 from "bs58";

import { imagesData } from "./state/nft";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));

const collectionNftAddress = UMIPublicKey(
  "2YreZXiGsSm1tnu2gTT27B3GAwBWBhrsEAwbfvs5anbb"
);

(async () => {
  imagesData.forEach(async (image) => {
    try {
      umi.use(mplTokenMetadata());
      const mint = generateSigner(umi);
      const tx = createNft(umi, {
        mint,
        name: image.name,
        symbol: image.symbol,
        uri: image.metadataUri,
        updateAuthority: keypair.publicKey,
        sellerFeeBasisPoints: percentAmount(5),
        collection: {
          key: collectionNftAddress,
          verified: false,
        },
      });
      const result = await tx.sendAndConfirm(umi);
      const signature = base58.encode(result.signature);

      console.log(
        `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
      );

      console.log("Mint Address: ", mint.publicKey);
    } catch (error) {
      console.log("Error: ", error);
    }
  });
})();
