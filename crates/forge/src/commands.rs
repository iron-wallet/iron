use ethers::{abi::Abi, providers::Middleware};
use iron_networks::Networks;
use iron_types::{Address, GlobalState};

use super::{Error, Result};
use crate::global::FORGE;

/// Gets the ABI, if known, for a given address and chain_id
#[tauri::command]
pub async fn forge_get_abi(address: Address, chain_id: u32) -> Result<Option<Abi>> {
    let code = {
        let networks = Networks::read().await;
        let network = networks
            .get_network(chain_id)
            .ok_or(Error::InvalidChainId)?;
        let provider = network.get_provider();
        let ethers_addr = ethers::types::Address::from_slice(address.as_slice());
        provider.get_code(ethers_addr, None).await?
    };

    if code.len() == 0 {
        return Ok(None);
    }

    let forge = FORGE.read().await;

    match forge.get_abi_for(code) {
        None => Ok(None),
        Some(abi) => Ok(Some(serde_json::from_value(abi.abi)?)),
    }
}

#[tauri::command]
pub async fn forge_get_name(address: Address, chain_id: u32) -> Result<Option<String>> {
    let code = {
        let networks = Networks::read().await;
        let network = networks
            .get_network(chain_id)
            .ok_or(Error::InvalidChainId)?;
        let provider = network.get_provider();
        let ethers_addr = ethers::types::Address::from_slice(address.as_slice());
        provider.get_code(ethers_addr, None).await?
    };

    if code.len() == 0 {
        return Ok(None);
    }

    let forge = FORGE.read().await;

    match forge.get_abi_for(code) {
        None => Ok(None),
        Some(abi) => Ok(Some(abi.name)),
    }
}
