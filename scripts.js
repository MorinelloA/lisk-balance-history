var timestamp;
var address;
var toggle;
var offset = 0;
var blockOffset = 0;
var data = {};

window.onload = function(){
  $("#datetime").val(new Date().toJSON().slice(0,16));
};

function submit(){
  data.received = 0;
  data.sent = 0;
  data.feesPaid = 0;
  data.forged = 0;
  data.feesReceived = 0;

  address = document.getElementById("address").value.trim();
  
  let datetime = document.getElementById("datetime").value;
  timestamp = Date.parse(datetime) / 1000 - 1464109200;
  
  toggle = false;
  if(document.getElementById("block").checked)
  {
    toggle = true;
  }
  document.getElementById("loading").style.display = 'block';

  getReceivedLisk();
}

function getReceivedLisk()
{
  fetch("https://wallet.lisknode.io/api/transactions?toTimestamp=" + timestamp + "&limit=100&offset=" + offset + "&recipientId=" + address)
  .then(res => res.json())
  .then((out) => {
    if(toggle)
    {
      receivedBlockCheck(out);
    }
    else
    {
      for(let i = 0; i < out.data.length; i++)
      {
        data.received += Number(out.data[i].amount);
      }
      if(offset >= out.meta.count)
      {
        offset = 0;
        getSentLisk();
      }
      else
      {
        offset+=100;
        getReceivedLisk();
      }
    }
  }).catch(function(){
    document.getElementById("loading").style.display = 'none';
    document.getElementById("error").style.display = 'block';
  });
}

function receivedBlockCheck(trans)
{
  fetch("https://wallet.lisknode.io/api/blocks?blockId=" + trans.data[blockOffset].blockId)
  .then(res => res.json())
  .then((out2) => {
    if(Number(out2.data[0].timestamp) <= timestamp)
    {
      data.received += Number(trans.data[blockOffset].amount);
    }
    blockOffset++;
    if(Number(trans.data.length) <= blockOffset)
    {
      offset+=100;
      blockOffset = 0;
      if(offset >= trans.meta.count)
      {
        offset = 0;
        getSentLisk();
      }
      else
      {
        getReceivedLisk();
      }
    }
    else
    {
      receivedBlockCheck(trans);
    }
  }).catch(function(){
    document.getElementById("loading").style.display = 'none';
    document.getElementById("error").style.display = 'block';
  });
}

function getSentLisk()
{
  fetch("https://wallet.lisknode.io/api/transactions?toTimestamp=" + timestamp + "&limit=100&offset=" + offset + "&senderId=" + address)
  .then(res => res.json())
  .then((out) => {
    if(toggle)
    {
      sentBlockCheck(out);
    }
    else
    {
      for(let i = 0; i < out.data.length; i++)
      {
        data.sent += Number(out.data[i].amount);
        data.feesPaid += Number(out.data[i].fee);
      }
      if(offset >= out.meta.count)
      {
        offset = 0;
        getForgedLisk();
      }
      else
      {
        offset+=100;
        getSentLisk();
      }
    }
  }).catch(function(){
    document.getElementById("loading").style.display = 'none';
    document.getElementById("error").style.display = 'block';
  });
}

function sentBlockCheck(trans)
{
  fetch("https://wallet.lisknode.io/api/blocks?blockId=" + trans.data[blockOffset].blockId)
  .then(res => res.json())
  .then((out2) => {
    if(Number(out2.data[0].timestamp) <= timestamp)
    {
      data.sent += Number(trans.data[blockOffset].amount);
      data.feesPaid += Number(trans.data[blockOffset].fee);
    }
    blockOffset++;
    if(Number(trans.data.length) <= blockOffset)
    {
      offset+=100;
      blockOffset = 0;
      if(offset >= trans.meta.count)
      {
        offset = 0;
        getForgedLisk();
      }
      else
      {
        getSentLisk();
      }
    }
    else
    {
      sentBlockCheck(trans);
    }
  }).catch(function(){
    document.getElementById("loading").style.display = 'none';
    document.getElementById("error").style.display = 'block';
  });
}

function getForgedLisk()
{
  let unixTimestamp = (timestamp * 1000) + 1464109200000;

  fetch("https://wallet.lisknode.io/api/delegates/" + address + "/forging_statistics?toTimestamp=" + unixTimestamp)
  .then(res => res.json())
  .then((out) => {
    data.forged = out.data.rewards;
    data.feesReceived = out.data.fees;
    showData();
  }).catch(function(){
    data.feesReceived = 0;
    data.forged = 0;
    showData();
  });
}

function showData()
{
  document.getElementById("loading").style.display = 'none';

  data.total = Number(data.received) - Number(data.sent) - Number(data.feesPaid) + Number(data.forged) + Number(data.feesReceived);
  document.getElementById("data").innerHTML = 
    "<label class='col-sm-3 col-form-label'>Received:</label><label class='col-sm-4 col-form-label'>" + Number(data.received / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Sent:</label><label class='col-sm-4 col-form-label'>" + Number(data.sent / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Fees Paid:</label><label class='col-sm-3 col-form-label'>" + Number(data.feesPaid / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Forged Rewards:</label><label class='col-sm-3 col-form-label'>" + Number(data.forged / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Fees Received:</label><label class='col-sm-3 col-form-label'>" + Number(data.feesReceived / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'><b>TOTAL</b>:</label><label class='col-sm-3 col-form-label'>" + Number(data.total / 100000000).toLocaleString() + "</label>";
}
