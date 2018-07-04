//===================================================================
// Eventos de Botões
//===================================================================

$('#form-create').on('submit', function(event){
  alert('Salvar evento...');
  
  event.preventDefault();
  var form = $(event.target);
  var e = {    
    //start: form.find('.start').data("DateTimePicker").date().unix(),
    //end: form.find('.end').data("DateTimePicker").date().unix(),
    title: form.find('.title').val(),
    category: form.find('.category').val()
  };
  $('#modal-create').modal('hide');
  /*
  eventsDB.put(e).then(function(response){
    e._rev = response.rev;
    Calendar.addEvents(e);
    Calendar.init();
    $('#modal-create').modal('hide');
  }).catch(function(err){
    console.error(err);
  });*/
});
