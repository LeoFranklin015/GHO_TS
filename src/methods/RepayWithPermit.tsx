import {
    EthereumTransactionTypeExtended,
    ERC20Service,
    ERC20_2612Service,

    InterestRate
  } from "@aave/contract-helpers";
  import { BigNumber as BigNumberJs } from "bignumber.js";
  import { BigNumber, ethers, constants } from "ethers";
  import { Pool } from "@aave/contract-helpers";
  
  function RepayWithPermit() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(provider.getTransactionReceipt)

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
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
  
        const data = await generateSupplySignatureRequest(
          user,
          reserve,
          amount,
          deadline
        );
        console.log(data);
  
        const signature: string = await provider.send("eth_signTypedData_v4", [
          "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
          data,
        ]);
        console.log(signature);
  
        const txs: EthereumTransactionTypeExtended[] =
          await pool.repayWithPermit({
            user,
            reserve,
            amount,
            signature,
            onBehalfOf,
            deadline,
            interestRateMode : InterestRate.Variable
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
  
    const valueToWei = (value: string, decimals: number): string => {
      return new BigNumberJs(value).shiftedBy(decimals).toFixed(0);
    };
  
    async function generateSupplySignatureRequest(
      user: string,
      token: string,
      amount: string,
      deadline: string
    ): Promise<string> {
      // Assuming `pool` is an instance of Pool, replace it with your actual instance
      const spender = "0x6ae43d3271ff6888e7fc43fd7321a503ff738951"; // Assuming Pool has a method to get its address
      const tokenERC20Service = new ERC20Service(provider);
      const tokenERC2612Service = new ERC20_2612Service(provider);
  
      const { name, decimals } = await tokenERC20Service.getTokenData(token);
      const { chainId } = await provider.getNetwork();
      const convertedAmount =
        amount === "-1"
          ? constants.MaxUint256.toString()
          : valueToWei(amount, decimals);
      const nonce = await tokenERC2612Service.getNonce({
        token,
        owner: user,
      });
  
      // const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
  
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
          spender: spender,
          value: convertedAmount,
          nonce,
          deadline,
        },
      };
  
      console.log(data);
  
      const jsonString = JSON.stringify(data);
      console.log(jsonString);
  
      return jsonString;
    }

   
    return (
      <>
        <button
          onClick={async () => {
            await submitTransaction({
              user: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334", // user address
              reserve: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // USDC
              amount: "100",
              onBehalfOf: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334", // USEr address
            });

          }}
        >
          Transaction
        </button>
      </>
    );
  }
  
  export default RepayWithPermit;
  