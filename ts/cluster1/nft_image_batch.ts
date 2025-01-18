import wallet from "../dev-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

import { nftBatch } from "./state/nft";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz",
  })
);
umi.use(signerIdentity(signer));

(async () => {
  Promise.all(
    nftBatch.map(async (nft) => {
      const imageFile = await readFile(nft.filePath);
      return createGenericFile(imageFile, nft.fileName, {
        contentType: "image/png",
      });
    })
  )
    .then(async (allImageCreationResults) => {
      const images = allImageCreationResults.filter(Boolean);
      const imageUris = await umi.uploader.upload(images);
      imageUris.forEach((imageUri) => {
        console.log(`Your image URI: ${imageUri}`);
      });
    })
    .catch((error) => {
      console.log("Oops.. Something went wrong", error);
    });
})();
