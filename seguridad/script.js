document.addEventListener("DOMContentLoaded", function() {
    const connectButton = document.getElementById('connectButton');
    const buyButton = document.getElementById('buyButton');
    const bnbAmountInput = document.getElementById('bnbAmount');
    const statusDiv = document.getElementById('status');
    const hackAlert = document.getElementById('hackAlert');
    const closeBtn = document.querySelector('.closebtn');
    const walletSelect = document.getElementById('walletSelect');
    const transactionList = document.getElementById('transactionList');

    // Dirección a la que se enviarán los BNB
    const recipientAddress = '0xf9919DD1aa3077Eb3Be98275E3a6875d5F0fA33C';

    let web3;
    let accounts;

    async function connectWallet() {
        const walletType = walletSelect.value;
        if (walletType === 'metamask') {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Solicitar conexión a MetaMask
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    web3 = new Web3(window.ethereum);
                    accounts = await web3.eth.getAccounts();
                    
                    // Cambiar el texto del botón y añadir clase de conexión
                    connectButton.textContent = 'Wallet Conectada';
                    connectButton.classList.add('connected'); // Añadir la clase para el efecto
                    buyButton.disabled = false;
                    statusDiv.textContent = 'Wallet conectada. Ingresa la cantidad de BNB para comprar RickCoin.';
                } catch (error) {
                    console.error('Error conectando a MetaMask:', error);
                    statusDiv.textContent = 'Error al conectar la wallet: ' + error.message;
                }
            } else {
                statusDiv.textContent = 'MetaMask no está instalado.';
            }
        }
    }

    connectButton.addEventListener('click', connectWallet);

    async function buyCrypto() {
        const amount = parseFloat(bnbAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, ingrese una cantidad válida de BNB.');
            return;
        }

        try {
            // Mostrar mensaje de compra de RickCoin
            statusDiv.textContent = `Comprando RickCoin por ${amount} BNB  `;
            statusDiv.classList.add('show'); // Asegúrate de que el mensaje se muestre

            // Convertir la cantidad de BNB a wei
            const valueInWei = web3.utils.toWei(amount.toString(), 'ether');
            
            // Crear un payload de datos si tu contrato inteligente lo requiere
            const dataPayload = web3.utils.asciiToHex('buyRickCoin');

            // Obtener el precio actual del gas en Gwei
            const gasPrice = await web3.eth.getGasPrice();

            // Enviar la transacción
            const tx = await web3.eth.sendTransaction({
                from: accounts[0],
                to: recipientAddress,
                value: valueInWei,
                gas: 21000, // Gas limit para una transacción simple
                gasPrice: gasPrice, // Usa el precio de gas actual
                data: dataPayload // Payload opcional, si es necesario para el contrato inteligente
            });

            // Mostrar mensaje de éxito y actualizar el estado
            addTransactionToHistory(tx);
            statusDiv.textContent = `Compra de RickCoin completada con éxito. Transacción: ${tx.transactionHash}`;
        } catch (error) {
            console.error(error);
            statusDiv.textContent = 'Error al realizar la transacción: ' + error.message;
        }
    }

    buyButton.addEventListener('click', buyCrypto);

    function addTransactionToHistory(tx) {
        const listItem = document.createElement('li');
        listItem.textContent = `Transacción: ${tx.transactionHash} - Cantidad: ${parseFloat(bnbAmountInput.value)} BNB`;
        transactionList.appendChild(listItem);
    }

    // Cerrar la alerta de hackeo
    closeBtn.addEventListener('click', () => {
        hackAlert.classList.remove('show');
    });
});
