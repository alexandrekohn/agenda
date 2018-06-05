function GetDataAtual()
    {
      var d = new Date();
      return d.getFullYear()+"-"+(parseInt(d.getMonth()+1))+"-"+d.getDate();
    }