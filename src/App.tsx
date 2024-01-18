import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";
// import { markets } from "@bgd-labs/aave-address-book";

import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import Signature from "./methods/Signature.js";
import Swap from "./methods/Swap.js";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: "LsWilC5MMkiLmEKlE_12IEA_MoA7dm_m", // or infuraId
    walletConnectProjectId: "d5f4cd673d0fe10a25f4af91ccc85d0f",
    chains: [sepolia],

    // Required
    appName: "Gho_ts",
  })
);

function app() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const connectwalletHandler = () => {
    if (window.ethereum) {
      provider.send("eth_requestAccounts", []).then(async () => {
        console.log("Connected");
      });
    } else {
    }
  };
  connectwalletHandler();
  const pool = new Pool(provider, {
    POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    WETH_GATEWAY: "0xDde0E8E6d3653614878Bf5009EDC317BC129fE2F",
  });

  async function getERC20ApprovalSignature(
    user: string,
    reserve: string,
    amount: string,
    deadline: string,
    currentAccount: string
  ): Promise<string> {
    try {
      const dataToSign: string = await pool.signERC20Approval({
        user,
        reserve,
        amount,
        deadline,
      });

      // Log the dataToSign for debugging
      console.log("Data to Sign:", dataToSign);

      const signature: string = await provider.send("eth_signTypedData_v4", [
        currentAccount,
        dataToSign,
      ]);
      return signature;
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in getERC20ApprovalSignature:", error);
      throw error;
    }
  }

  async function submitTransaction({
    user,
    reserve,
    amount,
    onBehalfOf,
    deadline,
  }: {
    user: string;
    reserve: string;
    amount: string;
    onBehalfOf: string;
    deadline: string;
  }) {
    console.log("Transaction");
    try {
      const signature: string = await getERC20ApprovalSignature(
        user,
        reserve,
        amount,
        deadline,
        "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334" //Current User
      );
      const txs: EthereumTransactionTypeExtended[] =
        await pool.supplyWithPermit({
          user,
          reserve,
          amount,
          signature,
          onBehalfOf,
          deadline,
        });

      // Handle each transaction in the array
      for (const tx of txs) {
        const extendedTxData = await tx.tx();
        const { from, ...txData } = extendedTxData;
        const signer = provider.getSigner(from);

        const txResponse = await signer.sendTransaction({
          ...txData,
          value: txData.value ? BigNumber.from(txData.value) : undefined,
          // gasLimit: 10000000000000,
        });
        console.log(txResponse);
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in submitTransaction:", error);
    }
  }

  return (
    <>
       <WagmiConfig config={config}>
        <ConnectKitProvider>
          {/* <button
            onClick={() =>
              submitTransaction({
                user: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
                reserve: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
                amount: "10",
                onBehalfOf: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
                deadline: "3600",
              })
            }
          >
            Transaction
          </button> */}
          <Swap />
          {/* <Signature /> */}
          <ConnectKitButton />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}

export default app;
