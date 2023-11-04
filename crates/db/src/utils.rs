use ethers::{
    abi::Abi,
    prelude::{errors::EtherscanError, Client},
    types::Chain,
};
use iron_settings::Settings;
use iron_types::{Address, GlobalState};

use crate::Result;

pub async fn fetch_etherscan_contract_name(
    chain: Chain,
    address: Address,
) -> Result<Option<String>> {
    let api_key = Settings::read().await.get_etherscan_api_key()?;

    let client = Client::new(chain, api_key)?;

    let ethers_addr = ethers::types::Address::from_slice(address.as_slice());
    match client.contract_source_code(ethers_addr).await {
        Ok(metadata) => Ok(Some(metadata.items[0].contract_name.clone())),
        Err(EtherscanError::ContractCodeNotVerified(_)) => Ok(None),
        Err(err) => Err(err.into()),
    }
}

pub async fn fetch_etherscan_abi(chain: Chain, address: Address) -> Result<Option<Abi>> {
    let api_key = Settings::read().await.get_etherscan_api_key()?;

    let client = Client::new(chain, api_key)?;

    let ethers_addr = ethers::types::Address::from_slice(address.as_slice());
    match client.contract_abi(ethers_addr).await {
        Ok(abi) => Ok(Some(abi)),
        Err(EtherscanError::ContractCodeNotVerified(_)) => Ok(None),
        Err(err) => Err(err.into()),
    }
}
