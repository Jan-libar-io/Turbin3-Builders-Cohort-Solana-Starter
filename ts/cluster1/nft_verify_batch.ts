import wallet from "../dev-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import {
  findMetadataPda,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import base58 from "bs58";

import { imagesData } from "./state/nft";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));

const collectionAddress = UMIPublicKey(
  "2YreZXiGsSm1tnu2gTT27B3GAwBWBhrsEAwbfvs5anbb"
);

(async () => {
  imagesData.forEach(async (image) => {
    try {
      const nftAddress = UMIPublicKey(image.nftAddress);
      const metadata = findMetadataPda(umi, { mint: nftAddress });
      const tx = verifyCollectionV1(umi, {
        metadata,
        collectionMint: collectionAddress,
        authority: umi.identity,
      });

      const result = await tx.sendAndConfirm(umi);
      const signature = base58.encode(result.signature);

      console.log(
        `Succesfully Verified! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } catch (error) {
      console.log("Error: ", error);
    }
  });
})();
