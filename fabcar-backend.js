const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const Fabric_Client = require('fabric-client');
const path = require('path');
const util = require('util');
const os = require('os');

// Fabric stuff
// setup the fabric network
const fabric_client = new Fabric_Client();
const channel = fabric_client.newChannel('mychannel');
const peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
const order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);
const store_path = path.join(__dirname, 'hfc-key-store');

// Express stuff
const port = 4001
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

// This method checks if the given car exists and executes callback depending on success / failure
async function carExists(carID, success, failure){
    channel.queryByChaincode({
            chaincodeId: 'fabcar',
            fcn: 'queryCar',
            args: [carID]
    }).then( query_responses => {
        if (query_responses && query_responses.length == 1) {
            if (query_responses[0] instanceof Error) {
                failure()
            } else if (query_responses.toString().length > 0) {
                success()
            } else {
                failure()
            }
        } else {
            failure()
        }   
    });
}

// This method queries the peer to retrieve the information as defined in the request argument
async function query(request, socket){
    // sends a proposal to one or more endorsing peers that will be handled by the chaincode
    query_responses = await channel.queryByChaincode(request);
    socket.emit('RESPONSE', {type: 'FEED', payload: "Sending query to peers" });
    if (query_responses && query_responses.length == 1) {
        if (query_responses[0] instanceof Error) {
            resp = "error from query = ", query_responses[0];
            console.error("error from query = ", query_responses[0]);
            socket.emit('RESPONSE' , {type: 'ERROR' , payload: resp});
        } else {
            data =  JSON.parse(query_responses[0]);
            socket.emit('RESPONSE', {type: 'END', payload: "Data retrieved" });
            if (!data.length) {
                 // additional data for response for query single
                data = [{Key: request.args[0], 'Record': data}]  
            } 
            console.log(`query completed, data: ${data}`)
            socket.emit('RESPONSE', {type: 'INFO', payload: data });
        }
    } else {
        // If no payloads returned
        console.log("No payloads were returned from query");
        socket.emit('RESPONSE', {type: 'ERROR', payload: "No payloads were returned from query" });
    }    
}

// This method invoke chaincode on the peer using the data specified in the request argument
async function invoke(request, socket){
    let tx_id = null;
    const args = {...request.args}

    // get a transaction id object based on the current user assigned to fabric client
    tx_id = fabric_client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    socket.emit('RESPONSE',{type: 'FEED' , payload: `Assigning transaction_id: ${tx_id._transaction_id}`})

    // add tx id to request
    var request = {
        ...request,
        txId: tx_id
    };
    socket.emit('RESPONSE',{type: 'FEED' , payload: `Creating request to be sent`})

    // send the transaction proposal to the peers
    const results = await channel.sendTransactionProposal(request);
    socket.emit('RESPONSE',{type: 'FEED' , payload: `Sending transaction proposal to peers`})

    const proposalResponses = results[0];
    const proposal = results[1];
    let isProposalGood = false;

    if (proposalResponses && proposalResponses[0].response &&
        proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            socket.emit('RESPONSE',{type: 'FEED' , payload: `Transaction proposal was good`})
            console.log('Transaction proposal was good');
        } else {
            socket.emit('RESPONSE',{type: 'ERROR' , payload: `Transaction proposal was bad`})
            console.error('Transaction proposal was bad');
        }
    if (isProposalGood) {
        const msg = (util.format(
            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
            proposalResponses[0].response.status, proposalResponses[0].response.message));

        socket.emit('RESPONSE',{type: 'FEED' , payload: msg})
        console.error(msg);

        // build up the request for the orderer to have the transaction committed
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Building up request for orderer to have the transaction committed`})
        var request = {
            proposalResponses: proposalResponses,
            proposal: proposal
        };

        // set the transaction listener and set a timeout of 30 sec
        // if the transaction did not get committed within the timeout period,
        // report a TIMEOUT status
        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
        var promises = [];

        var sendPromise = channel.sendTransaction(request);
        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Sending transaction`})

        // get an eventhub once the fabric client has a user assigned. The user
        // is required bacause the event registration must be signed
        //socket.emit('transferResponse',{type: 'feed' , payload: 'Setting up event hub'})
        let event_hub = fabric_client.newEventHub();
        event_hub.setPeerAddr('grpc://localhost:7053');
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Setting up event hub`})

        // using resolve the promise so that result status may be processed
        // under the then clause rather than having the catch clause process
        // the status
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Creating new transaction promise`})
        let txPromise = new Promise((resolve, reject) => {
            let handle = setTimeout(() => {
                event_hub.disconnect();
                resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
            }, 3000);
            socket.emit('RESPONSE',{type: 'FEED' , payload: `Connecting to event hub`})
            event_hub.connect();
            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                // this is the callback for transaction event status
                // first some clean up of event listener
                clearTimeout(handle);
                event_hub.unregisterTxEvent(transaction_id_string);
                event_hub.disconnect();

                // now let the application know what happened
                var return_status = {event_status : code, tx_id : transaction_id_string};
                socket.emit('RESPONSE',{type: 'FEED' , payload: `TRANSACTION IS ${tx}`})
                console.log("TRANSACTION IS" ,tx);
                if (code !== 'VALID') {
                    console.error('The transaction was invalid, code = ' + code);
                    socket.emit('RESPONSE',{type: 'ERROR' , payload: `The transaction was invalid, code = ${code}`})
                    resolve(return_status); 
                } else {
                    console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
                    socket.emit('RESPONSE',{type: 'FEED' , payload: `The transaction has been committed on peer ${event_hub._ep._endpoint.addr}`})
                    resolve(return_status);
                }
            }, (err) => {
                //this is the callback if something goes wrong with the event registration or processing
                reject(new Error('There was a problem with the eventhub ::'+err));
            });
        });

        promises.push(txPromise);

    } else {
        socket.emit('RESPONSE',{type: 'ERROR' , payload: `Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...`})
        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
    }

    Promise.all(promises).then((results) => {
        console.log('Send transaction promise and event listener promise have completed');
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Send transaction promise and event listener promise have completed`})

        // check the results in the order the promises were added to the promise all list
        socket.emit('RESPONSE',{type: 'FEED' , payload: `Checking results`})
        if (results && results[0] && results[0].status === 'SUCCESS') {
            console.log('Successfully sent transaction to the orderer.');
            socket.emit('RESPONSE',{type: 'FEED' , payload: `Successfully sent transaction to the orderer`})
        } else {
            console.error('Failed to order the transaction. Error code: ' + response.status);
            socket.emit('RESPONSE',{type: 'ERROR' , payload: `Failed to order the transaction. Error code: ${cresponse.statusode}`})
        }

        if(results && results[1] && results[1].event_status === 'VALID') {
            console.log('Successfully committed the change to the ledger by the peer');
            socket.emit('RESPONSE',{type: 'END' , payload: `Successfully committed the change to the ledger by the peer`})
            if (Object.keys(args).length === 2) {
                socket.emit('RESPONSE',{type: 'INFO' , payload:[{Key:`${args[0]} successfully transferred to ${args[1]}!` ,Msg:'Successfully committed transfer to the ledger'}] })
            } else {
                socket.emit('RESPONSE',{type: 'INFO' , payload:[{Key:`Successfully created ${args[0]}!` ,Msg:'Successfully committed transfer to the ledger'}] })
            }
        } else {
            console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
            socket.emit('RESPONSE',{type: 'ERROR' , payload: `Transaction failed to be committed to the ledger due to :: ${results[1].event_status}`})
        }
    }).catch((err) => {
        console.error('Failed to invoke successfully :: ' + err);
        socket.emit('RESPONSE',{type: 'ERROR' , payload: `Failed to invoke successfully :: ${err}`})
    });
}

// This method takes in the the socket (to respond to client) and the name of the user to be enrolled. It returns the user if successful
// Default user is 'user1' as there are no other users enrolled.
async function getUser(socket, user) {

    // obtains an instance of the KeyValueStore class
    const state_store = await Fabric_Client.newDefaultKeyValueStore({ path: store_path})
    socket.emit('RESPONSE' , {type: 'FEED' , payload: "Getting key-value store from local server storage"});

    // assign the store to the fabric client
    fabric_client.setStateStore(state_store);
    socket.emit('RESPONSE' , {type: 'FEED' , payload: "Assigning store to the fabric client"});

    // This is a factory method. It returns a new instance of the CryptoSuite API implementation
    const crypto_suite = Fabric_Client.newCryptoSuite();
    socket.emit('RESPONSE' , {type: 'FEED' , payload: "Creating new crypto suite"});

    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    const crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    socket.emit('RESPONSE' , {type: 'FEED' , payload: "Setting up crypto suite"});

    // get the enrolled user from persistence, this user will sign all requests
    const user_from_store = await fabric_client.getUserContext(user, true);
    if (user_from_store && user_from_store.isEnrolled()) {
        
        console.log(`Successfully loaded ${user} from persistence`);
        socket.emit('RESPONSE', {type: 'END',  payload: `Successfully loaded ${user} from persistence` });

        const eh = channel.newChannelEventHub(peer)
        eh.connect()
        eh.registerBlockEvent(
            (block) => {
                console.log(`Lastest block number: ${block.number}`)
                socket.emit('BLOCKUDPATE', block);
                eh.unregisterBlockEvent(block.number)
                }, (err) => {console.log('Block updater error',err);} 
        );  
        
        return user_from_store;

    } else {
        socket.emit('RESPONSE', {type: 'ERROR',  payload: `Failed to get ${user}.... run registerUser.js` });
        throw new Error(`Failed to get ${user}.... run registerUser.js`);
    }
}

io.on('connection', socket => {

    console.log(`Connected to client with socket ID ${socket.id}`)
    socket.emit('RESPONSE', {type: 'FEED',  payload: `Connected to server with socket ID ${socket.id}` });

    // enroll user when client connects, default user is user1
    let user = getUser(socket, 'user1');    

    socket.on('REQUEST', (req) => {
        switch (req.action)
        {
            case "QUERY":
                socket.emit('RESPONSE', {type: 'START', payload: `Request for QUERY for ${req.data.ID} received` });
                carExists(req.data.ID, 
                            () =>  {query({
                                    chaincodeId: 'fabcar',
                                    fcn: 'queryCar',
                                    args: [req.data.ID]
                                    }
                                , socket)},
                            () => {
                                socket.emit('RESPONSE', {type: 'ERROR', payload: `${req.data.ID} DOES NOT EXIST!` });
                            });        
                break;

            case "QUERYALL":
                socket.emit('RESPONSE', {type: 'START', payload: `Request for QUERY All received` });
                query(
                        {
                            chaincodeId: 'fabcar',
                            fcn: 'queryAllCars',
                            args: []
                        }
                    , socket);
                    break;
            case "TRANSFER":
                socket.emit('RESPONSE', {type: 'START', payload: `Request for TRANSFER for ${req.data.ID} to ${req.data.newOwner} received` });
                carExists(req.data.ID, 
                            () => {invoke(
                                {
                                    chaincodeId: 'fabcar',
                                    fcn: 'changeCarOwner',
                                    args: [req.data.ID , req.data.newOwner],
                                    chainId: 'mychannel'
                                }
                            , socket)},
                            () => {
                                socket.emit('RESPONSE', {type: 'ERROR', payload: `${req.data.ID} DOES NOT EXIST!` });
                            });
                    break;
            case "CREATE":
                socket.emit('RESPONSE', {type: 'START', payload: `Request for CREATE for ${req.data.ID} received` });
                carExists(req.data.ID, 
                    () => {
                        socket.emit('RESPONSE', {type: 'ERROR', payload: `${req.data.ID} ALREADY EXISTS!` });
                    },
                    () => {invoke(
                        {
                            chaincodeId: 'fabcar',
                            fcn: 'createCar',
                            args: [req.data.ID, req.data.make, req.data.model, req.data.color, req.data.owner],
                            chainId: 'mychannel',
                        }
                    , socket)});
                    break;
        }
    })

    socket.on('disconnect', () => {
        console.log(`Disconnected to client ${socket.id}`)
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`))