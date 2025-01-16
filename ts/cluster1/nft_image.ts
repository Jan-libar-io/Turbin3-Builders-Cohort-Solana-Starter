import wallet from "../dev-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  irysUploader,
  IrysUploaderOptions,
} from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

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
    //1. Load image
    const imageFile = await readFile("cluster1/assets/space_dog.png");

    //2. Convert image to generic file.
    const image = createGenericFile(imageFile, "space_dog.png", {
      contentType: "image/png",
    });

    //3. Upload image
    const [imageUri] = await umi.uploader.upload([image]);

    console.log("Your image URI: ", imageUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
