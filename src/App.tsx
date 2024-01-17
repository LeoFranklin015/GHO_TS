import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";

function App() {
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
            user: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
            reserve: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
            amount: "100",
            onBehalfOf: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
          })
        }
      >
        Transaction
      </button>
    </>
  );
}

export default App;
