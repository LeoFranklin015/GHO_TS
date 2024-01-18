import {
    EthereumTransactionTypeExtended,
  } from "@aave/contract-helpers";
  import { BigNumber, BytesLike, ethers } from "ethers";
  import { Pool } from "@aave/contract-helpers";
  
  function Swap() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  
    const pool = new Pool(provider, {
      POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
      WETH_GATEWAY: "0xDde0E8E6d3653614878Bf5009EDC317BC129fE2F",
    });
  
    async function submitTransaction({
      user,
      flash,
      fromAsset,
      fromAToken,
      toAsset,
      fromAmount,
      minToAmount,
      swapAll,
      augustus,
      swapCallData,
    }: {
      user: string;
      flash: boolean;
      fromAsset:string;
      fromAToken: string;
      toAsset: string
      fromAmount: string;
      minToAmount: string;
      swapAll: boolean;
      augustus: string;
      swapCallData: BytesLike;
    }) {
      console.log("Transaction");
      try {
        // Correct the method to borrow from Aave
        const txs: EthereumTransactionTypeExtended[] = await pool.swapCollateral(
            {
              user,
              flash,
              fromAsset,
              fromAToken,
              toAsset,
              fromAmount,
              minToAmount,
              swapAll,
              augustus,
              swapCallData
            },
          );
  
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
              user: "0x84B325e04a106A8A4636914C22319b9daecF2892",
            flash: false,
            fromAsset: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
            fromAToken: "0x3FfAf50D4F4E96eB78f2407c090b72e86eCaed24",
            toAsset: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
            fromAmount: "50",
            minToAmount: "1",
            swapAll: true,
            augustus: "0x84B325e04a106A8A4636914C22319b9daecF2892",
            swapCallData: ""
            })
          }
        >
          Transaction
        </button>
      </>
    );
  }
  
  export default Swap;
  