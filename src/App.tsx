import {
  EthereumTransactionTypeExtended,
  InterestRate,
} from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";
import Borrow from "./methods/Borrow.js";
import Supply from "./methods/supply.js";
import Repay from "./methods/Repay.js";

function app() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const pool = new Pool(provider, {
    POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
    WETH_GATEWAY: "0xDde0E8E6d3653614878Bf5009EDC317BC129fE2F",
  });

  async function submitTransaction({
    user,
    reserve,
    amount,
    interestRateMode,
    onBehalfOf,
  }: {
    user: string;
    reserve: string;
    amount: string;
    interestRateMode: InterestRate;
    onBehalfOf: string;
  }) {
    console.log("Transaction");
    try {
      // Correct the method to borrow from Aave
      const txs: EthereumTransactionTypeExtended[] = await pool.repay({
        user,
        reserve,
        amount,
        interestRateMode,
        onBehalfOf,
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
    <Repay />
      {/* <button
        onClick={() =>
          submitTransaction({
            user: "0x84B325e04a106A8A4636914C22319b9daecF2892",
            reserve: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
            amount: "10",
            interestRateMode: InterestRate.Variable,
            onBehalfOf: "0x84B325e04a106A8A4636914C22319b9daecF2892",
          } )
        }
      >
        Transaction */}
      {/* </button> */}
    </>
  );
}

export default app;
