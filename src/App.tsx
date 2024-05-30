import React, { useEffect, useRef, useState } from 'react';

import { DAppPeerConnect } from '@fabianbormann/cardano-peer-connect';
import {
  IDAppInfos,
  IWalletInfo,
} from '@fabianbormann/cardano-peer-connect/src/types';

import {
  ConnectWalletButton,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';

const App = () => {
  const copyButton = useRef<HTMLDivElement | null>(null);
  const shutdownButton = useRef<HTMLDivElement | null>(null);
  const txSubmitInput = useRef<HTMLInputElement | null>(null);
  const txSignInput = useRef<HTMLInputElement | null>(null);
  const qrCodeField = useRef<HTMLDivElement | null>(null);
  const dAppConnect = useRef<DAppPeerConnect | null>(null);
  const [meerkatAddress, setMeerkatAddress] = useState('');
  const clientConnected = useRef<boolean>(false);
  const clientAddress = useRef<string | null>(null);
  const identicon = useRef<string | null>(null);
  const connectedWallet = useRef<IWalletInfo | null>(null);
  const apiInjected = useRef<boolean>(false);
  const [supportedWallets, setSupportedWallets] = useState([
    'nami',
    'flint',
    'eternl',
    'eternl-p2p',
  ]);
  const sendButton = useRef<HTMLDivElement | null>(null);
  const signButton = useRef<HTMLDivElement | null>(null);
  const signStringButton = useRef<HTMLDivElement | null>(null);
  const signJSONButton = useRef<HTMLDivElement | null>(null);
  const [dAppIdentifier, setDAppIdentifier] = useState('');
  const cardano = useCardano();

  //You can change the identifier here
  const usingIdentifier = "EFbf_TWsNCIgqdEZq4c_wpzt7joF3BJzT06u8pIK9yx0";

  useEffect(() => {
    window.addEventListener('beforeunload', (event: any) => {
      if (dAppConnect.current) {
        dAppConnect.current?.shutdownServer();
      }
    });

    if (dAppConnect.current === null) {
      const verifyConnection = (
        walletInfo: IWalletInfo,
        callback: (granted: boolean, autoconnect: boolean) => void
      ) => {
        if (walletInfo.requestAutoconnect) {
          const accessAndAutoConnect = window.confirm(
            `Do you want to automatically connect to wallet ${walletInfo.name} (${walletInfo.address})?`
          );

          callback(accessAndAutoConnect, accessAndAutoConnect);

          // callback(true, true)//ToDo: do not assume but save decision in local db
        } else {
          callback(
            window.confirm(
              `Do you want to connect to wallet ${walletInfo.name} (${walletInfo.address})?`
            ),
            true
          );
        }
        connectedWallet.current = walletInfo;
      };

      const onApiInject = (name: string, address: string) => {
        setSupportedWallets([...supportedWallets, name]);
        cardano.connect(name);

        apiInjected.current = true;
      };

      const onApiEject = (name: string, address: string) => {
        cardano.disconnect();
        setSupportedWallets(
          supportedWallets.filter((supportedWallet) => supportedWallet !== name)
        );
        apiInjected.current = false;
      };

      const dAppInfo: Omit<IDAppInfos, 'address'> = {
        name: 'Test Dapp 1',
        url: 'http://localhost:3001/',
      };

      dAppConnect.current = new DAppPeerConnect({
        dAppInfo: dAppInfo,
        announce: [
          'wss://tracker.openwebtorrent.com',
          'wss://dev.tracker.cf-identity-wallet.metadata.dev.cf-deployments.org',
          'wss://tracker.files.fm:7073/announce',
          'ws://tracker.files.fm:7072/announce',
          'wss://tracker.openwebtorrent.com:443/announce',
        ],
        onApiInject: onApiInject,
        onApiEject: onApiEject,
        onConnect: (address: string, walletInfo?: IWalletInfo) => {
          console.log({ address, walletInfo })
          clientConnected.current = true;
          clientAddress.current = address;

          identicon.current = dAppConnect.current?.getIdenticon() ?? null;

          if (walletInfo) {
            connectedWallet.current = walletInfo;
          }
        },
        onDisconnect: () => {
          clientConnected.current = false;
          clientAddress.current = null;

          identicon.current = null;
        },
        verifyConnection: verifyConnection,
        useWalletDiscovery: true,
      });
      const connectedWalletInstance = dAppConnect.current.getConnectedWallet();
      console.log({ connectedWallet, connectedWalletInstance })
      dAppConnect.current.shutdownServer();

      setMeerkatAddress(dAppConnect.current.getAddress());

      if (qrCodeField.current !== null) {
        console.log(qrCodeField.current)
        dAppConnect.current.generateQRCode(qrCodeField.current);
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: 64,
          color: 'white',
          backgroundColor: '#3BA5A5',
          padding: '0 16px 0 16px',
        }}
      >
        <h3>Example dApp connecting</h3>
        <div style={{ flexGrow: 1 }} />
        {/*<ConnectWalletButton
          peerConnectEnabled={true}
          supportedWallets={supportedWallets}
          onConnectError={(walletname: string, error: Error) => {
            console.log(walletname, error);
          }}
          borderRadius={6}
          primaryColor="#297373"
        />*/}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'calc(100vh - 64px - 32px)',
          backgroundColor: '#f5f5f5',
          padding: 16,
        }}
      >
        <h3>
          Please scan the QR code or share the address below with your wallet
          app.
        </h3>
        <div
          style={{ marginTop: 16, marginBottom: 16 }}
          ref={qrCodeField}
        ></div>

        <span>For method results check the console.</span>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 16,
            width: '70%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'lightblue',
              width: '100%',
              clear: 'both',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <div>
                <span
                  style={{ paddingLeft: '4px', textDecoration: 'underline' }}
                >
                  {meerkatAddress}
                </span>
              </div>

              <div
                ref={copyButton}
                style={{
                  textAlign: 'right',
                  padding: 10,
                  marginTop: 12,
                  backgroundColor: '#39393A',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  navigator.clipboard.writeText(meerkatAddress).then(() => {
                    if (copyButton.current) {
                      copyButton.current.innerText = 'Successfully copied!';
                      setTimeout(() => {
                        if (copyButton.current) {
                          copyButton.current.innerText = 'Copy';
                        }
                      }, 500);
                    }
                  });
                }}
              >
                Copy
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div
                ref={shutdownButton}
                style={{
                  padding: 10,
                  marginTop: 12,
                  backgroundColor: '#39393A',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (dAppConnect.current) {
                    clientAddress.current = null;
                    clientConnected.current = false;

                    dAppConnect.current?.shutdownServer();
                  }
                }}
              >
                Shutdown Server
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 16,
                width: '70%',
              }}
            >
              Connected:{' '}
              {clientConnected.current
                ? 'yes ' + `( ${clientAddress.current} )`
                : 'no'}
            </div>

            {clientConnected.current && connectedWallet.current && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 16,
                  width: '70%',
                }}
              >
                Wallet name:{' '}
                {`${connectedWallet.current?.name} (version: ${connectedWallet.current?.version} )`}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 16,
                width: '70%',
              }}
            >
              API injected: {apiInjected.current ? 'yes ' : 'no'}
            </div>

            {identicon.current && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 16,
                  width: '70%',
                }}
              >
                <img src={identicon.current} />
              </div>
            )}
          </div>

          <div style={{
              display: "block",
              alignItems: "center"
            }}>
          <div
              ref={signStringButton}
              style={{
                padding: 10,
                marginTop: 12,
                backgroundColor: '#39393A',
                color: 'white',
                cursor: 'pointer',
              }}
              onClick={async () => {
                // @ts-ignore
                if (window.cardano !== undefined) {
                  // @ts-ignore
                  const api = window.cardano[connectedWallet.current?.name];

                  if (api) {
                    const enabledApi = await api.enable();
                    // string message
                    const message = "hello";
                    const result = await enabledApi.experimental.sign(usingIdentifier, message);
                    console.log({ result })
                  } else {
                    console.log('No wallet api is given');
                  }
                } else {
                  console.log('No wallet p2p api found.');
                }
              }}
            >
              Sign string
            </div>
          </div>
          <div style={{
              display: "block",
              alignItems: "center"
            }}>
          <div
              ref={signJSONButton}
              style={{
                padding: 10,
                marginTop: 12,
                backgroundColor: '#39393A',
                color: 'white',
                cursor: 'pointer',
              }}
              onClick={async () => {
                // @ts-ignore
                if (window.cardano !== undefined) {
                  // @ts-ignore
                  const api = window.cardano[connectedWallet.current?.name];

                  if (api) {
                    const enabledApi = await api.enable();
                    // object message
                    const message = JSON.stringify({
                      action: "CAST_VOTE",
                      actionText: "Cast Vote",
                      data: {
                        id: "2658fb7d-cd12-48c3-bc95-23e73616b79f",
                        address: "stake_test1uzpq2pktpnj54e64kfgjkm8nrptdwfj7s7fvhp40e98qsusd9z7ek",
                        event: "CF_TEST_EVENT_01",
                        category: "CHANGE_SOMETHING",
                        proposal: "YES",
                        network: "PREPROD",
                        votedAt: "40262406",
                        votingPower: "10444555666",
                      },
                      slot: "40262407",
                      uri: "https://evoting.cardano.org/voltaire",
                      ownerUrl: "https://voting.summit.cardano.org",
                      eventName: "Cardano Summit Voting Awards",
                    });
                    const result = await enabledApi.experimental.sign(usingIdentifier, message);
                    console.log({ result })
                  } else {
                    console.log('No wallet api is given');
                  }
                } else {
                  console.log('No wallet p2p api found.');
                }
              }}
            >
              Sign JSON
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              width: '100%',
            }}
          >
            <input
              ref={txSubmitInput}
              placeholder="signed tx cbor"
              width="100%"
              style={{
                width: '100%',
              }}
              type="text"
            />

            <div
              ref={sendButton}
              style={{
                padding: 10,
                marginTop: 12,
                backgroundColor: '#39393A',
                color: 'white',
                cursor: 'pointer',
                width: '220px',
              }}
              onClick={async () => {
                // @ts-ignore
                if (window.cardano !== undefined) {
                  // @ts-ignore
                  const api = window.cardano[connectedWallet.current?.name];

                  if (api) {
                    (await api.enable()).submitTx(txSubmitInput.current?.value);
                  } else {
                    console.log('No wallet api is given');
                  }
                } else {
                  console.log('No wallet p2p api found.');
                }
              }}
            >
              Submit signed TX
            </div>

            <hr />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              width: '100%',
            }}
          >
            <input
              ref={txSignInput}
              placeholder="unsigend tx cbor"
              style={{
                width: '100%',
              }}
              type="text"
            />
            <div
              ref={signButton}
              style={{
                padding: 10,
                marginTop: 12,
                backgroundColor: '#39393A',
                color: 'white',
                cursor: 'pointer',
                width: '220px',
              }}
              onClick={async () => {
                console.log('input', txSignInput.current?.value);

                // @ts-ignore
                if (window.cardano !== undefined) {
                  // @ts-ignore
                  const api = window.cardano[connectedWallet.current?.name];

                  if (api) {
                    console.log('api is', api);

                    const func = await api.enable();

                    console.log('funcs are', func);

                    console.log('sign tx', txSignInput.current?.value);

                    const res = await func.signTx(
                      txSignInput.current?.value,
                      false,
                      'abc'
                    );

                    console.log('res for sign', res);
                  } else {
                    console.log('No wallet API is given');
                  }
                } else {
                  console.log('No wallet api found.');
                }
              }}
            >
              Sign TX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
