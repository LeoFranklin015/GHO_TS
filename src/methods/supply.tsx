import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";

function Supply() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const connectwalletHandler = () => {
    if (window.ethereum) {
      provider.send("eth_requestAccounts", []).then(async () => {
        console.log("Connected");
      });
    } 
  };
  connectwalletHandler();
  const pool = new Pool(provider, {
    POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", //sepolia
    WETH_GATEWAY: "0xDde0E8E6d3653614878Bf5009EDC317BC129fE2F", // weth
  });

  async function submitTransaction({
    user,
    reserve,
    amount,
    onBehalfOf,
  }: {
    user: string;
    reserve: string;
    amount: string;
    onBehalfOf: string;
  }) {
    console.log("Transaction");
    try {
      const txs: EthereumTransactionTypeExtended[] = await pool.supply({
        user,
        reserve,
        amount,
        onBehalfOf,
      });

      for (const tx of txs) {
        const extendedTxData = await tx.tx();
        const { from, ...txData } = extendedTxData;
        const signer = provider.getSigner(from);
        const txResponse = await signer.sendTransaction({
          ...txData,
          value: txData.value ? BigNumber.from(txData.value) : undefined,
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
      <button
        onClick={() =>
          submitTransaction({
            user: "0x84B325e04a106A8A4636914C22319b9daecF2892", // user address
            reserve: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", // USDC
            amount: "100",
            onBehalfOf: "0x84B325e04a106A8A4636914C22319b9daecF2892", // USEr address
          })
        }
      >
        Transaction
      </button>
    </>
  );
}

export default Supply;
