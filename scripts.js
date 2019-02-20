window.onload = function(){
  $("#datetime").val(new Date().toJSON().slice(0,16));
};

function submit(){
  let addr = document.getElementById("address").value.trim();
  
  let datetime = document.getElementById("datetime").value;
  let liskdatetime = Date.parse(datetime) / 1000 - 1464109200;
  
  let timestampToggle = "false";
  if(document.getElementById("block").checked)
  {
    timestampToggle = "true";
  }
  
  let url = "http://api.lisk.support/v1/addresshistory?address=" + addr + "&timestamp=" + liskdatetime + "&timeByBlock=" + timestampToggle;
  
  fetch(url)
  .then(res => res.json())
  .then((out) => {
    document.getElementById("data").innerHTML = 
    "<label class='col-sm-3 col-form-label'>Received:</label><label class='col-sm-4 col-form-label'>" + Number(out.Received / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Sent:</label><label class='col-sm-4 col-form-label'>" + Number(out.Sent / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Fees Paid:</label><label class='col-sm-3 col-form-label'>" + Number(out.FeesPaid / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Forged Rewards:</label><label class='col-sm-3 col-form-label'>" + Number(out.ForgedRewards / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'>Fees Received:</label><label class='col-sm-3 col-form-label'>" + Number(out.FeesReceived / 100000000).toLocaleString() + "</label><br />" +
    "<label class='col-sm-3 col-form-label'><b>TOTAL</b>:</label><label class='col-sm-3 col-form-label'>" + Number(out.Total / 100000000).toLocaleString() + "</label>";
  }).catch(err => console.error(err));

}
