import wallet from "../dev-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

import { imagesData } from "./state/nft";

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
  imagesData.forEach(async (image) => {
    try {
      const metadata = {
        name: image.name,
        symbol: image.symbol,
        description: image.description,
        image: image.imageUri,
        attributes: [
          { trait_type: "is_best", value: "YES" },
          { trait_type: "is_rare", value: "IT'S LEGENDARY" },
        ],
        properties: {
          files: [
            {
              type: "image/png",
              uri: image.imageUri,
            },
          ],
        },
        creators: [
          {
            address: keypair.publicKey,
            share: 100,
          },
        ],
      };

      const myUri = await umi.uploader.uploadJson(metadata);

      console.log("Your metadata URI: ", myUri);
    } catch (error) {
      console.log("Oops.. Something went wrong", error);
    }
  });
})();
