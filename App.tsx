import { Pressable, Text, StyleSheet, View } from 'react-native';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import { useState } from 'react';
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
import { ethers  } from 'ethers'
import { ChainId } from "@biconomy/core-types"


const projectId = '';

const providerMetadata = {
  name: 'RN Starter',
  description: 'Biconomy + Wallet Connect RN Starter',
  url: 'https://your-project-website.com/',
  icons: ['https://your-project-logo.com/'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com'
  }
};

function App() {
  const [scwAddress, setScwAddress] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
const bundler: IBundler = new Bundler({
  bundlerUrl: "<from biconomy dashboard>",
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
})

  const { open, isConnected, address, provider } = useWalletConnectModal();
  const handleButtonPress = async () => {
    if (isConnected) {
      console.log("yay connections")
      return provider?.disconnect();
    }
    return open();
  };
  const connectSmartAccount = async () => {
    if (!provider) return
    try {
      setLoading(true)
      const web3Provider = new ethers.providers.Web3Provider(
        provider,
        "any"
      );
      const module = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
      })
      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler, 
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: module,
        activeValidationModule: module
      })
      setScwAddress( await biconomySmartAccount.getAccountAddress())
      setSmartAccount(biconomySmartAccount)
      setLoading(false)
    } catch (error) {
      console.error(error);
    }
  }
  console.log({ scwAddress, smartAccount })
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>RN Wallet Connect + Biconomy SDK</Text>
      <Text>{isConnected ? address : "Status: Not Connected"}</Text>
      <Pressable onPress={handleButtonPress} style={styles.pressableMargin}>
        <Text style={styles.texts}>{isConnected ? "Disconnect" : "Connect"}</Text>
      </Pressable>
      {isConnected && 
      <Pressable onPress={connectSmartAccount} style={styles.pressableMargin}>
        <Text style={styles.texts}>Create Smart Account</Text>
      </Pressable> 
      }
      {loading && <Text>Loading smart account...</Text>}
      <Text>{scwAddress}</Text>
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  pressableMargin: {
    marginTop: 16,
    backgroundColor: "blue",
  },
  texts : {
    color: "white"
  }
});

export default App