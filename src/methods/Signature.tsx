import {
  EthereumTransactionTypeExtended,
  ERC20Service,
  ERC20_2612Service,
} from "@aave/contract-helpers";
import { BigNumber, ethers } from "ethers";
import { Pool } from "@aave/contract-helpers";

function Signature() {
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
    POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", //sepolia
    WETH_GATEWAY: "0xDde0E8E6d3653614878Bf5009EDC317BC129fE2F", // weth
  });

  //   async function submitTransaction({
  //     user,
  //     reserve,
  //     amount,
  //     onBehalfOf,
  //   }: {
  //     user: string;
  //     reserve: string;
  //     amount: string;
  //     onBehalfOf: string;
  //   }) {
  //     console.log("Transaction");
  //     try {
  //       const txs: EthereumTransactionTypeExtended[] = await pool.supply({
  //         user,
  //         reserve,
  //         amount,
  //         onBehalfOf,
  //       });

  //       for (const tx of txs) {
  //         const extendedTxData = await tx.tx();
  //         const { from, ...txData } = extendedTxData;
  //         const signer = provider.getSigner(from);
  //         const txResponse = await signer.sendTransaction({
  //           ...txData,
  //           value: txData.value ? BigNumber.from(txData.value) : undefined,
  //         });
  //         console.log(txResponse);
  //       }
  //     } catch (error) {
  //       // Handle errors appropriately
  //       console.error("Error in submitTransaction:", error);
  //     }
  //   }

  async function generateSupplySignatureRequest(
    user: string,
    token: string,
    amount: string
  ): Promise<string> {
    // Assuming `markets` is defined somewhere in your code
    const spender = pool;
    const tokenERC20Service = new ERC20Service(provider);
    const tokenERC2612Service = new ERC20_2612Service(provider);

    const { name } = await tokenERC20Service.getTokenData(token);
    const { chainId } = await provider.getNetwork();
    const nonce = await tokenERC2612Service.getNonce({
      token,
      owner: user,
    });

    const deadline = Math.floor(Date.now() / 1000 + 3600).toString();

    const EIP712DomainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const PermitType = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const data = {
      types: {
        EIP712Domain: EIP712DomainType,
        Permit: PermitType,
      },
      primaryType: "Permit",
      domain: {
        name,
        version: "1",
        chainId,
        verifyingContract: token,
      },
      message: {
        owner: user,
        spender, // Assuming Pool is a placeholder, replace it with the actual value
        value: amount,
        nonce,
        deadline,
      },
    };

    const jsonString = JSON.stringify(data);
    console.log(jsonString);

    console.log(data);
    return JSON.stringify(data);
  }

  return (
    <>
      <button
        onClick={async () => {
          const data = await generateSupplySignatureRequest(
            "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
            "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
            "10"
          );
          console.log(data);
          //   const data = await pool.signERC20Approval({
          //     user: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
          //     reserve: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
          //     amount: "10",
          //     deadline: "3600",
          //   });
          //   console.log(data);
          const signature = await provider.send("eth_signTypedData_v4", [
            "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
            data,
          ]);
          console.log(signature);
        }}
      >
        Transaction
      </button>
    </>
  );
}

export default Signature;
