import { abi } from "./abi";
import Caver from "caver-js";

const caver = new Caver("https://api.baobab.klaytn.net:8651/");
const cav = new Caver(klaytn);

// quiz functionality
const correctAnswers = ["B", "B", "A", "A", "C"];
const showResult = document.querySelector(".showResults");
const form = document.querySelector(".mainForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let score = 0;
  const userAnswers = [
    form.q1.value,
    form.q2.value,
    form.q3.value,
    form.q4.value,
    form.q5.value,
  ];
  userAnswers.forEach((eachAnswer, index) => {
    if (eachAnswer === correctAnswers[index]) {
      score += 20;
    }
  });

  if (score >= 50) {
    scrollTo(0, 0);
    showResult.innerHTML = `
        <div class="result">
        <p>You scored <span>40%</span>. Excellent! You are somewhat a Klaytn Guru. You can now mint your POK_NFT</p>
        </div>
        
        <div class="searchElement">
        <input type="text" name="addr" id="addr" placeholder="Input address...">
        <button id="searchBtn" class="mintBtn">
        Mint
        </button>
        </div>
        `;
    showResult.classList.add("show");

    let output = 0;
    const timer = setInterval(() => {
      const resultSpan = document.querySelector(".showResults .result p span");
      resultSpan.textContent = `${output}%`;
      if (output === score) {
        clearInterval(timer);
      } else {
        output++;
      }
    }, 30);

    const mintBtn = document.querySelector(".mintBtn");
    const URI =
      "https://bafybeidnr2spdfjjmyxuqzvfi3v2ik4u23f7h2ct43iwghrro323xaomja.ipfs.nftstorage.link/metadata/1";
    mintBtn.addEventListener("click", async (e) => {
      const addr = document.querySelector("#addr");
      mintTo(addr.value, URI);
    });


  } else {
    scrollTo(0, 0);
    showResult.classList.add("show");
    showResult.innerHTML = `
        <div class="result">
        <p>You scored <span>40%</span>. Do try again later by reading this  <a href="https://oxpampam.hashnode.dev/building-with-klaytn-what-is-klaytn-and-how-to-get-started-as-a-developer">piece</a>. You can then come back to answer correctly and mint your POK_NFT</p>
        </div>
        `;

    let output = 0;
    const timer = setInterval(() => {
      const resultSpan = document.querySelector(".showResults .result p span");
      resultSpan.textContent = `${output}%`;
      if (output === score) {
        clearInterval(timer);
      } else {
        output++;
      }
    }, 30);
  }
});

// mint POK Nft from Nft contract

const mintTo = async (addr, uri) => {
  if (!initialized) {
    await init();
  }

  const recAddr = caver.utils.isAddress(addr);

  if (recAddr != true) {
    alert("Invalid Address");
    return;
  }

  nftContract
    .send(
      { from: selectedAccount, gas: 1500000, value: "5000000000000000000" },
      "mintNftTo",
      addr,
      uri
    )
    .then(async (result) => {
      const balance = await cav.klay.getBalance(addr);
      const formattedBal = formatValue(balance);
      balDisp.style.display = "block";
      balDisp.innerHTML = `${formattedBal.toFixed(2)} <span>KLAY</span>`;
      displayMessage("00", `Yay! you just successfully minted your POK NFT. Navigate to opensea to visualize your NFT`);

      setTimeout(() => {
        notification.style.display = "none";
      }, 5000);
    })
    .catch((err) => {
      displayMessage("01", `Transaction reverted, see console for details`);

      setTimeout(() => {
        notification.style.display = "none";
      }, 5000);
      console.log(err);
    });
};

/**
 =====================================----------
 =====================================----------
                                    CONNECTING TO KLATYN
                                    ====================================
                                    ====================================
**/
const balDisp = document.querySelector(".balDisp");

// set userInfo (addrress and native token bal)
function setUserInfo(account, balance) {
  connectBtn.innerText = addressShortener(account);
  balDisp.style.display = "block";
  balDisp.innerHTML = `${balance} <span>KLAY</span>`;
  document.querySelector("#addr").value = account;
}

// connect button
const connectBtn = document.querySelector(".connect button");
connectBtn.addEventListener("click", (e) => {
  init();
});

// helper function for address shortener;
function addressShortener(addr) {
  return (
    addr.slice(0, 4) + "..." + addr.slice(addr.length - 5, addr.length - 1)
  );
}

// helper function for formatting value to KLAY
function formatValue(value) {
  return value / Math.pow(10, 18);
}

// display transaction  on success / revert
const notification = document.querySelector(".notification");
const notificationContent = document.querySelector(".notification .notContent");

function displayMessage(messageType, message) {
  const messages = {
    "00": `
                <p class="successMessage">${message}</p>
           `,
    "01": `
                 <p class="errorMessage">${message}</p>
        `,
  };
  notification.style.display = "block";
  notificationContent.innerHTML += messages[messageType];
}

let selectedAccount;
let initialized = false;
let nftContract;
const nftContractAddr = "0x5f2B1D5ac8431e3390b6e2e195530BA4D3a2B4fd";

const init = async () => {
  if (window.klatyn !== "undefined") {
    // kaikas is available;
    if (window.klaytn.networkVersion == "8217")
      return console.log("Change to BaoBab");
    const accounts = await klaytn.enable();
    const account = accounts[0];
    selectedAccount = accounts[0];
    const balance = await cav.klay.getBalance(account);
    setUserInfo(
      account,
      Number(caver.utils.fromPeb(balance, "KLAY")).toFixed(2)
    );
    klaytn.on("accountsChanged", async (accounts) => {
      setUserInfo(
        accounts[0],
        Number(
          caver.utils.fromPeb(await cav.klay.getBalance(accounts[0]), "KLAY")
        ).toFixed(2)
      );
      selectedAccount = accounts[0];
    });
  }

  nftContract = new cav.klay.Contract(abi, nftContractAddr);
  initialized = true;
};

/**
 =====================================----------
 =====================================----------
                                    END OF CONNECTING TO KLATYN
                                    ====================================
                                    ====================================
**/
