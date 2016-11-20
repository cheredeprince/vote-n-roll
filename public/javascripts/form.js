
window.onload = function(){
  var cards = document.getElementsByClassName("card");
  var stack = [];
  
  //init stack
  for(var i=cards.length-1;i>-1;i--){
    stack.push(i);
    
  }
  
  for(var i=0;i<cards.length;i++){
    cards[i].onclick = function(){
      var cardNumber = this.getElementsByClassName('card-number')[0],
          cardSelect = this.getElementsByTagName('select')[0];
      
      console.log(cardSelect.value)

      
      if(cardSelect.value ==""){
        var value = stack.pop();
        cardNumber.innerHTML = value +1;
        cardSelect.value = value;
      }else{
        var value = cardSelect.value;
        cardSelect.value= "";
        cardNumber.innerHTML = "";
        stack.push(+value);
      }
    };
    //on cache et initialise
    cards[i].getElementsByTagName('select')[0].style.display = "none";
    cards[i].getElementsByTagName('select')[0].value = "";
  };
  
}














