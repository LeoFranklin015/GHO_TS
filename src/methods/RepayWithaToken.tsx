import {
    EthereumTransactionTypeExtended,
    InterestRate,
  } from "@aave/contract-helpers";
  import { BigNumber, ethers } from "ethers";
  import { Pool } from "@aave/contract-helpers";
  
  function RepayWithaToken() {
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

    }: {
      user: string;
      reserve: string;
      amount: string;
      interestRateMode: InterestRate;

    }) {
      console.log("Transaction");
      try {
        // Correct the method to borrow from Aave
        const txs: EthereumTransactionTypeExtended[] = await pool.repayWithATokens({
          user,
          reserve,
          amount,
          rateMode: interestRateMode
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
        <button
          onClick={() =>
            submitTransaction({
              user: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
              reserve: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
              amount: "10",
              interestRateMode: InterestRate.Variable,

            })
          }
        >
          Transaction
        </button>
      </>
    );
  }
  
  export default RepayWithaToken;
  