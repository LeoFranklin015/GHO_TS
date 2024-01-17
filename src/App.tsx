import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";

function App() {
  // const provider = new ethers.providers.AlchemyProvider(
  //   "goerli",
  //   ""//I have given my acccess key
  // );
  // const network = ethers.providers.getNetwork("sepolia");
  // const provider = new ethers.providers.EtherscanProvider(network);
  // console.log(provider);

  const provider = new ethers.providers.InfuraProvider("sepolia");
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
        const signer = new ethers.Wallet(
          "6bec59d4979fdaaf7f4b7174b84332246fb89e42b159e930bf7ea2351483b5a0",
          provider
        );
        // const signer = provider.getSigner(from);
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
            amount: "10000",
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
