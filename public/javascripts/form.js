(function(){
var cards = document.getElementsByClassName("card");
var stack = [];
var initialClassPrefCard = cards[0].className;
var initialClassPrefBtn = document.getElementById("pref-btn-submit").className;

  //init stack
  for(var i=cards.length-1;i>-1;i--){
    stack.push(i);
    
  }
  
  for(var i=0;i<cards.length;i++){
    cards[i].onclick = function(){
      
      var card = this,
          cardNumber = this.getElementsByClassName('card-number')[0],
          cardSelect = this.getElementsByTagName('select')[0];
      
      
      if(cardSelect.value ==""){
        var value = stack.pop();
        cardNumber.innerHTML = value +1;
        cardSelect.value = value;
        card.className += " choosen-card";
      }else{
        var value = cardSelect.value;
        cardSelect.value= "";
        cardNumber.innerHTML = "";
        stack.push(+value);
        card.className = initialClassPrefCard;
      }

      if(stack.length == 0)
	document.getElementById("pref-btn-submit").className +=" glowing-btn";
      else
	document.getElementById("pref-btn-submit").className = initialClassPrefBtn;
      
    };
    //on cache et initialise
    cards[i].getElementsByTagName('select')[0].style.display = "none";
    cards[i].getElementsByTagName('select')[0].value = "";
  };
  
})();

(function(){
  var mentions = document.getElementsByClassName("card-jug");
  var mentionsState = {};
  var initialClassJugBtn = document.getElementById("jug-btn-submit").className;
  
  for(var i=0;i<mentions.length;i++){
    var mention = mentions[i];

    mention.onclick = function(){
      var radios = this.getElementsByTagName("input");
      var check = false;
      var allCheck = true;

      for(var j=0;j<radios.length;j++){
	check = check || radios[j].checked;
      }

      mentionsState[radios[0].name] = check;

      for(name in mentionsState){
	console.log(name,mentionsState[name])
	allCheck = allCheck && mentionsState[name];
      }

      if(allCheck)
	document.getElementById("jug-btn-submit").className +=" glowing-btn";
      else
	document.getElementById("jug-btn-submit").className = initialClassJugBtn;
    }
    
    mentionsState[mention.getElementsByTagName("input")[0].name] = false;
  }
}());
