import wallet from "../dev-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

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
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

    const imageUri =
      "https://devnet.irys.xyz/FF1JBCPvf4Sp1dRYJcECXitWzSrcVLtkuqVzVkuDZmT2";

    const metadata = {
      name: "SpaceDog",
      symbol: "SD",
      description:
        "One unique Polish Hussar Dog exploring the Solana galaxy on a mechanical cat.",
      image: imageUri,
      attributes: [
        { trait_type: "is_best", value: "YES" },
        { trait_type: "is_rare", value: "IT'S LEGENDARY" },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: imageUri,
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
})();
